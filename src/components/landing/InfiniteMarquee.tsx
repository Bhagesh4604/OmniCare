import React from 'react';
import { motion } from 'framer-motion';

interface InfiniteMarqueeProps {
    images: string[];
    direction?: 'left' | 'right';
    speed?: number;
    className?: string;
}

export const InfiniteMarquee = ({
    images,
    direction = 'left',
    speed = 25,
    className = ""
}: InfiniteMarqueeProps) => {
    return (
        <div className={`flex overflow-hidden w-full relative z-0 ${className}`}>
            {/* Gradient masks for smooth fade edges */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10" />

            <motion.div
                initial={{ x: direction === 'left' ? 0 : "-50%" }}
                animate={{ x: direction === 'left' ? "-50%" : 0 }}
                transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
                className="flex gap-8 flex-nowrap py-4"
            >
                {/* Triple duplication for smoother infinite loop on wide screens */}
                {[...images, ...images, ...images].map((src, idx) => (
                    <div
                        key={idx}
                        className="w-64 h-40 md:w-80 md:h-48 shrink-0 rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-white"
                    >
                        <img
                            src={src}
                            alt={`gallery-${idx}`}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
