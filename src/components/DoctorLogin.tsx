
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import apiUrl from '@/config/api';

interface Position {
  x: number;
  y: number;
}

const DoctorLogin = ({ onLogin, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [isDragging, setIsDragging] = useState(false);
    const [wireEnd, setWireEnd] = useState<Position>({ x: 0, y: 0 });
    const [wireVisible, setWireVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const stethoscopeRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (stethoscopeRef.current && containerRef.current) {
            const rect = stethoscopeRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            setIsDragging(true);
            setWireEnd({
                x: rect.left + rect.width / 2 - containerRect.left,
                y: rect.top + rect.height / 2 - containerRect.top,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            setWireEnd({
                x: e.clientX - containerRect.left,
                y: e.clientY - containerRect.top,
            });
            setWireVisible(true);
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (isDragging && containerRef.current && cardRef.current) {
            const cardRect = cardRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            const endX = e.clientX - containerRect.left;
            const endY = e.clientY - containerRect.top;

            const cardCenterX = cardRect.left + cardRect.width / 2 - containerRect.left;
            const cardCenterY = cardRect.top + cardRect.height / 2 - containerRect.top;

            const distance = Math.sqrt(
                Math.pow(endX - cardCenterX, 2) + Math.pow(endY - cardCenterY, 2)
            );

            if (distance < 150) {
                setWireEnd({
                    x: cardCenterX,
                    y: cardCenterY,
                });
            } else {
                setWireVisible(false);
                setWireEnd({ x: 0, y: 0 });
            }
            setIsDragging(false);
        }
    };

    const getWireStart = (): Position => {
        if (stethoscopeRef.current && containerRef.current) {
            const rect = stethoscopeRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2 - containerRect.left,
                y: rect.top + rect.height / 2 - containerRect.top,
            };
        }
        return { x: 0, y: 0 };
    };

    const wireStart = getWireStart();

    const handleSubmit = async (e) => {
        e.preventDefault();
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'default' }}
        >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NiwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

            <div className="flex items-center justify-center gap-16">
                {onBack && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 text-white hover:bg-white/10"
                        onClick={onBack}
                        style={{ top: '4rem' }}
                    >
                        <ArrowLeft className="h-5 w-5" /> Back to Portal Selection
                    </Button>
                )}
                <motion.div
                    ref={stethoscopeRef}
                    className="relative cursor-grab active:cursor-grabbing z-20"
                    onMouseDown={handleMouseDown}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                >
                    <div className="relative">
                        <motion.div
                            className={`absolute inset-0 blur-2xl bg-cyan-500/50 rounded-full`}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <Stethoscope className={`relative w-16 h-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]`} />
                    </div>
                </motion.div>

                <motion.div
                    ref={cardRef}
                    className="relative"
                    initial={{ opacity: 0, scale: 0.8, x: 100 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                >
                    <Card className={`w-[400px] bg-slate-900/40 backdrop-blur-xl border-cyan-500/30 shadow-2xl shadow-cyan-500/20`}>
                        <CardHeader className="space-y-4">
                            <motion.div
                                className="flex justify-center"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                <div className="relative">
                                    <div className={`absolute inset-0 blur-xl bg-cyan-500/50 rounded-full`} />
                                    <Stethoscope className={`relative w-12 h-12 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]`} />
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <CardTitle className="text-2xl font-bold text-center text-white">
                                    Doctor Portal
                                </CardTitle>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <CardDescription className="text-center text-slate-300">
                                    Securely access your dashboard.
                                </CardDescription>
                            </motion.div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <Label htmlFor="username" className="text-slate-200">
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/50`}
                                />
                            </motion.div>
                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <Label htmlFor="password" className="text-slate-200">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/50`}
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                            >
                                <Button
                                    className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/50 transition-all duration-300`}
                                    size="lg"
                                    onClick={handleSubmit}
                                >
                                    Login
                                </Button>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 10 }}
            >
                <defs>
                    <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={`rgb(34, 211, 238)`} stopOpacity="1" />
                        <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="1" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {wireVisible && (
                    <motion.path
                        d={`M ${wireStart.x} ${wireStart.y} Q ${(wireStart.x + wireEnd.x) / 2} ${wireStart.y - 100}, ${wireEnd.x} ${wireEnd.y}`}
                        stroke="url(#wireGradient)"
                        strokeWidth="3"
                        fill="none"
                        filter="url(#glow)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                )}
            </svg>
        </div>
    );
};

export default DoctorLogin;
