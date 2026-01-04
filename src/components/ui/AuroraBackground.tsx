"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    showRadialGradient?: boolean;
    showBlob1?: boolean;
    showBlob2?: boolean;
    showBaseBackground?: boolean;
}

export const AuroraBackground = ({
    className,
    children,
    showRadialGradient = true,
    showBlob1 = true,
    showBlob2 = true,
    showBaseBackground = true,
    ...props
}: AuroraBackgroundProps) => {
    return (
        <div
            className={cn(
                "relative flex flex-col min-h-screen w-full items-center justify-center overflow-hidden transition-bg",
                showBaseBackground ? "bg-slate-950" : "bg-transparent",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 overflow-hidden">
                {/* Base Background - Deep Blue from user's gradient middle */}
                {showBaseBackground && <div className="absolute inset-0 z-0 bg-[#201E50]" />}

                {/* Roaming Blob 1 (Neon Green) */}
                {showBlob1 && (
                    <motion.div
                        animate={{
                            x: ["-20%", "40%", "-10%", "30%", "-20%"],
                            y: ["-20%", "30%", "10%", "-30%", "-20%"],
                            rotate: [0, 90, 180, 270, 0],
                            scale: [1, 1.2, 0.9, 1.1, 1],
                        }}
                        transition={{
                            duration: 35,
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "linear",
                        }}
                        className="absolute top-0 left-0 h-[120vh] w-[120vw] rounded-full blur-[100px] opacity-50"
                        style={{
                            background: "radial-gradient(circle at center, #00FFA3, transparent 50%)", // Neon Green
                        }}
                    />
                )}

                {/* Roaming Blob 2 (Neon Pink) */}
                {showBlob2 && (
                    <motion.div
                        animate={{
                            x: ["20%", "-40%", "10%", "-30%", "20%"],
                            y: ["20%", "-30%", "-10%", "30%", "20%"],
                            rotate: [0, -90, -180, -270, 0],
                            scale: [1, 1.3, 0.8, 1.2, 1],
                        }}
                        transition={{
                            duration: 40,
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "linear",
                        }}
                        className="absolute bottom-0 right-0 h-[120vh] w-[120vw] rounded-full blur-[100px] opacity-90"
                        style={{
                            background: "radial-gradient(circle at center, #FF0055, transparent 50%)", // Neon Pink
                        }}
                    />
                )}
                {/* Glass Effect - Plain Blur (No Noise) */}
                <div className="absolute inset-0 z-0 backdrop-blur-[50px]" />

            </div>

            <div className="relative z-10 w-full">{children}</div>
        </div>
    );
};
