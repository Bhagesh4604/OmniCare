import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

const ThreeBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const [hasError, setHasError] = React.useState(false);

    useEffect(() => {
        if (!containerRef.current || hasError) return;

        let renderer: THREE.WebGLRenderer | undefined;
        let animationId: number;
        let scene: THREE.Scene;
        let camera: THREE.PerspectiveCamera;
        let particleGeometry: THREE.BufferGeometry;
        let material: THREE.PointsMaterial;
        let helixPoints: THREE.Points;

        try {
            // --- SCENE SETUP ---
            scene = new THREE.Scene();
            // Fog for depth - lighter fog for light theme to keep it airy but visible
            scene.fog = new THREE.FogExp2(theme === 'dark' ? 0x000000 : 0xf0f9ff, theme === 'dark' ? 0.02 : 0.015);

            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 0, 30);

            renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true,
                powerPreference: "high-performance",
                failIfMajorPerformanceCaveat: true
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            containerRef.current.appendChild(renderer.domElement);

            // --- DNA HELIX PARAMETERS ---
            const DNA_PARTICLES_COUNT = 300;
            const HELIX_RADIUS = 6;
            const HELIX_LENGTH = 60;
            const HELIX_TURNS = 4;

            // Colors
            const colorStrand1 = new THREE.Color(theme === 'dark' ? 0x00ffff : 0x0044aa);
            const colorStrand2 = new THREE.Color(theme === 'dark' ? 0xff00ff : 0x8800cc);

            particleGeometry = new THREE.BufferGeometry();
            const positions: number[] = [];
            const colors: number[] = [];
            const sizes: number[] = [];

            const addParticle = (x: number, y: number, z: number, color: THREE.Color, size: number) => {
                positions.push(x, y, z);
                colors.push(color.r, color.g, color.b);
                sizes.push(size);
            };

            for (let i = 0; i < DNA_PARTICLES_COUNT; i++) {
                const t = i / DNA_PARTICLES_COUNT;
                const angle = t * Math.PI * 2 * HELIX_TURNS;
                const y = (t - 0.5) * HELIX_LENGTH;

                const x1 = Math.cos(angle) * HELIX_RADIUS;
                const z1 = Math.sin(angle) * HELIX_RADIUS;
                addParticle(x1, y, z1, colorStrand1, 0.3);

                const x2 = Math.cos(angle + Math.PI) * HELIX_RADIUS;
                const z2 = Math.sin(angle + Math.PI) * HELIX_RADIUS;
                addParticle(x2, y, z2, colorStrand2, 0.3);

                if (i % 15 === 0) {
                    const steps = 10;
                    for (let j = 1; j < steps; j++) {
                        const lerp = j / steps;
                        const xl = x1 + (x2 - x1) * lerp;
                        const yl = y;
                        const zl = z1 + (z2 - z1) * lerp;
                        addParticle(xl, yl, zl, new THREE.Color(theme === 'dark' ? 0xffffff : 0x333333), 0.1);
                    }
                }
            }

            for (let i = 0; i < 200; i++) {
                const x = (Math.random() - 0.5) * 80;
                const y = (Math.random() - 0.5) * 80;
                const z = (Math.random() - 0.5) * 50;
                addParticle(x, y, z, new THREE.Color(theme === 'dark' ? 0x88ccff : 0x99aacc), Math.random() * 0.2);
            }

            particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            material = new THREE.PointsMaterial({
                size: 0.3,
                vertexColors: true,
                map: getDiscTexture(),
                alphaTest: 0.5,
                transparent: true,
                opacity: 0.8,
                sizeAttenuation: true
            });

            helixPoints = new THREE.Points(particleGeometry, material);
            scene.add(helixPoints);

            // --- ANIMATION ---
            const clock = new THREE.Clock();

            const animate = () => {
                animationId = requestAnimationFrame(animate);
                const time = clock.getElapsedTime();
                const scrollY = window.scrollY;

                // Calculate Scroll Progress
                const maxScroll = document.body.scrollHeight - window.innerHeight;
                const scrollProgress = Math.min(scrollY / (maxScroll || 1), 1);

                let targetX = 0;
                let targetY = 0;
                let targetZ = 30;
                let targetRotZ = 0;

                if (scrollProgress < 0.3) {
                    const p = scrollProgress / 0.3;
                    targetX = THREE.MathUtils.lerp(0, -10, p);
                    targetY = THREE.MathUtils.lerp(0, 5, p);
                } else if (scrollProgress < 0.6) {
                    const p = (scrollProgress - 0.3) / 0.3;
                    targetX = THREE.MathUtils.lerp(-10, 10, p);
                    targetY = THREE.MathUtils.lerp(5, -5, p);
                    targetRotZ = THREE.MathUtils.lerp(0, Math.PI / 2, p);
                } else {
                    const p = (scrollProgress - 0.6) / 0.4;
                    targetX = THREE.MathUtils.lerp(10, 0, p);
                    targetY = THREE.MathUtils.lerp(-5, 0, p);
                    targetZ = THREE.MathUtils.lerp(30, 10, p);
                    targetRotZ = THREE.MathUtils.lerp(Math.PI / 2, Math.PI, p);
                }

                camera.position.x += (targetX - camera.position.x) * 0.05;
                camera.position.y += (targetY - camera.position.y) * 0.05;
                camera.position.z += (targetZ - camera.position.z) * 0.05;
                camera.lookAt(targetX * 0.5, targetY * 0.5, 0);

                helixPoints.rotation.y += 0.005;
                helixPoints.rotation.z += (targetRotZ - helixPoints.rotation.z) * 0.05;

                // ENHANCED MOUSE INTERACTION
                if ((window as any).mouseX) {
                    const mouseX = (window as any).mouseX;
                    const mouseY = (window as any).mouseY;

                    // Parallax
                    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
                    camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;

                    // Twist effect based on mouse x
                    helixPoints.rotation.y += mouseX * 0.05;
                }

                const scale = 1 + Math.sin(time * 2) * 0.05;
                helixPoints.scale.set(scale, scale, scale);

                if (renderer) renderer.render(scene, camera);
            };

            animate();

        } catch (e) {
            console.error("WebGL Initialization failed, falling back to CSS background:", e);
            setHasError(true);
            return;
        }

        const handleResize = () => {
            if (!camera || !renderer) return;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        // Track mouse globally for the animation loop to read
        const handleMouseMove = (event: MouseEvent) => {
            (window as any).mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
            (window as any).mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousemove', handleMouseMove);
            if (animationId) cancelAnimationFrame(animationId);

            if (containerRef.current && renderer) {
                containerRef.current.removeChild(renderer.domElement);
            }

            if (particleGeometry) particleGeometry.dispose();
            if (material) material.dispose();

            if (renderer) {
                renderer.dispose();
                renderer.forceContextLoss();
            }
        };
    }, [theme, hasError]);

    if (hasError) {
        return (
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
                {/* Fallback CSS pattern */}
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '50px 50px'
                }}></div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-b from-transparent to-background">
            <div ref={containerRef} className="absolute inset-0 z-0" />
            <div className={`absolute inset-0 z-10 bg-gradient-to-t ${theme === 'dark' ? 'from-black/60' : 'from-white/60'} to-transparent`} />
        </div>
    );
};

// Helper to create a soft glow texture programmatically
function getDiscTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    if (context) {
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

export default ThreeBackground;
