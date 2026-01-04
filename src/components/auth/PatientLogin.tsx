import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiUrl from '@/config/api';
import { AuroraBackground } from '../ui/AuroraBackground';

export default function PatientLogin({ onLogin, setAuthMode }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Slight delay for animation feel
      const response = await fetch(apiUrl('/api/auth/patient/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        onLogin(data.patient);
      } else {
        setError(data.message || 'Invalid credentials.');
      }
    } catch (error) {
      console.error('Patient login error', error);
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      },
    },
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay: 0.2
      }
    }
  };

  return (
    <AuroraBackground className="bg-black text-white font-sans">
      {/* Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={() => navigate('/login')}
          className="group flex items-center gap-2 px-4 py-2 rounded-full text-white/80 bg-black/40 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all hover:pl-3 hover:text-white"
          aria-label="Back to Portal Selection"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md px-6 mx-auto"
      >
        <motion.div
          variants={cardVariants}
          className="w-full p-8 space-y-8 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
        >
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 mb-4 shadow-lg shadow-teal-500/30">
              <HeartPulse className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Patient Portal</h2>
            <p className="text-gray-400 text-base">Access your health records securely</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 text-white border border-white/10 rounded-xl focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-gray-600 hover:bg-black/50"
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 text-white border border-white/10 rounded-xl focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-gray-600 hover:bg-black/50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 p-2 rounded-lg"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl hover:from-teal-500 hover:to-cyan-500 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-teal-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('forgot_password')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
              >
                Create Account
              </button>
            </div>

          </form>
        </motion.div>

        <p className="text-center text-gray-600 text-sm mt-8">
          Omni Care Management System &copy; 2026
        </p>
      </motion.div>
    </AuroraBackground>
  );
}