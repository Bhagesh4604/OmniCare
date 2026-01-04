import React from 'react';
import { Stethoscope, User, Briefcase, ArrowLeft, ShieldCheck, HeartPulse } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TiltCard = ({ title, description, icon: Icon, onClick, colorClass, delay }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    const handleMouseMove = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct * 200);
        y.set(yPct * 200);
    };

    const handleMouseLeave = () => { x.set(0); y.set(0); };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: delay }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className="relative group w-full max-w-sm h-96 cursor-pointer perspective-1000"
        >
            <div className="absolute inset-0 bg-white/10 dark:bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/20 shadow-2xl transition-all duration-300 group-hover:shadow-[0_0_50px_rgba(56,189,248,0.3)] group-hover:border-white/40">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative h-full flex flex-col items-center justify-center p-8 text-center" style={{ transform: "translateZ(30px)" }}>
                    <div className={`w-24 h-24 rounded-2xl ${colorClass} bg-opacity-20 flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-12 h-12 ${colorClass.replace('bg-', 'text-')}`} />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">{title}</h2>
                    <p className="text-gray-400 font-medium leading-relaxed">{description}</p>

                    <div className="mt-8 flex items-center gap-2 text-sm font-bold text-white/60 group-hover:text-white transition-colors">
                        <span>Access Portal</span>
                        <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function PortalSelection() {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950">
            {/* Aurora Background */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/30 rounded-full blur-[120px] animate-aurora mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/30 rounded-full blur-[120px] animate-aurora animation-delay-2000 mix-blend-screen" />
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-teal-500/20 rounded-full blur-[100px] animate-aurora animation-delay-4000 mix-blend-screen" />
            </div>

            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate('/')}
                className="fixed top-8 left-8 z-50 flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all group"
            >
                <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white group-hover:-translate-x-1 transition-all" />
                <span className="text-white/70 group-hover:text-white font-medium">Return Home</span>
            </motion.button>

            {/* Center Content */}
            <div className="relative z-10 container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 mb-6 shadow-2xl shadow-teal-500/20">
                        <HeartPulse className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6">
                        Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Workspace</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Secure, AI-powered access for every role. Choose your portal to continue.
                    </p>
                </motion.div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                    <TiltCard
                        title="Patient Portal"
                        description="Book appointments, view medical records, and track your health journey."
                        icon={User}
                        onClick={() => navigate('/login/patient')}
                        colorClass="bg-teal-500 text-teal-400"
                        delay={0.2}
                    />

                    <TiltCard
                        title="Staff Portal"
                        description="Access EMS, ER dashboards, patient management, and administrative tools."
                        icon={ShieldCheck}
                        onClick={() => navigate('/login/staff')}
                        colorClass="bg-blue-600 text-blue-400"
                        delay={0.4}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-slate-500 text-sm font-medium">
                &copy; 2025 Omni Care Systems. Secure Connection Verified.
            </div>
        </div>
    );
}