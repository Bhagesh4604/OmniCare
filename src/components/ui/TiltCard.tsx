
import React, { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = "", onClick }) => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useMotionTemplate`${mouseY}deg`;
    const rotateY = useMotionTemplate`${mouseX}deg`;

    function onMouseMove({ clientX, clientY }: React.MouseEvent) {
        if (!ref.current) return;

        const { left, top, width, height } = ref.current.getBoundingClientRect();

        const xPos = clientX - left;
        const yPos = clientY - top;

        const xPct = xPos / width - 0.5;
        const yPct = yPos / height - 0.5;

        x.set(xPct * 20); // Max rotation deg
        y.set(yPct * -20);
    }

    function onMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            style={{
                transformStyle: "preserve-3d",
                rotateX,
                rotateY,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative group ${className} transition-all duration-200 ease-out`}
        >
            <div
                style={{
                    transform: "translateZ(75px)",
                    transformStyle: "preserve-3d",
                }}
                className="absolute inset-4 grid place-content-center rounded-xl shadow-lg"
            >
                {/* Content placeholder if needed, but we wrap children largely */}
            </div>

            {/* Dynamic Glare/Shine Gradient */}
            <motion.div
                style={{
                    background: useMotionTemplate`radial-gradient(
                   800px circle at ${mouseX}px ${mouseY}px,
                   rgba(255,255,255,0.15),
                   transparent 80%
                 )`
                }}
                className="pointer-events-none absolute index-0 inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl z-10"
            />

            <div style={{ transform: "translateZ(50px)" }} className="relative z-0 h-full">
                {children}
            </div>
        </motion.div>
    );
};

export default TiltCard;
