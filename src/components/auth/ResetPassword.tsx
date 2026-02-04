import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

import apiUrl from '@/config/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword({ setAuthMode }) {
  const query = useQuery();
  const navigate = useNavigate();
  const token = query.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl('/api/auth/patient/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage(data.message);
        setTimeout(() => {
          navigate('/');
          setAuthMode('login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (error) {
      setError('Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-cover bg-center text-white font-sans overflow-hidden" style={{ backgroundImage: "url('/login-bg.jpg')" }}>
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md mx-4 sm:mx-0 p-8 space-y-6 bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl"
      >
        <div className="text-center">
          <div className="inline-block bg-gray-800/50 p-3 rounded-full mb-4 border border-white/10">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">Reset Password</h2>
          <p className="text-gray-300 mt-2 text-base">Enter your new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 text-white border border-white/10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 text-white border border-white/10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-500"
              required
            />
          </div>

          {message && <p className="text-sm text-green-400 text-center">{message}</p>}
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
