import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, MoreVertical, Paperclip, Camera, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatsAppSimulator() {
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: "Hello! I am MedAssist. How can I help you today? (Try: 'Book appointment' or 'I have fever')" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8080/api/whatsapp/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    phoneNumber: "1234567890", // Mock phone
                    language: language
                })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            console.error("Error sending message", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to server." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg mb-4 flex gap-4">
                <label className="flex items-center gap-2 text-sm font-medium dark:text-gray-200">
                    Simulation Language:
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="mr">Marathi</option>
                    </select>
                </label>
            </div>

            {/* PHONE FRAME */}
            <div className="relative w-[380px] h-[750px] bg-black rounded-[40px] shadow-2xl border-[8px] border-gray-900 overflow-hidden ring-4 ring-gray-300 dark:ring-gray-700">

                {/* WHATSAPP HEADER */}
                <div className="bg-[#075e54] text-white p-3 pt-8 flex items-center gap-3 shadow-md z-10 relative">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#075e54] font-bold text-lg">
                        M
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-lg">MedAssist AI</div>
                        <div className="text-xs opacity-80">Online</div>
                    </div>
                    <div className="flex gap-4 pr-2">
                        <Video size={20} />
                        <Phone size={20} />
                        <MoreVertical size={20} />
                    </div>
                </div>

                {/* CHAT AREA (Background Image) */}
                <div
                    className="flex-1 h-[calc(100%-130px)] bg-[#e5ddd5] dark:bg-[#0b141a] overflow-y-auto p-4 flex flex-col gap-3 relative"
                    ref={scrollRef}
                >
                    {/* Doodle Background Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                        backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                        backgroundRepeat: 'repeat'
                    }} />

                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative z-10 max-w-[80%] p-2 px-3 rounded-lg text-sm shadow-sm ${msg.role === 'user'
                                    ? 'self-end bg-[#dcf8c6] dark:bg-[#005c4b] text-black dark:text-gray-100 rounded-tr-none'
                                    : 'self-start bg-white dark:bg-[#202c33] text-black dark:text-gray-100 rounded-tl-none'
                                }`}
                        >
                            {msg.content}
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 text-right mt-1 flex items-center justify-end gap-1">
                                10:3{i} AM {msg.role === 'user' && <span className="text-blue-500">✓✓</span>}
                            </div>
                        </motion.div>
                    ))}

                    {loading && (
                        <div className="self-start bg-white dark:bg-[#202c33] p-2 rounded-lg rounded-tl-none relative z-10 shadow-sm">
                            <div className="flex gap-1 h-2 items-center px-1">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                            </div>
                        </div>
                    )}
                </div>

                {/* INPUT AREA */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#f0f0f0] dark:bg-[#202c33] p-2 flex items-center gap-2">
                    <div className="bg-white dark:bg-[#2a3942] flex-1 rounded-full p-2 px-4 flex items-center gap-2 shadow-sm">
                        <span className="text-gray-400"><span className="text-lg">☺</span></span>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            className="flex-1 bg-transparent focus:outline-none dark:text-white placeholder-gray-500"
                            placeholder="Type a message"
                        />
                        <Paperclip size={18} className="text-gray-500 rotate-[-45deg]" />
                        <Camera size={18} className="text-gray-500" />
                    </div>
                    <button
                        onClick={handleSend}
                        className="p-3 bg-[#00a884] rounded-full text-white shadow-md hover:bg-[#008f6f] transition-colors"
                    >
                        {input.trim() ? <Send size={18} /> : <Mic size={18} />}
                    </button>
                    {/* Home Bar Indicator */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full" />
                </div>
            </div>
        </div>
    );
}
