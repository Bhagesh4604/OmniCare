import React from 'react';
import TuggableLamp from './TuggableLamp';

const AnimationGate = ({ onComplete }) => {
  return (
    <div className="relative flex items-center justify-center h-screen bg-cover bg-center font-sans overflow-hidden" style={{ backgroundImage: "url('/login-bg.jpg')" }}>
        <div className="absolute inset-0 bg-black/70 z-0"></div>
        <TuggableLamp onComplete={onComplete} />
    </div>
  );
};

export default AnimationGate;
