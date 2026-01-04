import React from 'react';
import { motion } from 'framer-motion';
import { AIPhoneMockup } from './KlarityComponents';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/RainbowButton';
import { AuroraBackground } from '@/components/ui/AuroraBackground';

export const HealthInsightsSection = () => {
    return (
        <section className="relative py-32 px-0 md:px-0 overflow-hidden bg-white">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 min-h-[800px]">

                {/* --- LEFT SIDE: Gradient & Text --- */}
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="relative bg-slate-900 overflow-hidden flex flex-col justify-center"
                >
                    <AuroraBackground className="h-full w-full !items-start" showBlob2={false}>
                        <div className="relative z-10 p-12 md:p-24 max-w-lg">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-2 h-2 rounded-full bg-teal-400" />
                                <span className="text-teal-400 font-bold uppercase tracking-widest text-xs">AI-Powered Care</span>
                            </div>

                            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight text-white">
                                Your Personal <br />
                                AI Health Assistant.
                            </h2>

                            <p className="text-slate-300 text-lg leading-relaxed mb-10">
                                Experience 24/7 care with our advanced AI. Chat instantly to analyze symptoms, clarify doubts, and receive personalized medication reminders—just like having a doctor in your pocket.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <RainbowButton className="rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-white/10">
                                    Try AI Symptom Checker
                                </RainbowButton>
                            </div>
                        </div>
                    </AuroraBackground>
                </motion.div>


                {/* --- RIGHT SIDE: Lifestyle Image & Context --- */}
                <div className="relative bg-slate-50 flex items-center justify-center md:justify-end overflow-hidden">

                    {/* Background Image/Setting */}
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80')] bg-cover bg-center opacity-80"
                    >
                        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
                    </motion.div>



                </div>

                {/* --- CENTER: Phone Mockup (Overlapping) --- */}
                <motion.div
                    initial={{ y: 200, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 z-20 scale-75 md:scale-90 shadow-2xl rounded-[3rem]"
                >
                    <AIPhoneMockup />
                </motion.div>

            </div>
        </section>
    );
};
