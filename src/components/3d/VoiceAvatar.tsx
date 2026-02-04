
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface VoiceAvatarProps {
    isListening: boolean;
    isSpeaking: boolean;
}

const AvatarMesh: React.FC<VoiceAvatarProps> = ({ isListening, isSpeaking }) => {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.getElapsedTime();

            // Base rotation
            meshRef.current.rotation.x = time * 0.5;
            meshRef.current.rotation.y = time * 0.3;

            // Scale pulsing
            const scaleBase = 1.5;
            let pulse = 0;

            if (isListening) {
                pulse = Math.sin(time * 10) * 0.2; // Fast pulse
            } else if (isSpeaking) {
                pulse = Math.sin(time * 5) * 0.4; // Deep breathing
            } else {
                pulse = Math.sin(time * 2) * 0.1; // Idle
            }

            const s = scaleBase + pulse;
            meshRef.current.scale.set(s, s, s);
        }
    });

    // Color logic
    let color = "#3b82f6"; // Blue (Idle)
    if (isListening) color = "#ef4444"; // Red (Listening)
    if (isSpeaking) color = "#10b981"; // Green (Speaking)

    return (
        <Sphere args={[1, 64, 64]} ref={meshRef}>
            <MeshDistortMaterial
                color={color}
                attach="material"
                distort={isSpeaking ? 0.6 : 0.3}
                speed={isSpeaking ? 5 : 2}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    );
};

const VoiceAvatar: React.FC<VoiceAvatarProps> = (props) => {
    return (
        <div className="w-16 h-16 relative">
            <Canvas camera={{ position: [0, 0, 4] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <AvatarMesh {...props} />
            </Canvas>
        </div>
    );
};

export default VoiceAvatar;
