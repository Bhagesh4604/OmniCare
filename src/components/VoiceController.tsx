
import React, { useEffect, useState } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { Mic, MicOff, Globe, Sparkles, Volume2, X, User, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceAvatar from './3d/VoiceAvatar';

type LanguageCode = 'en-US' | 'hi-IN' | 'mr-IN';

export default function VoiceController() {
    const [language, setLanguage] = useState<LanguageCode>('en-US');
    const [isExpanded, setIsExpanded] = useState(false);

    // Using the upgraded Global Azure-Powered Hook
    const { isListening, transcript, startListening, stopListening, agentSpeaking, reply } = useSpeechRecognition({
        language
    });

    const [connectionStatus, setConnectionStatus] = useState<"connecting" | "online" | "offline">("connecting");

    useEffect(() => {
        // Check Health Check Logic
        fetch('/api/health/ai-status')
            .then(res => res.json())
            .then(data => {
                if (data.services.speech) {
                    setConnectionStatus("online");
                } else {
                    console.warn("Speech Service not configured.");
                    setConnectionStatus("offline");
                }
            })
            .catch(() => setConnectionStatus("offline"));
    }, []);

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // Dynamic Glow Color based on State
    const getGlowColor = () => {
        if (isListening) return "shadow-[0_0_50px_rgba(239,68,68,0.6)] border-red-500/50"; // Red
        if (agentSpeaking) return "shadow-[0_0_50px_rgba(34,197,94,0.6)] border-green-500/50"; // Green
        return "shadow-[0_0_30px_rgba(59,130,246,0.4)] border-blue-500/30"; // Blue Idle
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            className="fixed z-[9999] cursor-move touch-none bottom-8 right-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className="relative group flex flex-col items-center justify-center">

                {/* 1. Holographic Ring (Outer Orbit) */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-[-10px] rounded-full border border-dashed border-white/20 pointer-events-none`}
                />

                {/* 2. Main Orb Container */}
                <button
                    onPointerDown={(e) => {
                        // e.stopPropagation(); // Allow drag
                    }}
                    onClick={toggleListening}
                    className={`relative flex items-center justify-center w-24 h-24 bg-black/60 backdrop-blur-xl rounded-full border transition-all duration-500 ${getGlowColor()} overflow-hidden group-hover:scale-105 active:scale-95`}
                >
                    {/* Inner Noise Texture / Grid */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 mix-blend-overlay"></div>

                    {/* The 3D Avatar */}
                    <div className="relative z-10 w-full h-full transform scale-125">
                        <VoiceAvatar isListening={isListening} isSpeaking={agentSpeaking} />
                    </div>

                    {/* Status Icons Overlay */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
                        {isListening ? (
                            <motion.div
                                animate={{ height: [4, 12, 4] }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                                className="w-1 bg-red-500 rounded-full"
                            />
                        ) : (
                            <Mic size={12} className="text-white/50" />
                        )}
                    </div>
                </button>

                {/* 3. "Holographic Projection" Transcript */}
                <AnimatePresence>
                    {(transcript || reply || agentSpeaking) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9, height: 0 }}
                            animate={{ opacity: 1, y: -20, scale: 1, height: 'auto' }}
                            exit={{ opacity: 0, y: 10, scale: 0.9, height: 0 }}
                            className="absolute bottom-full mb-4 w-72 origin-bottom"
                        >
                            <div className="relative p-4 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 text-white shadow-2xl">
                                {/* Decor: Connector Line */}
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/80 border-r border-b border-white/10 rotate-45 transform"></div>

                                {/* Header */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={14} className="text-blue-400" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-blue-400">AI Assistant</span>
                                    </div>
                                    {agentSpeaking && <Activity size={14} className="text-green-400 animate-pulse" />}
                                </div>

                                {/* Content */}
                                <div className="space-y-2">
                                    {transcript && (
                                        <div className="flex gap-2">
                                            <div className="w-1 bg-gray-600 rounded-full"></div>
                                            <p className="text-gray-300 text-sm italic leading-relaxed">"{transcript}"</p>
                                        </div>
                                    )}
                                    {reply && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="pt-2 border-t border-white/10"
                                        >
                                            <p className="text-white text-sm font-medium leading-relaxed bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                                                {reply}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 4. Idle Badge (Only when quiet) */}
                {!isListening && !agentSpeaking && !reply && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute top-0 right-0 -mt-1 -mr-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black"
                    >
                        <Zap size={12} fill="white" className="text-white" />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
