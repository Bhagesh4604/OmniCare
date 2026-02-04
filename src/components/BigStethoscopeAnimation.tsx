import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Stethoscope } from 'lucide-react';

const BigStethoscopeAnimation = ({ onAnimationComplete }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const cordX = useTransform(x, val => val * 0.8);
  const cordY = useTransform(y, val => val * 0.8);

  const handleDragEnd = (event, info) => {
    // Trigger the page transition after a short delay to show the animation
    if (onAnimationComplete) {
        setTimeout(() => onAnimationComplete(), 400);
    }

    // Animate back to origin using spring physics based on release velocity
    animate(x, 0, {
        type: "spring",
        stiffness: 100,
        damping: 15,
        restDelta: 0.001,
        velocity: info.velocity.x,
    });
    animate(y, 0, {
        type: "spring",
        stiffness: 100,
        damping: 15,
        restDelta: 0.001,
        velocity: info.velocity.y,
    });
  };

  return (
    <motion.div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64" // Centered position
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      <svg className="absolute w-full h-full overflow-visible" viewBox="-100 -100 200 200">
        <motion.line
          x1="0"
          y1="-250" // Anchor point further off-screen top
          x2={cordX}
          y2={cordY}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <motion.div
        drag
        dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x, y }}
        className="w-48 h-48 bg-gray-800/30 border-2 border-white/10 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-2xl"
      >
        <Stethoscope className="w-24 h-24 text-blue-400/70" />
      </motion.div>
    </motion.div>
  );
};

export default BigStethoscopeAnimation;
