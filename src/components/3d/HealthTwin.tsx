
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

// --- Configuration ---
const SKELETON_COLOR = '#e0e0e0';
const BODY_COLOR = '#1a1a1a';
const HIGHLIGHT_COLOR = '#00d4ff';

// --- Interactive Body Parts ---
const bodyParts = [
    { name: 'Heart', position: [0, 145, 5], description: 'Pumps blood throughout the body' },
    { name: 'Lungs', position: [0, 150, -5], description: 'Responsible for breathing and oxygen exchange' },
    { name: 'Liver', position: [15, 130, 0], description: 'Largest internal organ, filters blood' },
    { name: 'Stomach', position: [-10, 125, 5], description: 'Digests food and breaks down nutrients' },
    { name: 'Spine', position: [0, 130, -8], description: 'Vertebral column protecting spinal cord' },
    { name: 'Pelvis', position: [0, 100, 0], description: 'Fused bones connecting spine to legs' },
];

// --- Skeleton System ---
const SkeletonSystem = ({ visible }: { visible: boolean }) => {
    const skeleton = useMemo(() => {
        const bones = [];

        // Spine (vertical line)
        for (let i = 0; i < 15; i++) {
            const y = 100 + (i * 8);
            bones.push({
                position: [0, y, -5],
                rotation: [0, 0, 0],
                scale: [3, 8, 3]
            });
        }

        // Ribs (curved lines)
        for (let i = 0; i < 8; i++) {
            const y = 120 + (i * 6);
            const spread = 15 + (i * 2);
            bones.push(
                { position: [spread, y, 0], rotation: [0, 0, Math.PI / 8], scale: [18, 2, 2] },
                { position: [-spread, y, 0], rotation: [0, 0, -Math.PI / 8], scale: [18, 2, 2] }
            );
        }

        // Pelvis
        bones.push(
            { position: [12, 100, 0], rotation: [0, 0, Math.PI / 6], scale: [15, 3, 5] },
            { position: [-12, 100, 0], rotation: [0, 0, -Math.PI / 6], scale: [15, 3, 5] },
            { position: [0, 95, 0], rotation: [0, 0, 0], scale: [25, 3, 8] }
        );

        return bones;
    }, []);

    if (!visible) return null;

    return (
        <group>
            {skeleton.map((bone, i) => (
                <mesh key={i} position={bone.position as any} rotation={bone.rotation as any}>
                    <boxGeometry args={bone.scale as any} />
                    <meshStandardMaterial
                        color={SKELETON_COLOR}
                        emissive={SKELETON_COLOR}
                        emissiveIntensity={0.3}
                    />
                </mesh>
            ))}
        </group>
    );
};

// --- Interactive Organ Marker ---
const OrganMarker = ({ part, onHover, isHovered }: any) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (meshRef.current && isHovered) {
            meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 3) * 0.1);
        } else if (meshRef.current) {
            meshRef.current.scale.setScalar(1);
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={part.position as any}
            onPointerOver={(e) => { e.stopPropagation(); onHover(part); }}
            onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
        >
            <sphereGeometry args={[4, 16, 16]} />
            <meshStandardMaterial
                color={isHovered ? HIGHLIGHT_COLOR : '#00aaff'}
                emissive={isHovered ? HIGHLIGHT_COLOR : '#0088cc'}
                emissiveIntensity={isHovered ? 1 : 0.5}
                transparent
                opacity={isHovered ? 0.9 : 0.6}
            />
            {isHovered && (
                <Html position={[15, 0, 0]} distanceFactor={8}>
                    <div className="bg-gray-800/95 border border-cyan-500/50 rounded-lg px-4 py-3 shadow-2xl backdrop-blur-sm min-w-[200px]">
                        <h3 className="text-white font-bold text-sm mb-1">{part.name}</h3>
                        <p className="text-gray-300 text-xs leading-relaxed">{part.description}</p>
                        <div className="flex gap-2 mt-2">
                            <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">Hubs</button>
                            <button className="text-xs text-gray-400 hover:text-gray-300">Pedia</button>
                            <button className="text-xs text-gray-400 hover:text-gray-300">Insights</button>
                        </div>
                    </div>
                </Html>
            )}
        </mesh>
    );
};

// --- Human Body Model ---
const HumanModel = ({ onOrganClick }: any) => {
    const [hoveredPart, setHoveredPart] = useState<any>(null);
    const gltf = useGLTF('/HumanAnatomy.glb');
    const { scene } = gltf;
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    useEffect(() => {
        clonedScene.traverse((child: any) => {
            if (child.isMesh) {
                // Semi-transparent dark body
                child.material = new THREE.MeshStandardMaterial({
                    color: BODY_COLOR,
                    transparent: true,
                    opacity: 0.15,
                    roughness: 0.8,
                    metalness: 0.1,
                    side: THREE.DoubleSide
                });
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [clonedScene]);

    return (
        <group scale={0.02} position={[0, -2, 0]}>
            <primitive object={clonedScene} />

            {/* Visible Skeleton */}
            <SkeletonSystem visible={true} />

            {/* Interactive Organ Markers */}
            {bodyParts.map((part, i) => (
                <OrganMarker
                    key={i}
                    part={part}
                    onHover={setHoveredPart}
                    isHovered={hoveredPart?.name === part.name}
                />
            ))}
        </group>
    );
};

// --- Main Canvas ---
interface HealthTwinProps {
    risks?: any;
    onOrganClick?: (organ: string) => void;
}

const HealthTwinCanvas: React.FC<HealthTwinProps> = ({ risks, onOrganClick }) => {
    const [selectedSystem, setSelectedSystem] = useState('cardiovascular');

    return (
        <div className="w-full h-[600px] relative rounded-xl overflow-hidden bg-black border border-gray-800 shadow-2xl flex">
            {/* Left Sidebar */}
            <div className="w-64 bg-gray-900 hidden md:block p-6 border-r border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">Human Anatomy</h2>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    Interactive 3D model showing internal organs and skeletal structure.
                    Click on highlighted areas to learn more.
                </p>

                <div className="space-y-2 mb-6">
                    <button
                        onClick={() => setSelectedSystem('cardiovascular')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded transition ${selectedSystem === 'cardiovascular'
                                ? 'bg-cyan-500/20 border border-cyan-500/50'
                                : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                    >
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium text-gray-200">Cardiovascular</span>
                    </button>
                    <button
                        onClick={() => setSelectedSystem('skeletal')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded transition ${selectedSystem === 'skeletal'
                                ? 'bg-cyan-500/20 border border-cyan-500/50'
                                : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                    >
                        <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                        <span className="text-sm font-medium text-gray-200">Skeletal</span>
                    </button>
                    <button
                        onClick={() => setSelectedSystem('digestive')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded transition ${selectedSystem === 'digestive'
                                ? 'bg-cyan-500/20 border border-cyan-500/50'
                                : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                    >
                        <div className="w-4 h-4 rounded-full bg-yellow-600"></div>
                        <span className="text-sm font-medium text-gray-200">Digestive</span>
                    </button>
                </div>

                <div className="border-t border-gray-800 pt-4">
                    <p className="text-xs text-gray-500 font-mono mb-1">POWERED BY</p>
                    <p className="text-sm font-bold text-white">BIODIGITAL <span className="font-light text-cyan-400">AI</span></p>
                </div>
            </div>

            {/* 3D Viewport */}
            <div className="flex-1 relative bg-black">
                {/* Top Label */}
                <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
                    <p className="text-sm font-bold text-gray-900">Ankylosing spondylitis</p>
                </div>

                {/* Toolbar */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    <button className="bg-gray-800/90 hover:bg-gray-700 p-2 rounded shadow border border-gray-700 text-white">
                        <span className="text-xl">↺</span>
                    </button>
                    <button className="bg-gray-800/90 hover:bg-gray-700 p-2 rounded shadow border border-gray-700 text-white">
                        <span className="text-xl">🔍+</span>
                    </button>
                    <button className="bg-gray-800/90 hover:bg-gray-700 p-2 rounded shadow border border-gray-700 text-white">
                        <span className="text-xl">🔍-</span>
                    </button>
                </div>

                <React.Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                        <div className="text-cyan-400 text-lg font-medium animate-pulse">Loading 3D Model...</div>
                    </div>
                }>
                    <Canvas>
                        <color attach="background" args={['#000000']} />

                        {/* Lighting */}
                        <ambientLight intensity={0.4} />
                        <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
                        <directionalLight position={[-10, 10, -5]} intensity={0.4} color="#4fc3f7" />
                        <pointLight position={[0, 50, 50]} intensity={0.5} color="#00d4ff" />

                        <PerspectiveCamera makeDefault position={[0, 50, 200]} fov={35} />

                        <HumanModel onOrganClick={onOrganClick} />

                        <OrbitControls
                            enablePan={false}
                            autoRotate={false}
                            minDistance={100}
                            maxDistance={400}
                        />
                    </Canvas>
                </React.Suspense>
            </div>
        </div>
    );
};

export default HealthTwinCanvas;
