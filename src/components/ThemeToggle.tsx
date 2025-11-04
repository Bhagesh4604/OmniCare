import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      onClick={toggleTheme}
      className={`absolute top-8 right-8 z-20 p-2.5 rounded-full transition-colors ${
        theme === 'dark'
          ? 'text-gray-300 bg-black/20 backdrop-blur-sm border border-white/10 hover:text-white'
          : 'text-gray-600 bg-white/30 backdrop-blur-sm border border-black/10 hover:text-black'
      }`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </motion.button>
  );
};

export default ThemeToggle;
