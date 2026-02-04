import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle, Activity, Zap, MessageSquare, Bot, Send } from 'lucide-react';

interface FeatureStep {
    id: number;
    title: string;
    description: string;
    image?: string;
    component?: React.ReactNode;
}

const AIHealthMockup = ({ onTryClick }: { onTryClick: () => void }) => {
    return (
        <div className="w-full h-full relative bg-slate-100 overflow-hidden flex items-center justify-center">
            {/* Abstract Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-50 to-emerald-50" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl" />

            {/* Phone UI Container */}
            <div className="relative z-10 w-[300px] bg-white rounded-3xl shadow-2xl border-4 border-slate-900 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-slate-900 text-white p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Dr. AI Assistant</p>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            <span className="text-[10px] text-slate-300">Online</span>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-4 space-y-4 bg-slate-50 relative">
                    {/* Bot Message */}
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex-shrink-0 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-teal-600" />
                        </div>
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-xs text-slate-600">
                            Hello! I noticed your heart rate is slightly elevated. How are you feeling today?
                        </div>
                    </div>

                    {/* User Message */}
                    <div className="flex gap-2 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-600">ME</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-2xl rounded-tr-none shadow-sm text-xs text-white">
                            I feel a bit dizzy and have a headache.
                        </div>
                    </div>

                    {/* Bot Message with Typing */}
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex-shrink-0 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-teal-600" />
                        </div>
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-xs text-slate-600">
                            I understand. Let's do a quick symptom check.
                        </div>
                    </div>
                </div>

                {/* Interactive CTA Overlay */}
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                    <Button
                        onClick={onTryClick}
                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8 py-6 text-lg font-bold shadow-xl shadow-teal-500/30 animate-pulse hover:scale-105 transition-all"
                    >
                        Try AI Symptom Checker
                        <MessageSquare className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

const VitalsTrackingMockup = () => {
    return (
        <div className="w-full h-full relative bg-slate-100 overflow-hidden flex items-center justify-center">
            {/* Abstract Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50" />

            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl" />
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-teal-200/20 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 md:pr-20">
                {/* Smart Watch Image - Hand */}
                <div className="hidden md:block relative w-64 h-80 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/50 rotate-[-5deg] hover:rotate-0 transition-all duration-500">
                    <img
                        src="https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=800&auto=format&fit=crop"
                        alt="Smart Watch on Hand"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white p-2">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="w-4 h-4 text-red-500 animate-pulse" />
                            <p className="text-xs font-medium opacity-90">Heart Rate</p>
                        </div>
                        <p className="font-bold text-3xl">72 <span className="text-sm font-normal opacity-70">BPM</span></p>
                    </div>
                </div>

                {/* Main Interface Card */}
                <div className="relative w-[300px] bg-white rounded-3xl shadow-2xl border-4 border-slate-900 overflow-hidden hover:scale-105 transition-transform duration-300">
                    {/* Header */}
                    <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                        <span className="font-bold text-sm">Vitals Monitor</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[10px] text-green-400">LIVE</span>
                        </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-6 space-y-6">
                        {/* Heart Rate Card */}
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-red-800 uppercase">Heart Rate</span>
                                <Activity className="w-4 h-4 text-red-500 animate-pulse" />
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-slate-900">72</span>
                                <span className="text-sm font-medium text-slate-500 mb-1">BPM</span>
                            </div>
                            {/* Fake Graph Line */}
                            <div className="mt-3 h-8 flex items-end gap-1">
                                {[40, 60, 45, 70, 50, 80, 60, 75, 55, 70].map((h, i) => (
                                    <div key={i} className="w-full bg-red-200 rounded-t-sm" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* SpO2 */}
                            <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-blue-800">SpO2</span>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-black text-slate-900">98</span>
                                    <span className="text-xs font-medium text-slate-500 mb-1">%</span>
                                </div>
                            </div>

                            {/* BP */}
                            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-amber-800">BP</span>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-black text-slate-900">120</span>
                                    <span className="text-xs font-medium text-slate-500 mb-1">/80</span>
                                </div>
                            </div>
                        </div>

                        {/* Wearable Status */}
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <Zap className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-700">Watch Series 8</p>
                                <p className="text-[10px] text-green-600 font-medium">Connected</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AmbulanceBookingMockup = () => {
    return (
        <div className="w-full h-full relative bg-slate-100 overflow-hidden flex items-center justify-center">
            {/* Map Background (Simulated) */}
            <div className="absolute inset-0 opacity-60">
                <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop"
                    alt="Map Background"
                    className="w-full h-full object-cover grayscale"
                />
            </div>

            {/* Pulse Effect Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-64 h-64 bg-red-500/20 rounded-full animate-ping absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="w-48 h-48 bg-red-500/30 rounded-full animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 delay-75" />
            </div>

            {/* Phone UI Container */}
            <div className="relative z-10 w-[300px] bg-white rounded-3xl shadow-2xl border-4 border-slate-900 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 text-white p-4 text-center">
                    <p className="font-bold text-sm">Emergency SOS</p>
                </div>

                {/* Map View Area */}
                <div className="h-64 bg-slate-100 relative flex items-center justify-center">
                    <img
                        src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=800&auto=format&fit=crop"
                        className="w-full h-full object-cover opacity-50"
                        alt="Map"
                    />
                    <div className="absolute text-red-600 animate-bounce">
                        <MapPin className="w-8 h-8 fill-current" />
                    </div>
                </div>

                {/* Controls */}
                <div className="p-6 bg-white text-center space-y-4">
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Your Location</p>
                        <p className="text-slate-900 font-medium text-sm">Sector 62, Noida, UP</p>
                    </div>

                    <Button className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/30 animate-pulse font-bold text-lg flex items-center justify-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        TAP TO REQUEST
                    </Button>

                    <p className="text-[10px] text-slate-400">Paramedic notified instantly</p>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ feature, i }: { feature: FeatureStep; i: number }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    // Parallax effects
    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

    return (
        <section ref={ref} className="min-h-screen flex items-center justify-center sticky top-0 overflow-hidden bg-black">

            {/* Text Content - Alternating Sides */}
            <div className={`absolute top-0 left-0 w-full h-full flex items-center ${i % 2 === 0 ? 'justify-start pl-10 md:pl-32' : 'justify-end pr-10 md:pr-32'} z-30 pointer-events-none`}>
                <motion.div
                    style={{ opacity, y }}
                    className="max-w-md bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl"
                >
                    <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md">{feature.title}</h2>
                    <p className="text-lg text-slate-100 leading-relaxed drop-shadow-sm">{feature.description}</p>
                </motion.div>
            </div>

            {/* Background Content (Image or Component) */}
            <motion.div
                style={{ scale }}
                className="absolute inset-0 z-0 flex items-center justify-center"
            >
                {feature.component ? (
                    <div className="w-full h-full pointer-events-auto">
                        {feature.component}
                    </div>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-black/40 z-10" />
                        <img
                            src={feature.image}
                            alt={feature.title}
                            className="w-full h-full object-cover"
                        />
                    </>
                )}
            </motion.div>
        </section>
    );
};

export const ScrollingFeatureShowcase = ({ onOpenTriage }: { onOpenTriage?: () => void }) => {

    // Moved features array inside to access props
    const features: FeatureStep[] = [
        {
            id: 1,
            title: "AI Health Assistant",
            description: "24/7 Personal Care. Chat with our advanced AI to analyze symptoms, get instant medical advice, and prepare for your doctor visit anytime, anywhere.",
            component: <AIHealthMockup onTryClick={onOpenTriage || (() => { })} />
        },
        {
            id: 2,
            title: "Smart Vitals Tracking",
            description: "Your health, monitored. Connect wearables to track heart rate, blood pressure, and oxygen levels. We alert you instantly if something looks off.",
            component: <VitalsTrackingMockup />
        },
        {
            id: 3,
            title: "Secure Digital Records",
            description: "Your history in your pocket. Access prescriptions, lab reports, and scans instantly from your secure encrypted vault. No more lost papers.",
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
        },
        {
            id: 4,
            title: "One-Tap Ambulance Booking",
            description: "Emergency? Don't panic. Just open the app and tap the SOS button. We instantly alert the nearest ambulance and share your live GPS location.",
            component: <AmbulanceBookingMockup />
        }
    ];

    return (
        <div className="relative bg-black">
            {/* Intro/Header Section */}
            <div className="h-[50vh] flex flex-col items-center justify-center text-center px-6 relative z-10 bg-slate-900 text-white">
                <h2 className="text-5xl font-bold mb-4 tracking-tight">Software Built for Your Health</h2>
                <p className="text-slate-400 text-xl max-w-2xl">
                    Experience healthcare that works for <em>you</em>. Scroll to see the powerful tools we put in your pocket.
                </p>
            </div>

            {features.map((feature, i) => (
                <FeatureItem key={feature.id} feature={feature} i={i} />
            ))}

            {/* Outro/Footer Spacer */}
            <div className="h-[20vh] bg-slate-900 flex items-center justify-center border-t border-slate-800">
                <p className="text-slate-500">Advanced Health Tech • Powered by AI</p>
            </div>
        </div>
    );
};
