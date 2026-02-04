import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, useMotionTemplate, animate } from 'framer-motion';
import { Button } from '@/components/ui/button';

export const AnimatedPortalCard = ({ title, description, icon: Icon, onClick, gradientColors }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const color = useMotionValue(gradientColors[0]);

  useEffect(() => {
    animate(color, gradientColors, {
      ease: 'easeInOut',
      duration: 10,
      repeat: Infinity,
      repeatType: 'mirror',
    });
  }, [gradientColors]);

  const backgroundImage = useMotionTemplate`radial-gradient(circle at 50% 0%, ${color} 0%, transparent 70%)`;

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="w-full max-w-sm relative z-10"
      style={{ perspective: 1500 }}
    >
      <motion.div
        className="relative cursor-pointer"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ z: 10 }}
        onClick={onClick}
      >
        <div className="relative group">
          <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
              initial={{ filter: "blur(2px)" }}
              animate={{ left: ["-50%", "100%"] }}
              transition={{ duration: 2.5, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
            />
            <motion.div 
              className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
              initial={{ filter: "blur(2px)" }}
              animate={{ top: ["-50%", "100%"] }}
              transition={{ duration: 2.5, ease: "linear", repeat: Infinity, repeatDelay: 1, delay: 0.6 }}
            />
          </div>

          <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-white/10 via-white/30 to-white/10 opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
          
          <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/[0.05] shadow-2xl overflow-hidden text-center">
            <motion.div
              className="absolute inset-0 opacity-20"
              style={{ backgroundImage }}
            />
            <div className="absolute inset-0 opacity-[0.03]" 
              style={{
                backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                backgroundSize: '30px 30px'
              }}
            />
            <div className="relative mx-auto w-16 h-16 rounded-full border border-white/10 flex items-center justify-center overflow-hidden mb-4">
              <Icon className="w-8 h-8 text-white/80" />
            </div>
            <h2 className="relative text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80 mb-2">
              {title}
            </h2>
            <p className="relative text-white/60 text-sm mb-6">
              {description}
            </p>
            <Button variant="secondary" className="relative w-full bg-white/10 hover:bg-white/20 text-white">
              Access Portal
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};