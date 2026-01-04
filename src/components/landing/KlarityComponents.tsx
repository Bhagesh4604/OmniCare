import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Download, Activity, Heart, Shield } from 'lucide-react';

// --- 1. The "Health ID" Card (Jane Doe example) ---
export const HealthIdentityCard = () => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative w-80 h-[28rem] bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 flex flex-col justify-between border border-white/40"
        >
            {/* Floating Badge */}
            <div className="absolute -right-4 top-8 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                <Check className="w-3 h-3" /> Verified Patient
            </div>

            <div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Omni Care</h3>
                <div className="mt-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden relative">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 uppercase font-semibold tracking-wider">Name</p>
                        <p className="text-xl font-bold text-slate-900">John Doe</p>
                    </div>
                </div>

                <div className="mt-6">
                    <span className="inline-block px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-500/30">
                        Active Coverage
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Latest Vitals</p>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-slate-700 font-medium flex items-center gap-2"><Heart className="w-4 h-4 text-red-500" /> 72 BPM</span>
                        <span className="text-slate-700 font-medium flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> 98% O2</span>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ShreeMedicareID" alt="QR" className="w-full h-full opacity-80 mix-blend-multiply" />
                </div>
                <p className="text-center text-[10px] text-slate-400 tracking-widest uppercase">Universal Health ID: ABC-123</p>
            </div>
        </motion.div>
    )
}

// --- 2. The Phone Mockup (App Showcase) ---
export const PhoneMockup = () => {
    return (
        <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-8 border-slate-900 shadow-2xl overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-xl z-20 w-40 mx-auto"></div>

            {/* Screen Content */}
            <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-teal-600 p-6 pt-12 text-white rounded-b-3xl shadow-lg z-10">
                    <div className="flex justify-between items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-white/20"></div>
                        <div className="w-8 h-8 rounded-full bg-white/20"></div>
                    </div>
                    <h2 className="text-2xl font-bold">Hello, John 👋</h2>
                    <p className="text-teal-100">Your health score is stable.</p>
                </div>

                {/* Graph Area */}
                <div className="flex-1 bg-slate-50 p-4 space-y-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between mb-4">
                            <h4 className="font-bold text-slate-700">Heart Rate</h4>
                            <span className="text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-lg text-xs">Live</span>
                        </div>
                        <div className="h-32 flex items-end justify-between gap-1">
                            {[40, 60, 45, 70, 50, 65, 55, 80, 60, 75].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    whileInView={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.1 }}
                                    className="w-full bg-gradient-to-t from-teal-500 to-cyan-400 rounded-t-sm opacity-80"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><AlertIcon /></div>
                            <div>
                                <p className="font-bold text-slate-800">Next Dose</p>
                                <p className="text-xs text-slate-500">Aspirin • 2:00 PM</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Nav */}
                <div className="bg-white border-t p-4 flex justify-between items-center text-slate-300">
                    <div className="w-6 h-6 rounded-full bg-teal-500"></div>
                    <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                    <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                </div>
            </div>
        </div>
    );
};

const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
)

// --- 3. Testimonial Card ---
interface TestimonialCardProps {
    name: string;
    role: string;
    text: string;
    rating?: number;
}

export const TestimonialCard = ({ name, role, text, rating = 5 }: TestimonialCardProps) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
    >
        <div className="flex gap-1 mb-4">
            {[...Array(rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">"{text}"</p>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400"></div>
            <div>
                <p className="font-bold text-slate-900 text-sm">{name}</p>
                <p className="text-xs text-slate-400">{role}</p>
            </div>
        </div>
    </motion.div>
)

// --- 4. AI Phone Mockup (Chat Interface) ---
export const AIPhoneMockup = () => {
    return (
        <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-8 border-slate-900 shadow-2xl overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-xl z-20 w-40 mx-auto"></div>

            {/* Screen Content */}
            <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-indigo-600 p-6 pt-12 text-white rounded-b-3xl shadow-lg z-10">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-lg">🤖</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">AI Assistant</h2>
                                <p className="text-indigo-200 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online 24/7</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-slate-50 p-4 space-y-4 overflow-hidden relative">

                    {/* Message 1: User */}
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        whileInView={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-end"
                    >
                        <div className="bg-white p-4 rounded-2xl rounded-tr-none shadow-sm border border-slate-100 max-w-[85%] text-sm text-slate-700">
                            I've been having a mild headache since morning.
                        </div>
                    </motion.div>

                    {/* Message 2: AI */}
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        whileInView={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: 1 }} // Longer delay to simulate typing
                        className="flex justify-start"
                    >
                        <div className="bg-indigo-600 p-4 rounded-2xl rounded-tl-none shadow-md max-w-[85%] text-sm text-white">
                            Based on your vitals, your hydration is low. Please drink water and rest. I'll check on you in an hour.
                        </div>
                    </motion.div>

                    {/* Simulated Typing Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 2, repeat: Infinity, repeatType: "reverse", duration: 1 }}
                        className="flex gap-1 ml-4"
                    >
                        <div className="w-2 h-2 bg-slate-300 rounded-full" />
                        <div className="w-2 h-2 bg-slate-300 rounded-full" />
                        <div className="w-2 h-2 bg-slate-300 rounded-full" />
                    </motion.div>

                    {/* Vitals Overlay Card */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-xl border border-teal-100 shadow-lg flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">❤️</div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold">LIVE VITALS</p>
                                <p className="text-sm font-bold text-slate-800">BP: 120/80 <span className="text-green-500 text-xs ml-1">Normal</span></p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Input Area (Visual only) */}
                <div className="bg-white border-t p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100" />
                    <div className="flex-1 h-10 bg-slate-50 rounded-full" />
                    <div className="w-8 h-8 rounded-full bg-indigo-500" />
                </div>
            </div>
        </div>
    );
};
