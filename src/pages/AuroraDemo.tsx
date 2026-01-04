import React from "react";
import { AuroraBackground } from "../components/ui/AuroraBackground";

const AuroraDemo = () => {
    return (
        <AuroraBackground>
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-4 pointer-events-none drop-shadow-lg">
                    Health Insights
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-2xl pointer-events-none drop-shadow-md">
                    At your fingertips.
                </p>
                <div className="mt-8 p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                    <p className="text-sm font-medium text-white/90">
                        Modern dark theme offering premium healthcare visualization.
                    </p>
                </div>
            </div>
        </AuroraBackground>
    );
};

export default AuroraDemo;
