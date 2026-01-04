
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stage, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

// --- Configuration ---
const VEIN_COUNT = 150;
const ARTERY_COUNT = 150;

// --- Helper: Random Point around a skeletal path ---
const randomPointOnPath = (start: THREE.Vector3, end: THREE.Vector3, spread: number) => {
    const alpha = Math.random();
    const p = new THREE.Vector3().lerpVectors(start, end, alpha);
    p.x += (Math.random() - 0.5) * spread;
    p.y += (Math.random() - 0.5) * spread;
    p.z += (Math.random() - 0.5) * spread;
    return p;
};

// --- Procedural Circulatory System ---
const CirculatorySystem = ({ visible }: { visible: boolean }) => {
    // We generate curves following the general humanoid skeletal structure
    // Since we don't have bone data, we approximate paths.

    const veins = useMemo(() => {
        const paths = [];
        // Segments: [Start, End, Spread]
        const segments = [
            // Torso
            [new THREE.Vector3(0, 100, 0), new THREE.Vector3(0, 170, 0), 25],
            // Head
            [new THREE.Vector3(0, 170, 0), new THREE.Vector3(0, 195, 0), 12],
            // Left Arm
            [new THREE.Vector3(5, 165, 0), new THREE.Vector3(45, 160, 5), 8],   // Shoulder to elbow
            [new THREE.Vector3(45, 160, 5), new THREE.Vector3(75, 150, 15), 6],  // Elbow to hand
            // Right Arm
            [new THREE.Vector3(-5, 165, 0), new THREE.Vector3(-45, 160, 5), 8],
            [new THREE.Vector3(-45, 160, 5), new THREE.Vector3(-75, 150, 15), 6],
            // Left Leg
            [new THREE.Vector3(10, 100, 0), new THREE.Vector3(15, 50, 5), 10],   // Hip to knee
            [new THREE.Vector3(15, 50, 5), new THREE.Vector3(20, 0, 10), 8],     // Knee to foot
            // Right Leg
            [new THREE.Vector3(-10, 100, 0), new THREE.Vector3(-15, 50, 5), 10],
            [new THREE.Vector3(-15, 50, 5), new THREE.Vector3(-20, 0, 10), 8],
        ];

        // Generate Arteries (Red) and Veins (Blue)
        const allCurves: { curve: THREE.CatmullRomCurve3, color: string }[] = [];

        // Helper to gen curves
        const genCurves = (count: number, color: string) => {
            for (let i = 0; i < count; i++) {
                // Pick a random body segment
                const segIndex = Math.floor(Math.random() * segments.length);
                const seg = segments[segIndex];
                // const points = []; // Unused

                // Generate a wavy line along this segment
                const start = randomPointOnPath(seg[0] as THREE.Vector3, seg[1] as THREE.Vector3, seg[2] as number);
                const end = randomPointOnPath(seg[0] as THREE.Vector3, seg[1] as THREE.Vector3, seg[2] as number);

                // Midpoint jitter
                const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
                mid.x += (Math.random() - 0.5) * 5;
                mid.z += (Math.random() - 0.5) * 5;

                const curve = new THREE.CatmullRomCurve3([start, mid, end]);
                allCurves.push({ curve, color });
            }
        }

        genCurves(ARTERY_COUNT, "#ef4444"); // Red Arteries
        genCurves(VEIN_COUNT, "#3b82f6");   // Blue Veins

        return allCurves;
    }, []);

    if (!visible) return null;

    return (
        <group>
            {veins.map((item, i) => (
                <mesh key={i}>
                    <tubeGeometry args={[item.curve, 8, 0.3, 4, false]} />
                    <meshBasicMaterial color={item.color} transparent opacity={0.6} />
                </mesh>
            ))}
        </group>
    );
};

// --- Models ---
const HumanModel = ({ onOrganClick, risks }: any) => {
    const gltf = useGLTF('/HumanAnatomy.glb');
    const { scene } = gltf;
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    useEffect(() => {
        clonedScene.traverse((child: any) => {
            if (child.isMesh) {
                // REALISTIC RENDERING: Keep original materials
                child.castShadow = true;
                child.receiveShadow = true;

                // Optional: Enhance material if it's standard
                if (child.material) {
                    child.material.roughness = 0.5;
                    child.material.metalness = 0.1;
                }
            }
        });
    }, [clonedScene]);

    return (
        <group scale={0.02} position={[0, -2, 0]}>
            <primitive object={clonedScene} />

            {/* The Detailed Cardiovascular System */}
            <CirculatorySystem visible={true} />

            {/* Glowing Heart (The Core) */}
            <mesh position={[0, 145, 5]} onClick={(e) => { e.stopPropagation(); onOrganClick('Heart'); }}>
                <dodecahedronGeometry args={[6, 1]} />
                <meshStandardMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={2}
                    toneMapped={false}
                />
                <pointLight distance={30} intensity={2} color="red" />
            </mesh>
        </group>
    );
};

// --- Main Canvas ---
interface HealthTwinProps {
    risks?: any;
    onOrganClick?: (organ: string) => void;
}

const HealthTwinCanvas: React.FC<HealthTwinProps> = ({ risks, onOrganClick }) => {
    return (
        <div className="w-full h-[600px] relative rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex">
            {/* Left Sidebar (BioDigital Style) */}
            <div className="w-64 bg-white hidden md:block p-6 border-r border-gray-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Cardiovascular System</h2>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    This model shows the body's heart and blood vessels.
                    <br /><br />
                    Red vessels (arteries) carry oxygenated blood away from the heart.
                    Blue vessels (veins) carry deoxygenated blood back to the heart.
                </p>

                <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 bg-slate-100 rounded hover:bg-slate-200 transition">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium text-slate-700">Arteries</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 bg-slate-100 rounded hover:bg-slate-200 transition">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium text-slate-700">Veins</span>
                    </button>
                </div>

                <div className="mt-8 border-t pt-4">
                    <p className="text-xs text-slate-400 font-mono">POWERED BY</p>
                    <p className="text-sm font-bold text-slate-800">BIODIGITAL <span className="font-light">AI</span></p>
                </div>
            </div>

            {/* 3D Viewport */}
            <div className="flex-1 relative bg-black">
                {/* Toolbar Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    <button className="bg-white p-2 rounded shadow hover:bg-gray-100"><span className="text-xl">↺</span></button>
                    <button className="bg-white p-2 rounded shadow hover:bg-gray-100"><span className="text-xl">+</span></button>
                    <button className="bg-white p-2 rounded shadow hover:bg-gray-100"><span className="text-xl">-</span></button>
                </div>

                <React.Suspense fallback={null}>
                    <Canvas camera={{ position: [0, 50, 200], fov: 35 }}>
                        <color attach="background" args={['#000000']} />
                        <Stars radius={100} depth={50} count={2000} factor={2} fade />

                        <ambientLight intensity={0.2} />
                        <spotLight position={[50, 50, 100]} angle={0.3} intensity={1} color="#ffffff" />

                        {/* Rim Light for Silhouette */}
                        <spotLight position={[0, 100, -50]} angle={1} intensity={5} color="#4f46e5" />

                        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
                            <HumanModel onOrganClick={onOrganClick} risks={risks} />
                        </Float>

                        <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.5} />
                    </Canvas>
                </React.Suspense>
            </div>
        </div>
    );
};

export default HealthTwinCanvas;
