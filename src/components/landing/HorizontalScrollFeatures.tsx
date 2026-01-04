import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Zap, Activity, Shield, ChevronRight } from 'lucide-react';
import { AuroraBackground } from '../ui/AuroraBackground';

const features = [
    {
        title: "AI Analysis",
        desc: "Instant symptom checking using advanced LLMs to guide your care journey.",
        icon: Zap,
        color: "bg-amber-100 text-amber-600",
        id: 1,
    },
    {
        title: "3D Digital Twin",
        desc: "Visualize your health data on a realistic 3D human model in real-time.",
        icon: Activity,
        color: "bg-teal-100 text-teal-600",
        id: 2,
    },
    {
        title: "Emergency Response",
        desc: "One-tap ambulance booking with live GPS tracking and paramedic chat.",
        icon: Shield,
        color: "bg-rose-100 text-rose-600",
        id: 3,
    },
    {
        title: "Secure Records",
        desc: "Blockchain-backed health records ensuring your data is safe and immutable.",
        icon: Shield,
        color: "bg-blue-100 text-blue-600",
        id: 4,
    }
];

const FeatureCard = ({ feature }: { feature: typeof features[0] }) => {
    return (
        <div
            className="group relative h-[450px] w-[350px] md:w-[450px] overflow-hidden bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 md:p-12 flex flex-col justify-between hover:shadow-2xl transition-all duration-500 hover:border-teal-100 hover:-translate-y-2 shrink-0"
        >
            <div>
                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">{feature.title}</h3>
                <p className="text-slate-500 text-lg leading-relaxed">{feature.desc}</p>
            </div>

            <div className="flex items-center text-teal-600 font-bold text-lg group-hover:gap-3 transition-all cursor-pointer">
                Learn more <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </div>

            {/* Decorative Background Blob - Kept as subtle internal decoration */}
            <div className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full ${feature.color} opacity-[0.05] group-hover:scale-150 transition-transform duration-700 pointer-events-none`} />
        </div>
    );
};


export const HorizontalScrollFeatures = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollRange, setScrollRange] = React.useState(0);
    const [viewportWidth, setViewportWidth] = React.useState(0);

    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    // Add physics smoothing
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    React.useEffect(() => {
        // Calculate the distance to scroll: (Content Width - Viewport Width)
        // This ensures perfectly stopping at the last card.
        const updateScrollCalc = () => {
            if (scrollRef.current && targetRef.current) {
                const scrollWidth = scrollRef.current.scrollWidth;
                const clientWidth = targetRef.current.clientWidth;
                const range = scrollWidth - clientWidth + 100; // +100 for padding buffer
                setScrollRange(range > 0 ? range : 0);
                setViewportWidth(clientWidth);
            }
        };

        updateScrollCalc();
        window.addEventListener("resize", updateScrollCalc);
        return () => window.removeEventListener("resize", updateScrollCalc);
    }, []);

    // Translate horizontally by the calculated pixel amount
    // Using 0 to 1 range of the shorter scroll height
    const x = useTransform(smoothProgress, [0, 1], [20, -scrollRange]);

    return (
        <section ref={targetRef} id="features" className="relative h-[130vh] bg-white">
            <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">

                {/* Fixed Green Aurora Background at Top */}
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <AuroraBackground
                        className="!min-h-0 w-full h-full !items-start opacity-60"
                        showBlob2={false}
                        showBaseBackground={false}
                    >
                        {/* Empty children, just using background */}
                        <div />
                    </AuroraBackground>
                </div>

                {/* Section Header */}
                <div className="text-center z-10 px-6 mb-16 md:mb-20 shrink-0 max-w-4xl mx-auto pt-10">
                    <span className="text-teal-600 font-bold tracking-wider uppercase text-sm mb-3 block">Why Choose Us</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                        Healthcare features that <br className="hidden md:block" /> actually work for you
                    </h2>
                </div>

                {/* Horizontal Scroll Track */}
                <div className="w-full relative z-10">
                    <motion.div
                        ref={scrollRef}
                        style={{ x }}
                        className="flex gap-6 md:gap-10 px-4 md:px-20 w-max"
                    >
                        {features.map((feature) => (
                            <FeatureCard key={feature.id} feature={feature} />
                        ))}
                    </motion.div>
                </div>

            </div>
        </section>
    );
};
