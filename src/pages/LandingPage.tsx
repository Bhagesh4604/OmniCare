import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, Shield, Activity, Clock, Zap,
    MapPin, Phone, Mail, ChevronRight, Play, Star, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { HealthIdentityCard, PhoneMockup, TestimonialCard } from '@/components/landing/KlarityComponents';
import { ParallaxScroll } from '@/components/landing/ParallaxScroll';
import { InfiniteMarquee } from '@/components/landing/InfiniteMarquee';
import { WhatsAppShowcase } from '@/components/landing/WhatsAppShowcase';
// import { DynamicHero } from '@/components/landing/DynamicHero'; // Replaced with inline premium hero
import TriageChatModal from '@/components/TriageChatModal';
import { HorizontalScrollFeatures } from '@/components/landing/HorizontalScrollFeatures';
import { HealthInsightsSection } from '@/components/landing/HealthInsightsSection';
import { ScrollingFeatureShowcase } from '@/components/ui/interactive-scrolling-story-component';

// --- PREMIUM COMPONENTS ---
const Navbar = () => {
    const navigate = useNavigate();
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/5 dark:bg-black/5 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl">
                            <span className="bg-clip-text text-transparent bg-gradient-to-tr from-teal-400 to-blue-500">O</span>
                        </div>
                    </div>
                    <span className="font-bold text-2xl tracking-tighter text-slate-900 dark:text-white">Omni<span className="text-teal-500">Care</span></span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    {['Features', 'App', 'Testimonials'].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors relative group">
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500 transition-all group-hover:w-full"></span>
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/login')} className="hidden md:block text-sm font-bold text-slate-600 dark:text-gray-300 hover:text-teal-500 transition-colors">
                        Log In
                    </button>
                    <Button onClick={() => navigate('/register/patient')} className="bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-105 transition-transform rounded-full px-8 py-6 shadow-[0_0_20px_rgba(20,184,166,0.5)] border border-teal-500/20">
                        Get Started <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </div>
        </nav>
    );
};

const PremiumHero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-slate-50 dark:bg-black">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-sm font-semibold mb-6 animate-pulse">
                        ✨ Recall the Future of Healthcare
                    </span>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 leading-tight">
                        Health. <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 animate-gradient-animation">Reimagined.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Experience the first <span className="font-bold text-slate-900 dark:text-white">AI-Native Hospital System</span>. Real-time diagnostics, digital twins, and seamless care—all in one premium platform.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button className="h-14 px-8 text-lg rounded-full bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-105 transition-transform shadow-2xl shadow-teal-500/20">
                            Start Evaluation
                        </Button>
                        <Button variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-slate-100 dark:hover:bg-white/10">
                            <Play className="mr-2 w-5 h-5 fill-current" /> Watch Verify Demo
                        </Button>
                    </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 -right-20 hidden lg:block"
                >
                    <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <Heart className="text-green-500 fill-green-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Heart Rate</p>
                            <p className="font-bold">72 BPM</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default function LandingPage() {
    const navigate = useNavigate();
    const [showTriageModal, setShowTriageModal] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black font-sans selection:bg-teal-500/30">
            <Navbar />
            <PremiumHero />

            {/* Existing Components with Wrapper for Spacing */}
            <div className="relative z-20 bg-white dark:bg-black rounded-[3rem] -mt-20 shadow-[0_-20px_60px_rgba(0,0,0,0.1)] pt-20">
                <HorizontalScrollFeatures />
                <ScrollingFeatureShowcase onOpenTriage={() => setShowTriageModal(true)} />
                <WhatsAppShowcase />

                {/* Enhanced Testimonials Section */}
                <section id="testimonials" className="py-32 bg-slate-50 dark:bg-[#0A0A0A] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-20">
                            <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-6">Loved by Thousands</h2>
                            <p className="text-xl text-slate-500">Join the healthcare revolution today.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <TestimonialCard name="Sarah J." role="Patient" text="Typically, healthcare apps are clunky. Omni Care feels like using a premium fintech app. Smooth, fast, and beautiful." />
                            <TestimonialCard name="Dr. Chen" role="Cardiologist" text="The Digital Twin visualization is a game changer for explaining conditions to patients." />
                            <TestimonialCard name="Mike R." role="User" text="I love the AI diagnostics. It's like having a doctor in my pocket 24/7." />
                        </div>
                    </div>
                </section>

                <HealthInsightsSection />

                {/* Footer */}
                <footer className="bg-slate-900 text-white pt-24 pb-12 border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold">Omni<span className="text-teal-500">Care</span></h3>
                            <p className="text-slate-400 leading-relaxed">The future of healthcare is here. Powered by Azure AI.</p>
                        </div>
                        {/* Links... */}
                        <div>
                            <h4 className="font-bold text-lg mb-6">Contact</h4>
                            <div className="space-y-4 text-slate-400">
                                <p className="flex items-center gap-3"><Mail className="w-5 h-5 text-teal-500" /> bhageshbiradar820@gmail.com</p>
                                <p className="flex items-center gap-3"><Phone className="w-5 h-5 text-teal-500" /> +917483159830</p>
                                <p className="flex items-center gap-3"><MapPin className="w-5 h-5 text-teal-500" /> Bangalore, India</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-slate-500 border-t border-white/5 pt-8">
                        &copy; 2025 Omni Care. Crafted with precision.
                    </div>
                </footer>
            </div>

            {showTriageModal && <TriageChatModal onClose={() => setShowTriageModal(false)} />}
        </div>
    );
}
