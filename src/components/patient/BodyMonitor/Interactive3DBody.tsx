import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a);

        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Create simple humanoid figure
        const bodyParts: { [key: string]: { mesh: THREE.Mesh; id: number; name: string } } = {};

        const getStatusColor = (partName: string): number => {
            const part = healthStatus.find(
                h => h.body_part_name.toLowerCase() === partName.toLowerCase()
            );

            if (!part) return 0x4ade80; // Green if no data (healthy)

            switch (part.status) {
                case 'healthy':
                    return 0x4ade80; // Green
                case 'monitoring':
                    return 0x3b82f6; // Blue
                case 'concern':
                    return 0xfbbf24; // Yellow
                case 'critical':
                    return 0xef4444; // Red
                default:
                    return 0x4ade80;
            }
        };

        // Head
        const headGeom = new THREE.SphereGeometry(0.3, 32, 32);
        const headMat = new THREE.MeshPhongMaterial({
            color: getStatusColor('head'),
            emissive: 0x222222
        });
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.set(0, 1.8, 0);
        scene.add(head);
        bodyParts['head'] = { mesh: head, id: 1, name: 'Head' };

        // Torso/Chest
        const torsoGeom = new THREE.BoxGeometry(0.8, 1, 0.4);
        const torsoMat = new THREE.MeshPhongMaterial({
            color: getStatusColor('chest'),
            emissive: 0x222222
        });
        const torso = new THREE.Mesh(torsoGeom, torsoMat);
        torso.position.set(0, 0.8, 0);
        scene.add(torso);
        bodyParts['chest'] = { mesh: torso, id: 9, name: 'Chest' };

        // Arms
        const armGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.9);

        const leftArmMat = new THREE.MeshPhongMaterial({
            color: getStatusColor('arms'),
            emissive: 0x222222
        });
        const leftArm = new THREE.Mesh(armGeom, leftArmMat);
        leftArm.position.set(-0.55, 0.8, 0);
        scene.add(leftArm);
        bodyParts['left_arm'] = { mesh: leftArm, id: 19, name: 'Left Arm' };

        const rightArm = leftArm.clone();
        rightArm.position.set(0.55, 0.8, 0);
        scene.add(rightArm);
        bodyParts['right_arm'] = { mesh: rightArm, id: 19, name: 'Right Arm' };

        // Legs
        const legGeom = new THREE.CylinderGeometry(0.15, 0.12, 1.2);

        const leftLegMat = new THREE.MeshPhongMaterial({
            color: getStatusColor('legs'),
            emissive: 0x222222
        });
        const leftLeg = new THREE.Mesh(legGeom, leftLegMat);
        leftLeg.position.set(-0.25, -0.4, 0);
        scene.add(leftLeg);
        bodyParts['left_leg'] = { mesh: leftLeg, id: 24, name: 'Left Leg' };

        const rightLeg = leftLeg.clone();
        rightLeg.position.set(0.25, -0.4, 0);
        scene.add(rightLeg);
        bodyParts['right_leg'] = { mesh: rightLeg, id: 24, name: 'Right Leg' };

        // Raycaster for click detection
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseMove = (event: MouseEvent) => {
            if (!mountRef.current) return;

            const rect = mountRef.current.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(Object.values(bodyParts).map(p => p.mesh));

            if (intersects.length > 0) {
                const intersected = intersects[0].object as THREE.Mesh;
                const partEntry = Object.entries(bodyParts).find(([_, data]) => data.mesh === intersected);

                if (partEntry) {
                    setHoveredPart(partEntry[1].name);
                    document.body.style.cursor = 'pointer';
                }
            } else {
                setHoveredPart(null);
                document.body.style.cursor = 'default';
            }
        };

        const onClick = (event: MouseEvent) => {
            if (!mountRef.current) return;

            const rect = mountRef.current.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(Object.values(bodyParts).map(p => p.mesh));

            if (intersects.length > 0) {
                const intersected = intersects[0].object as THREE.Mesh;
                const partEntry = Object.entries(bodyParts).find(([_, data]) => data.mesh === intersected);

                if (partEntry) {
                    onBodyPartClick(partEntry[1].id);
                }
            }
        };

        renderer.domElement.addEventListener('mousemove', onMouseMove);
        renderer.domElement.addEventListener('click', onClick);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();

            // Pulse selected part
            if (selectedBodyPart) {
                Object.values(bodyParts).forEach(part => {
                    if (part.id === selectedBodyPart) {
                        const scale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
                        part.mesh.scale.set(scale, scale, scale);
                    } else {
                        part.mesh.scale.set(1, 1, 1);
                    }
                });
            }

            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            renderer.domElement.removeEventListener('mousemove', onMouseMove);
            renderer.domElement.removeEventListener('click', onClick);
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, [healthStatus, selectedBodyPart, onBodyPartClick]);

    return (
        <div className="relative w-full h-full">
            <div ref={mountRef} className="w-full h-full" />

            {hoveredPart && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm pointer-events-none">
                    {hoveredPart}
                </div>
            )}

            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-3 rounded-lg backdrop-blur-sm text-sm">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Healthy</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Concern</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Critical</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Interactive3DBody;
