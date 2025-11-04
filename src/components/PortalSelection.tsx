// src/components/PortalSelection.tsx
import React from 'react';
import { Stethoscope, User, Briefcase } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const AnimatedCard = ({ title, icon: Icon, onClick, gradient, iconColor }) => {
    const x = useMotionValue(200);
    const y = useMotionValue(200);
    const rotateX = useTransform(y, [0, 400], [15, -15]);
    const rotateY = useTransform(x, [0, 400], [-15, 15]);

    const handleMouseMove = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left);
        y.set(event.clientY - rect.top);
    };
    const handleMouseLeave = () => { x.set(200); y.set(200); }

    return (
        <motion.div
            style={{ width: 280, height: 350, rotateX, rotateY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.05 }}
            variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }}
            className="relative rounded-3xl shadow-2xl bg-black/20 border border-white/10 backdrop-blur-lg cursor-pointer"
        >
            <div onClick={onClick} className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 transition-all duration-500 group" style={{ transformStyle: "preserve-3d" }}>
                <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${gradient}`} style={{ filter: 'blur(40px)' }}></div>
                <div style={{ transform: "translateZ(50px)" }}>
                    <div className={`p-5 rounded-full mb-6 inline-block border border-white/10 bg-gray-800/50`}>
                        <Icon className={`w-16 h-16 ${iconColor}`} />
                    </div>
                    <h2 className="text-3xl font-bold text-white">{title}</h2>
                    <p className="text-gray-400 mt-2">Securely login to your portal</p>
                </div>
            </div>
        </motion.div>
    );
};


export default function PortalSelection({ setLoginPortal }) {
    return (
        <div className="relative flex flex-col items-center justify-center h-screen bg-black text-white font-sans overflow-hidden" style={{ backgroundImage: "url('/login-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/70 z-0"></div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10 text-center p-8"
            >
                <div className="flex justify-center items-center mb-4">
                    <Stethoscope className="w-12 h-12 text-cyan-300 mr-4" />
                    <h1 className="text-5xl font-bold text-white tracking-tight">
                        Shree Medicare HMS
                    </h1>
                </div>
                <p className="text-gray-400 text-lg">
                    Your dedicated partner in healthcare management.
                </p>
            </motion.div>

            <motion.div
                 initial="hidden"
                 animate="visible"
                 variants={{
                     visible: { transition: { staggerChildren: 0.2, delayChildren: 0.5 } }
                 }}
                className="relative z-10 flex flex-col md:flex-row justify-center items-center gap-12 mt-12"
            >
                <AnimatedCard
                    title="Staff Portal"
                    icon={Briefcase}
                    onClick={() => setLoginPortal('staff')}
                    gradient="bg-gradient-to-br from-cyan-400 to-blue-600"
                    iconColor="text-cyan-300"
                />
                <AnimatedCard
                    title="Patient Portal"
                    icon={User}
                    onClick={() => setLoginPortal('patient')}
                    gradient="bg-gradient-to-br from-lime-400 to-green-600"
                    iconColor="text-lime-300"
                />
            </motion.div>
        </div>
    );
}