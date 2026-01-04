import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, Shield, Phone, Clock, MapPin, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
    {
        id: 1,
        title: "AI Health Assistant",
        desc: "24/7 Symptom Analysis. Chat with our advanced AI to get instant medical guidance.",
        icon: Zap,
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
        color: "bg-teal-500",
        text: "text-teal-900"
    },
    {
        id: 2,
        title: "Smart Vitals Tracking",
        desc: "Real-time monitoring. Connect wearables to track heart rate and oxygen levels.",
        icon: Activity,
        image: "https://images.unsplash.com/photo-1576091160550-217358c7c8c8?q=80&w=800&auto=format&fit=crop",
        color: "bg-indigo-500",
        text: "text-indigo-900"
    },
    {
        id: 3,
        title: "Secure Digital Records",
        desc: "Encrypted history. Access prescriptions and reports instantly from your secure vault.",
        icon: Shield,
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
        color: "bg-blue-500",
        text: "text-blue-900"
    },
    {
        id: 4,
        title: "Instant Ambulance",
        desc: "One-tap emergency response with GPS tracking and paramedic pre-arrival care.",
        icon: Phone,
        image: "https://images.unsplash.com/photo-1554734867-bf3c00a72b71?q=80&w=800&auto=format&fit=crop",
        color: "bg-red-500",
        text: "text-red-900"
    },
    {
        id: 5,
        title: "Zero-Wait Scheduling",
        desc: "Live Queue Updates. Book appointments and never wait in a crowded lobby again.",
        icon: Clock,
        image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop",
        color: "bg-amber-500",
        text: "text-amber-900"
    },
    {
        id: 6,
        title: "Nearby Care Locator",
        desc: "Find care instantly. Integrated maps guide you to the nearest pharmacy or clinic.",
        icon: MapPin,
        image: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=800&auto=format&fit=crop",
        color: "bg-emerald-500",
        text: "text-emerald-900"
    }
];

export const Feature3DCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % features.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
    };

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, []);

    const getProperties = (index) => {
        // Calculate abstract distance from active index, handling wrap-around for visual continuity if needed,
        // but simple distance is often cleaner for 3D stacks unless strictly circular.
        // Here we'll treat it as a circular deck for logic but display 3 items visually differently.

        let offset = (index - activeIndex);
        // Normalize offset to -2, -1, 0, 1, 2 range for wrapping effects
        const len = features.length;
        if (offset > len / 2) offset -= len;
        if (offset < -len / 2) offset += len;

        const isActive = offset === 0;
        const isPrev = offset === -1;
        const isNext = offset === 1;
        const isFarPrev = offset <= -2;
        const isFarNext = offset >= 2;

        let zIndex = 0;
        let x = '0%';
        let scale = 1;
        let rotateY = 0;
        let opacity = 1;
        let z = 0;

        if (isActive) {
            zIndex = 30;
            scale = 1.1;
            opacity = 1;
            z = 0;
        } else if (isPrev) {
            zIndex = 20;
            x = '-60%';
            scale = 0.85;
            rotateY = 35;
            opacity = 0.7;
            z = -100;
        } else if (isNext) {
            zIndex = 20;
            x = '60%';
            scale = 0.85;
            rotateY = -35;
            opacity = 0.7;
            z = -100;
        } else {
            // Hide others behind
            zIndex = 10;
            x = offset < 0 ? '-100%' : '100%';
            scale = 0.6;
            opacity = 0;
            z = -200;
        }

        return { zIndex, x, scale, rotateY, opacity, z, isActive };
    };

    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden perspective-1000">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-10" />

            <div className="max-w-7xl mx-auto px-6 text-center mb-12">
                <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                    Empowering You with <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Advanced Health Tech</span>
                </h2>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                    Software that works for <em>you</em>. Explore our patient-first features designed for modern healthcare.
                </p>
            </div>

            <div className="relative h-[600px] flex items-center justify-center w-full max-w-6xl mx-auto overflow-hidden">
                {features.map((feature, index) => {
                    const props = getProperties(index);
                    if (props.opacity === 0) return null; // Optimization: Don't render hidden/far cards

                    return (
                        <motion.div
                            key={feature.id}
                            layout
                            initial={false}
                            animate={{
                                zIndex: props.zIndex,
                                x: props.x,
                                scale: props.scale,
                                rotateY: props.rotateY,
                                opacity: props.opacity,
                                z: props.z
                            }}
                            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] md:w-[400px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden cursor-pointer"
                            style={{
                                transformStyle: 'preserve-3d',
                                transformOrigin: 'center center' // Ensure rotation happens around center
                            }}
                            onClick={() => setActiveIndex(index)}
                        >
                            {/* Card Image */}
                            <div className="h-[60%] w-full relative">
                                <div className={`absolute inset-0 ${feature.color} opacity-20 z-10`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-20" />
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className={`absolute top-4 right-4 z-30 w-12 h-12 rounded-xl bg-white/90 backdrop-blur flex items-center justify-center shadow-lg`}>
                                    <feature.icon className={`w-6 h-6 ${feature.text.replace('900', '600')}`} />
                                </div>
                                <div className="absolute bottom-4 left-4 z-30 text-white">
                                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="h-[40%] p-6 flex flex-col justify-between bg-white text-left">
                                <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                                    {feature.desc}
                                </p>
                                <Button
                                    className={`w-full rounded-xl ${props.isActive ? 'bg-slate-900' : 'bg-slate-200 text-slate-500'} transition-colors`}
                                    variant={props.isActive ? "default" : "secondary"}
                                >
                                    Learn More <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>

                            {/* Dimming overlay for inactive cards */}
                            {!props.isActive && (
                                <div className="absolute inset-0 bg-white/40 z-40 pointer-events-none" />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-center gap-4 mt-8">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12 border-slate-200 bg-white hover:bg-slate-50"
                    onClick={prevSlide}
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </Button>
                <div className="flex gap-2 items-center">
                    {features.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${idx === activeIndex ? 'bg-teal-500 w-8' : 'bg-slate-300 hover:bg-slate-400'}`}
                        />
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12 border-slate-200 bg-white hover:bg-slate-50"
                    onClick={nextSlide}
                >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </Button>
            </div>
        </section>
    );
};
