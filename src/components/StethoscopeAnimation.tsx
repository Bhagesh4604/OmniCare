import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Stethoscope } from 'lucide-react';

const StethoscopeAnimation = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const cordX = useTransform(x, val => val * 0.5);
  const cordY = useTransform(y, val => val * 0.5);

  const handleDragEnd = (event, info) => {
    const dist = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);

    if (dist > 50) {
      // "Fling" animation to simulate a timeline restart
      const xKeyframes = [x.get(), -x.get() * 0.4, x.get() * 0.2, -x.get() * 0.1, 0];
      const yKeyframes = [y.get(), -y.get() * 0.4, y.get() * 0.2, -y.get() * 0.1, 0];
      
      animate(x, xKeyframes, { duration: 0.7, ease: "easeOut" });
      animate(y, yKeyframes, { duration: 0.7, ease: "easeOut" });

    } else {
      // Snap back for short drags
      animate(x, 0, { type: 'spring', stiffness: 600, damping: 30 });
      animate(y, 0, { type: 'spring', stiffness: 600, damping: 30 });
    }
  };

  return (
    <motion.div
      className="relative w-24 h-24 flex items-center justify-center mb-4"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 1, type: 'spring' }}
    >
      <svg className="absolute w-full h-full overflow-visible" viewBox="-50 -50 100 100">
        <motion.line
          x1="0"
          y1="0"
          x2={cordX}
          y2={cordY}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <motion.div
        drag
        dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x, y }}
        className="w-16 h-16 bg-gray-800/50 border border-white/10 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <Stethoscope className="w-8 h-8 text-blue-400" />
      </motion.div>
    </motion.div>
  );
};

export default StethoscopeAnimation;
