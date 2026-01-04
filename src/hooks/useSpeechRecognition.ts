import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

export default function useSpeechRecognition({ commandMode = true, language = 'en-US', onResult = (text: string) => { } } = {}) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [agentSpeaking, setAgentSpeaking] = useState(false);

    const navigate = useNavigate();
    const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);

    // Refs for safe callback access
    const onResultRef = useRef(onResult);
    const commandModeRef = useRef(commandMode);
    const languageRef = useRef(language);

    const lastCommandTime = useRef<number>(0);

    // Keep refs updated
    useEffect(() => {
        onResultRef.current = onResult;
        commandModeRef.current = commandMode;
    }, [onResult, commandMode]);

    useEffect(() => {
        languageRef.current = language;
    }, [language]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognizerRef.current) {
                recognizerRef.current.close();
                recognizerRef.current = null;
            }
        };
    }, []);

    const agentSpeakingRef = useRef(false);

    // Helper for Text-to-Speech Feedback (The "Agent" Voice)
    const speak = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        // STATE UPDATE: Mark agent as speaking
        setAgentSpeaking(true);
        agentSpeakingRef.current = true;

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();

        // Try to match voice to language
        let preferredVoice = null;
        if (languageRef.current.startsWith('hi')) {
            preferredVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi'));
        } else if (languageRef.current.startsWith('mr')) {
            preferredVoice = voices.find(v => v.lang.includes('mr') || v.name.includes('Marathi'));
        }

        if (!preferredVoice) {
            preferredVoice = voices.find(v => v.name.includes('Neural') || v.name.includes('Google US English'));
        }

        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.rate = 1.0;

        utterance.onend = () => {
            setAgentSpeaking(false);
            agentSpeakingRef.current = false;
        };

        window.speechSynthesis.speak(utterance);
    };

    const handleCommand = async (text: string) => {
        const now = Date.now();
        // Debounce: prevent rapid-fire sending
        if (now - lastCommandTime.current < 2000) return;

        console.log("Sending to Agent:", text);

        try {
            // 1. Tell the Cloud Agent what the user said
            const response = await fetch('/api/agent/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, language: languageRef.current }) // Send full text + language
            });
            const data = await response.json();

            // 2. The Agent replies (Conversational)
            if (data.reply) {
                speak(data.reply);
            }

            // 3. The Agent commands an ACTION (Function Call)
            if (data.action) {
                console.log("Agent Action:", data.action);
                const { type, payload } = data.action;

                if (type === 'navigate') {
                    const module = payload.destination;

                    // Route Logic
                    if (module === 'paramedic') navigate('/paramedic-mode');
                    else if (module === 'fleet') navigate('/fleet-management');
                    else if (module === 'patient-portal') navigate('/patient-dashboard');
                    else if (module === 'telemedicine') navigate('/patient-dashboard'); // Map to patient portal
                    else if (module === 'patient-book-ambulance') navigate('/patient/book-ambulance'); // Specific Route
                    else if (module.startsWith('patient-')) {
                        // Handle Patient Specific Tabs (appointments, medications, etc)
                        const tab = module.replace('patient-', '');

                        // Navigate to dashboard first if not there
                        if (window.location.pathname !== '/patient-dashboard') {
                            navigate('/patient-dashboard');
                            // Short delay to allow mount
                            setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('switch-patient-tab', { detail: tab }));
                            }, 500);
                        } else {
                            // Direct switch
                            window.dispatchEvent(new CustomEvent('switch-patient-tab', { detail: tab }));
                        }
                    }
                    else {
                        // Internal Staff Dashboard Tab Switch
                        window.dispatchEvent(new CustomEvent('switch-module', { detail: module }));
                        navigate('/staff-dashboard');
                    }
                }
                else if (type === 'fill_form') {
                    // DOM Action: Fill Input
                    executeDOMAction('fill', payload);
                }
                else if (type === 'click_element') {
                    // DOM Action: Click Button
                    executeDOMAction('click', payload);
                }
                else if (type === 'open_modal') {
                    const { modal } = payload;
                    // Dispatch Custom Event for Dashboard to catch
                    window.dispatchEvent(new CustomEvent('open-modal', { detail: modal }));
                }
                // Check Inventory & Get Patient Status are handled by the server generating a 'reply' string
                // so no client-side action is strictly needed unless we want to open a modal.
            }

        } catch (error) {
            console.error("Agent Error:", error);
            speak("I'm sorry, I couldn't reach the brain."); // Keep short
        }

        lastCommandTime.current = Date.now();
    };

    // --- DOM MANIPULATION HELPER (The "Hands") ---
    const executeDOMAction = (actionType: 'fill' | 'click', payload: any) => {
        setTimeout(() => {
            if (actionType === 'fill') {
                const { field_label, value } = payload;
                const lowerLabel = field_label.toLowerCase();

                // 1. Try to find input by placeholder
                let input = Array.from(document.querySelectorAll('input, textarea')).find(el => {
                    const place = (el as HTMLInputElement).placeholder?.toLowerCase() || '';
                    const name = (el as HTMLInputElement).name?.toLowerCase() || '';
                    return place.includes(lowerLabel) || name.includes(lowerLabel);
                });

                if (input) {
                    (input as HTMLInputElement).value = value;
                    // React event dispatch hack to ensure state updates
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    (input as HTMLElement).focus();
                } else {
                    console.log(`Could not find input for: ${field_label}`);
                }
            }

            if (actionType === 'click') {
                const { element_text } = payload;
                const lowerText = element_text.toLowerCase();

                // 2. Try to find button by text
                const buttons = Array.from(document.querySelectorAll('button, a'));
                const target = buttons.find(el => el.textContent?.toLowerCase().includes(lowerText));

                if (target) {
                    (target as HTMLElement).click();
                    (target as HTMLElement).focus(); // Give visual feedback
                } else {
                    console.log(`Could not find button: ${element_text}`);
                }
            }
        }, 500); // Small delay to allow page load/modal open
    };

    const startListening = useCallback(async () => {
        // Prevent double start or starting while AI is speaking
        if (isListening || agentSpeakingRef.current) return;
        if (recognizerRef.current) return; // already active

        try {
            // 1. Fetch Token
            const response = await fetch('/api/speech/token');
            if (!response.ok) throw new Error('Failed to fetch speech token');
            const { token, region } = await response.json();

            // 2. Configure SDK
            const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
            speechConfig.speechRecognitionLanguage = languageRef.current;

            const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
            const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

            recognizerRef.current = recognizer;

            // 3. Setup Events
            recognizer.recognizing = (s, e) => {
                // Ignore while agent is speaking
                if (agentSpeakingRef.current) return;
                setTranscript(e.result.text);
            };

            recognizer.recognized = (s, e) => {
                if (agentSpeakingRef.current) return;
                if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                    const text = e.result.text;
                    setTranscript(text);
                    if (onResultRef.current) onResultRef.current(text);

                    // Trigger Agent processing
                    if (commandModeRef.current) {
                        handleCommand(text);
                    }
                }
            };

            recognizer.canceled = (s, e) => {
                console.log(`CANCELED: Reason=${e.reason}`);
                setIsListening(false);
                if (recognizerRef.current) {
                    recognizerRef.current.close();
                    recognizerRef.current = null;
                }
            };

            recognizer.sessionStopped = (s, e) => {
                console.log("Session stopped.");
                setIsListening(false);
                if (recognizerRef.current) {
                    recognizerRef.current.close();
                    recognizerRef.current = null;
                }
            };

            // 4. Start
            await recognizer.startContinuousRecognitionAsync(() => {
                setIsListening(true);
            }, (err) => {
                console.error(err);
                setIsListening(false);
            });

        } catch (error) {
            console.error("Azure Speech Error:", error);
            // alert("Failed to start Azure Speech."); 
            setIsListening(false);
        }
    }, [isListening, agentSpeaking]);

    const stopListening = useCallback(() => {
        if (recognizerRef.current) {
            recognizerRef.current.stopContinuousRecognitionAsync(() => {
                setIsListening(false);
                if (recognizerRef.current) {
                    recognizerRef.current.close();
                    recognizerRef.current = null;
                }
            });
        }
    }, []);

    return { isListening, transcript, startListening, stopListening, agentSpeaking };
}
