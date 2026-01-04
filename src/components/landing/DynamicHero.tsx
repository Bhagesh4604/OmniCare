import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneMockup } from './KlarityComponents'; // Reusing existing mockup
import { AuroraBackground } from '../ui/AuroraBackground';

// Theme definitions matching the "Aurora" style
const themes = [
    {
        id: 'cardio',
        // Strong Red/Pink vs Deep Blue
        leftBlob: 'bg-rose-500',
        rightBlob: 'bg-indigo-600',
        accent: 'text-rose-400',
        lineColor: 'bg-rose-500',
        indicatorPos: '20%',
        label: 'Heart Health'
    },
    {
        id: 'fitness',
        // Bright Cyan vs Teal
        leftBlob: 'bg-cyan-400',
        rightBlob: 'bg-teal-600',
        accent: 'text-cyan-400',
        lineColor: 'bg-cyan-400',
        indicatorPos: '60%',
        label: 'Activity'
    },
    {
        id: 'sleep',
        // Violet vs Deep Purple
        leftBlob: 'bg-violet-500',
        rightBlob: 'bg-purple-800',
        accent: 'text-violet-400',
        lineColor: 'bg-violet-500',
        indicatorPos: '85%',
        label: 'Sleep'
    }
];

export const DynamicHero = () => {
    const [activeTheme, setActiveTheme] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTheme((prev) => (prev + 1) % themes.length);
        }, 4000); // Change every 4 seconds
        return () => clearInterval(interval);
    }, []);

    const theme = themes[activeTheme];

    return (
        <AuroraBackground className="pt-20">
            {/* Subtle vignettes to keep focus center - Optional, Aurora handles this mostly but we can keep a slight overlay if needed. Let's trust Aurora's new look. */}

            <div className="relative z-10 container mx-auto px-6 text-center text-white mt-10">
                <motion.h1
                    key={theme.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl md:text-8xl font-bold mb-6 tracking-tight drop-shadow-2xl"
                >
                    Taking control of your <br />
                    <span className="text-white">
                        {theme.label}
                    </span>
                </motion.h1>

                <p className="max-w-2xl mx-auto text-lg text-slate-300 mb-10 leading-relaxed drop-shadow-md font-medium">
                    Empowering you to keep vaccination records safe and receive renewal notifications. Gather, store and share your personal medical and lifestyle data.
                </p>

                <div className="flex justify-center gap-4 mb-20">
                    <button className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        App Store
                    </button>
                    <button className="px-8 py-3 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-full font-bold hover:bg-white/10 transition-colors shadow-lg">
                        Google Play
                    </button>
                </div>

                {/* Main Visual Composition */}
                <div className="relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-8">

                    {/* Left: BP Line / Health Metric */}
                    <div className="hidden md:block relative h-40">
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            layout
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-64 bg-white/5 backdrop-blur-3xl rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                        >
                            <div className="flex justify-between text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider">
                                <span>Low</span>
                                <span>Normal</span>
                                <span>High</span>
                            </div>
                            {/* The BP Line Container */}
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                                {/* The Colored Line */}
                                <motion.div
                                    className={`absolute top-0 bottom-0 left-0 ${theme.lineColor}`}
                                    animate={{ width: theme.indicatorPos }}
                                    transition={{ duration: 1, ease: 'easeInOut' }}
                                />
                            </div>
                            {/* Heart Icon Indicator */}
                            <motion.div
                                className="w-6 h-6 bg-white rounded-full shadow-lg absolute mt-[-15px] flex items-center justify-center text-[10px]"
                                animate={{ left: theme.indicatorPos, x: '-50%' }}
                                transition={{ duration: 1, ease: 'easeInOut' }}
                            >
                                ❤️
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Center: Phone Mockup */}
                    {/* Animates UP first ("come upside") */}
                    <motion.div
                        initial={{ y: 150, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative z-20 flex justify-center scale-110 drop-shadow-2xl"
                    >
                        <PhoneMockup />
                    </motion.div>

                    {/* Right: Stats/Rating */}
                    <div className="hidden md:block relative h-40">
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            layout
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-64 bg-white/5 backdrop-blur-3xl rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] text-left"
                        >
                            <div className="flex gap-1 text-yellow-400 mb-2">
                                {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
                            </div>
                            <div className="text-3xl font-bold text-white">4.9/5</div>
                            <div className="text-sm text-slate-300 font-medium">Trusted by millions</div>
                        </motion.div>
                    </div>
                </div>

            </div>
        </AuroraBackground>
    );
};
