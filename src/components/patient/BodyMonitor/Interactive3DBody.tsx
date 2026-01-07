import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface Interactive3DBodyProps {
    healthStatus: Array<{
        body_part_id: number;
        body_part_name: string;
        display_name: string;
        status: 'healthy' | 'monitoring' | 'concern' | 'critical';
    }>;
    onBodyPartClick: (bodyPartId: number) => void;
    selectedBodyPart: number | null;
}

const Interactive3DBody: React.FC<Interactive3DBodyProps> = ({
    healthStatus,
    onBodyPartClick,
    selectedBodyPart
}) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [hoveredPart, setHoveredPart] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0e1a);
        scene.fog = new THREE.Fog(0x0a0e1a, 10, 50);

        const camera = new THREE.PerspectiveCamera(
            50,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 1.5, 3);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);

        // Enhanced Lighting for medical visualization
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(5, 10, 7.5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0x4da6ff, 0.4);
        fillLight.position.set(-5, 3, -5);
        scene.add(fillLight);

        const backLight = new THREE.DirectionalLight(0xff9f4d, 0.3);
        backLight.position.set(0, 5, -5);
        scene.add(backLight);

        // Rim light for depth
        const rimLight = new THREE.DirectionalLight(0x6495ed, 0.5);
        rimLight.position.set(0, 0, -10);
        scene.add(rimLight);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 1.5;
        controls.maxDistance = 6;
        controls.maxPolarAngle = Math.PI / 1.5;

        // Body parts mapping for interaction
        const bodyPartsMeshes: Map<THREE.Mesh, { id: number; name: string }> = new Map();

        const getStatusColor = (partName: string): THREE.Color => {
            const part = healthStatus.find(
                h => h.body_part_name.toLowerCase().includes(partName.toLowerCase()) ||
                    partName.toLowerCase().includes(h.body_part_name.toLowerCase())
            );

            if (!part) return new THREE.Color(0x4ade80); // Green (healthy)

            switch (part.status) {
                case 'healthy':
                    return new THREE.Color(0x4ade80); // Green
                case 'monitoring':
                    return new THREE.Color(0x3b82f6); // Blue
                case 'concern':
                    return new THREE.Color(0xfbbf24); // Yellow
                case 'critical':
                    return new THREE.Color(0xef4444); // Red
                default:
                    return new THREE.Color(0x4ade80);
            }
        };

        // Try to load GLB model first, fallback to geometric if not found
        const loader = new GLTFLoader();

        loader.load(
            '/models/human-anatomy.glb', // You'll need to download this
            (gltf) => {
                console.log('✅ 3D Model loaded successfully');
                setLoading(false);

                const model = gltf.scene;
                model.scale.set(1, 1, 1);
                model.position.y = -1;

                // Process all meshes in the model
                model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;

                        // Make material responsive to health status
                        const partName = child.name || 'body';
                        const statusColor = getStatusColor(partName);

                        // Create a semi-transparent material with health color overlay
                        const material = new THREE.MeshPhongMaterial({
                            color: statusColor,
                            transparent: true,
                            opacity: 0.85,
                            shininess: 30,
                            emissive: statusColor,
                            emissiveIntensity: 0.2,
                            side: THREE.DoubleSide
                        });

                        child.material = material;

                        // Map mesh to body part data
                        const bodyPart = healthStatus.find(h =>
                            child.name.toLowerCase().includes(h.body_part_name.toLowerCase())
                        );

                        if (bodyPart) {
                            bodyPartsMeshes.set(child, {
                                id: bodyPart.body_part_id,
                                name: bodyPart.display_name
                            });
                        }
                    }
                });

                scene.add(model);
            },
            (progress) => {
                const percentComplete = (progress.loaded / progress.total) * 100;
                console.log(`Loading model: ${percentComplete.toFixed(0)}%`);
            },
            (error) => {
                console.warn('⚠️ Could not load GLB model, using fallback geometry');
                setLoadError(true);
                setLoading(false);
                createFallbackBody(); // Create geometric body if model fails to load
            }
        );

        // Fallback geometric body (enhanced version of original)
        function createFallbackBody() {
            const bodyGroup = new THREE.Group();

            // Head
            const headGeom = new THREE.SphereGeometry(0.35, 32, 32);
            const headMat = new THREE.MeshPhongMaterial({
                color: getStatusColor('head'),
                shininess: 50,
                transparent: true,
                opacity: 0.9
            });
            const head = new THREE.Mesh(headGeom, headMat);
            head.position.set(0, 1.9, 0);
            head.castShadow = true;
            bodyGroup.add(head);
            bodyPartsMeshes.set(head, { id: 1, name: 'Head' });

            // Neck
            const neckGeom = new THREE.CylinderGeometry(0.15, 0.18, 0.3, 16);
            const neckMat = new THREE.MeshPhongMaterial({
                color: getStatusColor('neck'),
                shininess: 40
            });
            const neck = new THREE.Mesh(neckGeom, neckMat);
            neck.position.set(0, 1.55, 0);
            neck.castShadow = true;
            bodyGroup.add(neck);
            bodyPartsMeshes.set(neck, { id: 8, name: 'Neck' });

            // Chest/Torso
            const torsoGeom = new THREE.BoxGeometry(0.9, 1.2, 0.5, 4, 4, 2);
            const torsoMat = new THREE.MeshPhongMaterial({
                color: getStatusColor('chest'),
                shininess: 30
            });
            const torso = new THREE.Mesh(torsoGeom, torsoMat);
            torso.position.set(0, 0.8, 0);
            torso.castShadow = true;
            bodyGroup.add(torso);
            bodyPartsMeshes.set(torso, { id: 9, name: 'Chest' });

            // Abdomen
            const abdomenGeom = new THREE.BoxGeometry(0.8, 0.6, 0.45);
            const abdomenMat = new THREE.MeshPhongMaterial({
                color: getStatusColor('abdomen'),
                shininess: 30
            });
            const abdomen = new THREE.Mesh(abdomenGeom, abdomenMat);
            abdomen.position.set(0, 0.0, 0);
            abdomen.castShadow = true;
            bodyGroup.add(abdomen);
            bodyPartsMeshes.set(abdomen, { id: 15, name: 'Abdomen' });

            // Arms
            const createArm = (side: number) => {
                const armGroup = new THREE.Group();

                // Upper arm
                const upperArmGeom = new THREE.CylinderGeometry(0.12, 0.11, 0.6, 16);
                const upperArmMat = new THREE.MeshPhongMaterial({
                    color: getStatusColor('arms'),
                    shininess: 40
                });
                const upperArm = new THREE.Mesh(upperArmGeom, upperArmMat);
                upperArm.position.set(side * 0.6, 0.9, 0);
                upperArm.castShadow = true;
                armGroup.add(upperArm);
                bodyPartsMeshes.set(upperArm, { id: 19, name: side > 0 ? 'Right Arm' : 'Left Arm' });

                // Forearm
                const forearmGeom = new THREE.CylinderGeometry(0.1, 0.09, 0.6, 16);
                const forearm = new THREE.Mesh(forearmGeom, upperArmMat.clone());
                forearm.position.set(side * 0.6, 0.3, 0);
                forearm.castShadow = true;
                armGroup.add(forearm);

                // Hand
                const handGeom = new THREE.SphereGeometry(0.1, 16, 16);
                const handMat = new THREE.MeshPhongMaterial({
                    color: getStatusColor('hands'),
                    shininess: 50
                });
                const hand = new THREE.Mesh(handGeom, handMat);
                hand.position.set(side * 0.6, -0.05, 0);
                hand.scale.set(1, 1.3, 0.6);
                hand.castShadow = true;
                armGroup.add(hand);
                bodyPartsMeshes.set(hand, { id: 22, name: side > 0 ? 'Right Hand' : 'Left Hand' });

                return armGroup;
            };

            bodyGroup.add(createArm(1));  // Right
            bodyGroup.add(createArm(-1)); // Left

            // Legs
            const createLeg = (side: number) => {
                const legGroup = new THREE.Group();

                // Thigh
                const thighGeom = new THREE.CylinderGeometry(0.15, 0.13, 0.8, 16);
                const thighMat = new THREE.MeshPhongMaterial({
                    color: getStatusColor('legs'),
                    shininess: 40
                });
                const thigh = new THREE.Mesh(thighGeom, thighMat);
                thigh.position.set(side * 0.25, -0.5, 0);
                thigh.castShadow = true;
                legGroup.add(thigh);
                bodyPartsMeshes.set(thigh, { id: 24, name: side > 0 ? 'Right Leg' : 'Left Leg' });

                // Lower leg
                const lowerLegGeom = new THREE.CylinderGeometry(0.12, 0.1, 0.8, 16);
                const lowerLeg = new THREE.Mesh(lowerLegGeom, thighMat.clone());
                lowerLeg.position.set(side * 0.25, -1.3, 0);
                lowerLeg.castShadow = true;
                legGroup.add(lowerLeg);

                // Foot
                const footGeom = new THREE.BoxGeometry(0.12, 0.1, 0.25);
                const footMat = new THREE.MeshPhongMaterial({
                    color: getStatusColor('feet'),
                    shininess: 50
                });
                const foot = new THREE.Mesh(footGeom, footMat);
                foot.position.set(side * 0.25, -1.75, 0.08);
                foot.castShadow = true;
                legGroup.add(foot);
                bodyPartsMeshes.set(foot, { id: 26, name: side > 0 ? 'Right Foot' : 'Left Foot' });

                return legGroup;
            };

            bodyGroup.add(createLeg(1));  // Right
            bodyGroup.add(createLeg(-1)); // Left

            scene.add(bodyGroup);
        }

        // Raycaster for click/hover detection
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseMove = (event: MouseEvent) => {
            if (!mountRef.current) return;

            const rect = mountRef.current.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            let found = false;
            for (const intersect of intersects) {
                const mesh = intersect.object as THREE.Mesh;
                const partData = bodyPartsMeshes.get(mesh);

                if (partData) {
                    setHoveredPart(partData.name);
                    document.body.style.cursor = 'pointer';

                    // Highlight effect
                    if (mesh.material instanceof THREE.MeshPhongMaterial) {
                        mesh.material.emissiveIntensity = 0.4;
                    }
                    found = true;
                    break;
                }
            }

            if (!found) {
                setHoveredPart(null);
                document.body.style.cursor = 'default';

                // Remove highlight from all meshes
                bodyPartsMeshes.forEach((data, mesh) => {
                    if (mesh.material instanceof THREE.MeshPhongMaterial) {
                        mesh.material.emissiveIntensity = 0.2;
                    }
                });
            }
        };

        const onClick = (event: MouseEvent) => {
            if (!mountRef.current) return;

            const rect = mountRef.current.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            for (const intersect of intersects) {
                const mesh = intersect.object as THREE.Mesh;
                const partData = bodyPartsMeshes.get(mesh);

                if (partData) {
                    onBodyPartClick(partData.id);
                    break;
                }
            }
        };

        renderer.domElement.addEventListener('mousemove', onMouseMove);
        renderer.domElement.addEventListener('click', onClick);

        // Animation loop
        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);

            const delta = clock.getDelta();
            controls.update();

            // Pulse selected part
            if (selectedBodyPart) {
                const pulseSpeed = 2;
                const pulseAmount = 0.05;
                const pulse = 1 + Math.sin(clock.elapsedTime * pulseSpeed) * pulseAmount;

                bodyPartsMeshes.forEach((data, mesh) => {
                    if (data.id === selectedBodyPart) {
                        mesh.scale.set(pulse, pulse, pulse);

                        if (mesh.material instanceof THREE.MeshPhongMaterial) {
                            mesh.material.emissiveIntensity = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.2;
                        }
                    } else {
                        mesh.scale.set(1, 1, 1);
                    }
                });
            }

            renderer.render(scene, camera);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            if (!mountRef.current) return;
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.domElement.removeEventListener('mousemove', onMouseMove);
            renderer.domElement.removeEventListener('click', onClick);
            mountRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, [healthStatus, selectedBodyPart, onBodyPartClick]);

    return (
        <div className="relative w-full h-full">
            <div ref={mountRef} className="w-full h-full" />

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <div className="text-white text-sm">Loading 3D Model...</div>
                    </div>
                </div>
            )}

            {loadError && (
                <div className="absolute top-4 right-4 bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-3 py-2 rounded-lg text-xs">
                    Using simplified model (download anatomical GLB for better visuals)
                </div>
            )}

            {hoveredPart && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-xl backdrop-blur-md pointer-events-none border border-white/20 shadow-lg">
                    <div className="font-semibold text-lg">{hoveredPart}</div>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-3 rounded-xl backdrop-blur-md text-sm border border-white/10">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                        <span>Healthy</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                        <span>Monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
                        <span>Concern</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                        <span>Critical</span>
                    </div>
                </div>
            </div>

            {/* Controls hint */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-4 py-2 rounded-xl backdrop-blur-md text-xs border border-white/10">
                <div className="text-gray-300">🖱️ Drag to rotate • Scroll to zoom</div>
            </div>
        </div>
    );
};

export default Interactive3DBody;
