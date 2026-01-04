import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Zap, Activity, Shield, Phone, Clock, MapPin, ArrowUpRight } from 'lucide-react';

const features = [
    {
        id: 1,
        title: "AI Health Assistant",
        desc: "24/7 Symptom Analysis & Triage. Chat with our advanced AI to get instant medical guidance before you even step out.",
        icon: Zap,
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop", // AI/Brain abstract
        color: "bg-teal-500",
        text: "text-teal-900"
    },
    {
        id: 2,
        title: "Smart Vitals Tracking",
        desc: "Real-time health monitoring. Connect wearables to track heart rate, BP, and oxygen levels automatically.",
        icon: Activity,
        image: "https://images.unsplash.com/photo-1576091160550-217358c7c8c8?q=80&w=800&auto=format&fit=crop", // Heart monitor
        color: "bg-indigo-500",
        text: "text-indigo-900"
    },
    {
        id: 3,
        title: "Secure Digital Records",
        desc: "Your history, encrypted. Access prescriptions, lab reports, and scans instantly from your secure vault.",
        icon: Shield,
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80", // Doctor with tablet
        color: "bg-blue-500",
        text: "text-blue-900"
    },
    {
        id: 4,
        title: "Instant Ambulance",
        desc: "GPS-Tracked Emergency Response. One tap books the nearest ambulance with 'Paramedic Mode' pre-arrival care.",
        icon: Phone,
        image: "https://images.unsplash.com/photo-1554734867-bf3c00a72b71?q=80&w=800&auto=format&fit=crop", // Ambulance/Emergency
        color: "bg-red-500",
        text: "text-red-900"
    },
    {
        id: 5,
        title: "Zero-Wait Scheduling",
        desc: "Live Queue Updates. Book appointments and see exactly when to leave home so you never wait in the lobby.",
        icon: Clock,
        image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop", // Clock/Time
        color: "bg-amber-500",
        text: "text-amber-900"
    },
    {
        id: 6,
        title: "Nearby Care Locator",
        desc: "Find care instantly. Integrated maps guide you to the nearest open pharmacy, specialized clinic, or testing lab.",
        icon: MapPin,
        image: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=800&auto=format&fit=crop", // Map
        color: "bg-emerald-500",
        text: "text-emerald-900"
    }
];

const Card = ({ feature }) => {
    return (
        <div className="group relative h-[500px] w-[350px] md:w-[400px] bg-white rounded-[2rem] overflow-hidden shrink-0 shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-500">
            {/* Upper Image Half */}
            <div className="h-[55%] w-full relative overflow-hidden">
                <div className={`absolute inset-0 ${feature.color} opacity-20 z-10`} />
                <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg">
                    <feature.icon className={`w-6 h-6 ${feature.text.replace('900', '600')}`} />
                </div>
            </div>

            {/* Lower Content Half */}
            <div className="h-[45%] p-8 flex flex-col justify-between relative bg-white">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                        {feature.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                        {feature.desc}
                    </p>
                </div>

                <div className="flex items-center gap-2 font-semibold text-slate-900 group-hover:translate-x-2 transition-transform duration-300 cursor-pointer">
                    Explore Feature <ArrowUpRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
};

export const ParallaxFeatureCards = () => {
    const targetRef = useRef(null);
    const scrollRef = useRef(null);
    const [scrollRange, setScrollRange] = React.useState(0);

    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-65%"]);

    // Smooth scroll logic - using scrollWidth vs clientWidth
    React.useEffect(() => {
        if (scrollRef.current && targetRef.current) {
            setScrollRange(scrollRef.current.scrollWidth - targetRef.current.clientWidth);
        }
    }, []);

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-slate-50">
            <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">

                <div className="max-w-7xl mx-auto px-6 mb-12 w-full">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                        Empowering You with <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Advanced Health Tech</span>
                    </h2>
                    <p className="text-slate-600 text-lg max-w-2xl">
                        Software that works for <em>you</em>. Access instant AI consultations, manage prescriptions, and track your recovery.
                    </p>
                </div>

                <div className="w-full relative">
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10" />

                    <motion.div
                        ref={scrollRef}
                        style={{ x }}
                        className="flex gap-8 px-6 md:px-20 w-max"
                    >
                        {features.map((feature) => (
                            <Card key={feature.id} feature={feature} />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
