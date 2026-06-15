/* ═══════════════════════════════════════════════════════════
   GRID // F1 PORTFOLIO — MAIN SCRIPT
   Orchestrates: Lenis, GSAP/ScrollTrigger, cursor, car path,
   grain, speedometer, loading screen, and all section animations.
   ═══════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ────────────────────────────────────────────
    // CONSTANTS
    // ────────────────────────────────────────────
    const SECTIONS = [
        { id: 'hero',     num: '01', name: 'IGNITION' },
        { id: 'about',    num: '02', name: 'DRIVER' },
        { id: 'projects', num: '03', name: 'GRANDS PRIX' },
        { id: 'skills',   num: '04', name: 'COMPLIANCE' },
        { id: 'contact',  num: '05', name: 'PIT RADIO' },
    ];

    // ────────────────────────────────────────────
    // GRAIN NOISE CANVAS
    // ────────────────────────────────────────────
    function initGrain() {
        const canvas = document.getElementById('grainCanvas');
        if (!canvas) return;

        // Generate a small 128x128 noise pattern once
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 128;
        tempCanvas.height = 128;
        const tempCtx = tempCanvas.getContext('2d');
        const imgData = tempCtx.createImageData(128, 128);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            const v = Math.random() * 255;
            data[i] = v;
            data[i + 1] = v;
            data[i + 2] = v;
            data[i + 3] = 12; // Muted opacity for perfect integration
        }
        tempCtx.putImageData(imgData, 0, 0);

        // Export to base64 and set as repeating CSS background
        const dataUrl = tempCanvas.toDataURL();
        canvas.style.backgroundImage = `url(${dataUrl})`;
        canvas.style.backgroundRepeat = 'repeat';
        canvas.style.backgroundSize = '128px 128px';

        // Trigger hardware-accelerated CSS flicker animation
        canvas.classList.add('flicker-active');
    }

    // ────────────────────────────────────────────
    // CUSTOM CURSOR
    // ────────────────────────────────────────────
    function initCursor() {
        const dot = document.getElementById('cursorDot');
        const ring = document.getElementById('cursorRing');
        if (!dot || !ring) return;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        const lerpFactor = 0.28; // Increased for snappier tracking

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            // Instantly translate dot on mousemove event for zero-latency feel
            dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        });

        // Hover detection
        const hoverTargets = document.querySelectorAll('[data-cursor-hover], a, button');
        hoverTargets.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                dot.classList.add('hovering');
                ring.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                dot.classList.remove('hovering');
                ring.classList.remove('hovering');
            });
        });

        function cursorLoop() {
            // Ring lerps with higher coefficient
            ringX += (mouseX - ringX) * lerpFactor;
            ringY += (mouseY - ringY) * lerpFactor;
            ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

            requestAnimationFrame(cursorLoop);
        }
        cursorLoop();
    }

    // ────────────────────────────────────────────
    // SPEEDOMETER
    // ────────────────────────────────────────────
    function initSpeedometer() {
        const speedEl = document.getElementById('speedValue');
        const speedBarEl = document.getElementById('speedBar');
        if (!speedEl || !speedBarEl) return;

        let lastScroll = window.scrollY;
        let speed = 0;
        let displaySpeed = 0;

        function updateSpeed() {
            const currentScroll = window.scrollY;
            const delta = Math.abs(currentScroll - lastScroll);
            lastScroll = currentScroll;

            // Map delta to a "km/h" feel (arbitrary scaling)
            const targetSpeed = Math.min(Math.round(delta * 3.5), 360);
            speed += (targetSpeed - speed) * 0.35;
            displaySpeed = Math.round(speed);

            speedEl.textContent = String(displaySpeed).padStart(3, '0');
            speedBarEl.style.width = Math.min((displaySpeed / 360) * 100, 100) + '%';

            // Color shift at high speed
            if (displaySpeed > 200) {
                speedEl.style.color = '#E8293C';
            } else {
                speedEl.style.color = '#F0F0F0';
            }

            requestAnimationFrame(updateSpeed);
        }
        updateSpeed();
    }

    // ────────────────────────────────────────────
    // SECTION LABEL UPDATER
    // ────────────────────────────────────────────
    function initSectionLabel() {
        const labelEl = document.getElementById('sectionLabel');
        const numEl = labelEl.querySelector('.section-label-num');
        const nameEl = labelEl.querySelector('.section-label-name');

        SECTIONS.forEach((sec) => {
            const sectionEl = document.getElementById(sec.id);
            if (!sectionEl) return;

            ScrollTrigger.create({
                trigger: sectionEl,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => updateLabel(sec),
                onEnterBack: () => updateLabel(sec),
            });
        });

        function updateLabel(sec) {
            numEl.textContent = sec.num;
            nameEl.textContent = sec.name;
        }
    }

    // ────────────────────────────────────────────
    // THREE.JS 3D CAR SETUP — GLB MODEL LOADER
    // ────────────────────────────────────────────
    function initCarThreeJS(retryCount) {
        retryCount = retryCount || 0;
        const MAX_RETRIES = 3;

        const canvas = document.getElementById('carCanvas');
        if (!canvas) { console.error('[CarThreeJS] #carCanvas not found'); return null; }
        if (!window.THREE) { console.error('[CarThreeJS] window.THREE not found — CDN failed'); return null; }

        // Sized to show model detail without being too large on screen
        const CAR_W = 200;
        const CAR_H = 140;
        canvas.width  = CAR_W;
        canvas.height = CAR_H;
        canvas.style.width  = CAR_W + 'px';
        canvas.style.height = CAR_H + 'px';
        canvas.style.opacity = '0';
        canvas.style.transition = 'opacity 0.8s ease';

        let renderer, scene, camera, car;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: false, // Disabled — saves GPU context resources
                powerPreference: 'low-power', // Request lightweight GPU allocation
                failIfMajorPerformanceCaveat: false, // Allow software fallback
            });
            renderer.setSize(CAR_W, CAR_H);
            renderer.setPixelRatio(1); // Fixed at 1x — small canvas doesn't need retina
            renderer.shadowMap.enabled = false;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.6;
            renderer.outputEncoding = THREE.sRGBEncoding;

            // Handle runtime context loss dynamically to fall back instantly to 2D SVG
            canvas.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                console.warn('[CarThreeJS] WebGL context lost at runtime! Switching to 2D fallback.');
                canvas.style.display = 'none';
                const fallback = document.getElementById('fallbackCar');
                if (fallback) {
                    fallback.style.display = '';
                    if (typeof ScrollTrigger !== 'undefined') {
                        ScrollTrigger.refresh();
                    }
                }
            }, false);

            scene = new THREE.Scene();

            // Camera — steeper top-down view to minimize parallax offset from path
            camera = new THREE.PerspectiveCamera(28, CAR_W / CAR_H, 0.01, 200);
            camera.position.set(0, 5.0, 4.0);
            camera.lookAt(0, 0, 0);

            car = new THREE.Group();
            scene.add(car);
        } catch (e) {
            console.warn('[CarThreeJS] WebGL context creation failed. Falling back to 2D SVG car immediately.', e.message);
            // Hide the canvas so no white box appears
            canvas.style.display = 'none';
            return null;
        }

        // ── STUDIO LIGHTING ──
        // Ambient base
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambient);

        // Key light — warm white from top-right
        const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
        keyLight.position.set(5, 10, 5);
        keyLight.castShadow = false; // Disable shadow maps
        scene.add(keyLight);

        // Fill light — subtle red tint from left (F1 branding)
        const fillLight = new THREE.DirectionalLight(0xe8293c, 0.8);
        fillLight.position.set(-5, 3, -2);
        scene.add(fillLight);

        // Rim light — cool blue from behind for edge separation
        const rimLight = new THREE.DirectionalLight(0x6688cc, 0.6);
        rimLight.position.set(0, 2, -8);
        scene.add(rimLight);

        // Ground bounce — subtle warm uplighting
        const bounceLight = new THREE.DirectionalLight(0xffd4a0, 0.3);
        bounceLight.position.set(0, -3, 2);
        scene.add(bounceLight);

        // Point light near cockpit for highlight pop
        const accentLight = new THREE.PointLight(0xe8293c, 1.0, 8);
        accentLight.position.set(0, 2, 0);
        scene.add(accentLight);

        // ── LOAD GLB MODEL ──
        let modelLoaded = false;
        const targetSize = 1.7;

        if (THREE.GLTFLoader) {
            try {
                const loader = new THREE.GLTFLoader();

                // Configure Draco decoder for compressed meshes
                if (THREE.DRACOLoader) {
                    const dracoLoader = new THREE.DRACOLoader();
                    dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/libs/draco/');
                    loader.setDRACOLoader(dracoLoader);
                }

                console.log('[CarThreeJS] Loading Ferrari F1 GLB model...');

                loader.load(
                    'ferrari_f1_2019.glb',
                    function (gltf) {
                        console.log('[CarThreeJS] GLB model loaded successfully!');
                        const model = gltf.scene;

                        // Auto-center and scale the model
                        const box = new THREE.Box3().setFromObject(model);
                        const center = box.getCenter(new THREE.Vector3());
                        const size = box.getSize(new THREE.Vector3());

                        // Center the model at origin
                        model.position.sub(center);

                        // Scale to fit nicely in view (target size)
                        const maxDim = Math.max(size.x, size.y, size.z);
                        const scaleFactor = targetSize / maxDim;
                        model.scale.multiplyScalar(scaleFactor);

                        // Shift model to align cockpit/pivot with origin (0,0,0)
                        model.position.z += 0.15;

                        // Enhance materials without rendering shadow maps
                        model.traverse(function (child) {
                            if (child.isMesh) {
                                child.castShadow = false;
                                child.receiveShadow = false;
                                // Boost material quality
                                if (child.material) {
                                    if (Array.isArray(child.material)) {
                                        child.material.forEach(function (mat) {
                                            mat.envMapIntensity = 1.0;
                                            mat.needsUpdate = true;
                                        });
                                    } else {
                                        child.material.envMapIntensity = 1.0;
                                        child.material.needsUpdate = true;
                                    }
                                }
                            }
                        });

                        car.add(model);
                        modelLoaded = true;

                        // Fade in the canvas
                        canvas.style.opacity = '1';
                        console.log('[CarThreeJS] Model dimensions:', size, 'Scale factor:', scaleFactor);
                    },
                    function (xhr) {
                        if (xhr.lengthComputable) {
                            const pct = Math.round((xhr.loaded / xhr.total) * 100);
                            console.log('[CarThreeJS] Loading: ' + pct + '%');
                        }
                    },
                    function (error) {
                        console.error('[CarThreeJS] Failed to load GLB:', error);
                        // Fallback: create a simple placeholder
                        buildFallbackCar(car);
                        modelLoaded = true;
                        canvas.style.opacity = '1';
                    }
                );
            } catch (err) {
                console.error('[CarThreeJS] GLTFLoader initialization failed:', err);
                buildFallbackCar(car);
                modelLoaded = true;
                canvas.style.opacity = '1';
            }
        } else {
            console.warn('[CarThreeJS] GLTFLoader not available, using fallback');
            buildFallbackCar(car);
            modelLoaded = true;
            canvas.style.opacity = '1';
        }

        // Fallback procedural car (if GLB fails)
        function buildFallbackCar(group) {
            const redMat = new THREE.MeshStandardMaterial({ color: 0xe8293c, metalness: 0.4, roughness: 0.3 });
            const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.7, roughness: 0.2 });
            const bodyGeo = new THREE.BoxGeometry(0.72, 0.22, 2.2);
            const body = new THREE.Mesh(bodyGeo, redMat);
            body.position.set(0, 0.12, 0);
            body.castShadow = true;
            group.add(body);

            const noseGeo = new THREE.CylinderGeometry(0.04, 0.22, 0.9, 8);
            const nose = new THREE.Mesh(noseGeo, darkMat);
            nose.position.set(0, 0.08, 1.4);
            nose.scale.set(1, 0.5, 1);
            nose.castShadow = true;
            group.add(nose);

            group.scale.set(0.62, 0.62, 0.62);
        }

        // ── RENDER LOOP ──
        function renderCar() {
            requestAnimationFrame(renderCar);
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        }
        renderCar();

        // Return interface for path controller
        return { car, canvas, renderer, scene, camera };
    }

    // ────────────────────────────────────────────
    // 2D FALLBACK CAR (when WebGL is unavailable)
    // ────────────────────────────────────────────
    function createFallbackCar() {
        const el = document.createElement('div');
        el.id = 'fallbackCar';
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80">
            <!-- Rear Wing -->
            <rect x="42" y="5" width="16" height="6" rx="1" fill="#111111" />
            <rect x="40" y="8" width="20" height="2" fill="#E8293C" />
            <!-- Rear Wing Endplates -->
            <rect x="38" y="3" width="2" height="10" fill="#E8293C" />
            <rect x="60" y="3" width="2" height="10" fill="#E8293C" />
            <!-- Rear Suspension & Axle -->
            <rect x="35" y="18" width="30" height="2" fill="#555555" />
            <!-- Rear Wheels -->
            <rect x="28" y="10" width="10" height="18" rx="2" fill="#111111" />
            <rect x="62" y="10" width="10" height="18" rx="2" fill="#111111" />
            <!-- Main Chassis / Body -->
            <path d="M46 11 L54 11 L55 35 L56 65 L54 82 L46 82 L44 65 L45 35 Z" fill="#E8293C" />
            <!-- Side Pods -->
            <path d="M45 30 L37 38 L37 55 L45 65 Z" fill="#C01B2A" />
            <path d="M55 30 L63 38 L63 55 L55 65 Z" fill="#C01B2A" />
            <!-- Bargeboards -->
            <path d="M37 55 L40 68 L45 72 L45 55 Z" fill="#222222" />
            <path d="M63 55 L60 68 L55 72 L55 55 Z" fill="#222222" />
            <!-- Engine Cover Fin -->
            <rect x="49" y="35" width="2" height="25" fill="#C01B2A" />
            <!-- Cockpit / Driver Opening -->
            <path d="M46 50 C46 45, 54 45, 54 50 L53 60 C53 62, 47 62, 47 60 Z" fill="#111111" />
            <!-- Helmet -->
            <circle cx="50" cy="54" r="3" fill="#FFFFFF" />
            <!-- Front Suspension -->
            <line x1="38" y1="78" x2="50" y2="76" stroke="#555555" stroke-width="1.5" />
            <line x1="62" y1="78" x2="50" y2="76" stroke="#555555" stroke-width="1.5" />
            <!-- Front Wheels -->
            <rect x="30" y="70" width="8" height="16" rx="1.5" fill="#111111" />
            <rect x="62" y="70" width="8" height="16" rx="1.5" fill="#111111" />
            <!-- Nosecone -->
            <path d="M46 82 L54 82 L52 94 L48 94 Z" fill="#E8293C" />
            <!-- Front Wing -->
            <rect x="25" y="93" width="50" height="3" fill="#111111" />
            <rect x="25" y="91" width="4" height="5" fill="#E8293C" />
            <rect x="71" y="91" width="4" height="5" fill="#E8293C" />
        </svg>`;
        Object.assign(el.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '80px',
            height: '80px',
            zIndex: '1000',
            pointerEvents: 'none',
            filter: 'drop-shadow(0 0 8px rgba(232, 41, 60, 0.6))',
            transition: 'opacity 0.5s ease',
            opacity: '1',
        });
        document.body.appendChild(el);
        console.log('[CarFallback] Premium top-down 2D SVG car created as WebGL fallback');
        return el;
    }

    // ────────────────────────────────────────────
    // CAR ON SVG PATH
    // ────────────────────────────────────────────
    function initCarPath(threeCtx) {
        const trailPath = document.getElementById('trailPath');
        const carGroup  = document.getElementById('carGroup'); // marker only
        if (!trailPath) return;

        const totalLength = trailPath.getTotalLength();

        // SVG is viewBox 0-100 mapped to full viewport
        function svgToScreen(svgX, svgY) {
            return {
                x: (svgX / 100) * window.innerWidth,
                y: (svgY / 100) * window.innerHeight,
            };
        }

        // Set initial dasharray/offset
        trailPath.style.strokeDasharray = totalLength;
        trailPath.style.strokeDashoffset = totalLength;

        const canvas = threeCtx ? threeCtx.canvas : null;
        const car3d  = threeCtx ? threeCtx.car    : null;

        // ALWAYS create the fallback 2D car so it's ready in DOM
        const fallbackEl = createFallbackCar();
        
        // Hide fallback if WebGL canvas is available and not already hidden/failed
        if (canvas && canvas.style.display !== 'none') {
            fallbackEl.style.display = 'none';
        } else {
            fallbackEl.style.display = '';
            if (canvas) canvas.style.display = 'none';
        }

        const anchor3dX = Math.round(200 * 0.50);
        const anchor3dH = Math.round(140 * 0.50);
        const anchor2dX = 40; // 80 * 0.50
        const anchor2dH = 40; // 80 * 0.50

        // Start elements at beginning of path
        const start = svgToScreen(5, 3);
        if (canvas) {
            canvas.style.transform = `translate(${start.x - anchor3dX}px, ${start.y - anchor3dH}px)`;
        }
        if (fallbackEl) {
            const initialAngleDeg = (Math.PI / 2 + Math.PI / 2) * (180 / Math.PI); // 180 degrees
            fallbackEl.style.transform = `translate(${start.x - anchor2dX}px, ${start.y - anchor2dH}px) rotate(${initialAngleDeg}deg)`;
        }

        ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.05, // Instantly snap car position to scroll to feel fast and agile
            onUpdate: (self) => {
                const progress = self.progress;

                // Update minimap car position
                const minimapTrack = document.querySelector('.minimap-track');
                const minimapCar = document.getElementById('minimapCar');
                if (minimapTrack && minimapCar) {
                    const miniLength = minimapTrack.getTotalLength();
                    const miniPt = minimapTrack.getPointAtLength(miniLength * progress);
                    minimapCar.setAttribute('cx', miniPt.x);
                    minimapCar.setAttribute('cy', miniPt.y);
                }

                // Trail reveal
                trailPath.style.strokeDashoffset = totalLength * (1 - progress);

                // Path position in SVG coords
                const pt = trailPath.getPointAtLength(totalLength * progress);

                // Rotation angle from tangent
                const eps = 0.005;
                const p1 = trailPath.getPointAtLength(totalLength * Math.max(0, progress - eps));
                const p2 = trailPath.getPointAtLength(totalLength * Math.min(1, progress + eps));
                const svgAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

                const screen = svgToScreen(pt.x, pt.y);

                // Update 3D canvas position
                if (canvas && canvas.style.display !== 'none') {
                    canvas.style.transform = `translate(${screen.x - anchor3dX}px, ${screen.y - anchor3dH}px)`;
                }

                // Update 2D fallback position and rotation
                if (fallbackEl && fallbackEl.style.display !== 'none') {
                    const angleDeg = (svgAngle + Math.PI / 2) * (180 / Math.PI);
                    fallbackEl.style.transform =
                        `translate(${screen.x - anchor2dX}px, ${screen.y - anchor2dH}px) rotate(${angleDeg}deg)`;
                }

                // Rotate 3D car to match path direction
                if (car3d) {
                    car3d.rotation.y = -svgAngle - Math.PI / 2;
                }

                // Highlight active corner marker
                const markers = document.querySelectorAll('.corner-marker');
                markers.forEach(m => m.classList.remove('active'));

                if (progress >= 0.18 && progress < 0.38) {
                    document.getElementById('marker-t1')?.classList.add('active');
                } else if (progress >= 0.38 && progress < 0.58) {
                    document.getElementById('marker-t2')?.classList.add('active');
                } else if (progress >= 0.58 && progress < 0.78) {
                    document.getElementById('marker-t3')?.classList.add('active');
                } else if (progress >= 0.78) {
                    document.getElementById('marker-t4')?.classList.add('active');
                }
            },
        });
    }


    // ────────────────────────────────────────────
    // LOADING SCREEN
    // ────────────────────────────────────────────
    function initLoader(onComplete) {
        const loader = document.getElementById('loader');
        const loaderBar = document.getElementById('loaderBar');
        const loaderPercent = document.getElementById('loaderPercent');
        const panelLeft = document.getElementById('loaderLeft');
        const panelRight = document.getElementById('loaderRight');

        const tl = gsap.timeline({
            onComplete: () => {
                loader.style.pointerEvents = 'none';
                if (onComplete) onComplete();
            },
        });

        // Bar fill
        tl.to(loaderBar, {
            width: '100%',
            duration: 0.5,
            ease: 'power2.inOut',
            onUpdate: function () {
                const p = Math.round(this.progress() * 100);
                loaderPercent.textContent = p + '%';
            },
        });

        // Pause briefly
        tl.to({}, { duration: 0.1 });

        // Fade out label and bar
        tl.to('.loader-content', {
            opacity: 0,
            duration: 0.15,
            ease: 'power2.in',
        });

        // Panels split
        tl.to(panelLeft, {
            xPercent: -100,
            duration: 0.45,
            ease: 'power3.inOut',
        }, '-=0.05');

        tl.to(panelRight, {
            xPercent: 100,
            duration: 0.45,
            ease: 'power3.inOut',
        }, '<');

        // Remove loader
        tl.set(loader, { display: 'none' });

        return tl;
    }

    // ────────────────────────────────────────────
    // HERO ANIMATIONS
    // ────────────────────────────────────────────
    function initHeroAnimations() {
        const heroTl = gsap.timeline({ delay: 0.1 });

        // Clip-path reveal for text lines
        const clipEls = document.querySelectorAll('.anim-clip');
        clipEls.forEach((el, i) => {
            heroTl.to(el, {
                clipPath: 'inset(0% 0 0 0)',
                opacity: 1,
                duration: 0.5,
                ease: 'power3.out',
            }, i * 0.07);
        });

        // Scroll cue
        heroTl.fromTo('.scroll-cue-line', 
            { scaleX: 0 },
            { scaleX: 1, duration: 0.4, ease: 'power2.out' },
            '-=0.25'
        );
        heroTl.fromTo('.scroll-cue-text',
            { opacity: 0, x: -10 },
            { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' },
            '-=0.2'
        );

        // Speed lines flash
        const speedLines = document.querySelectorAll('.speed-line');
        const speedLinesSvg = document.getElementById('speedLines');

        gsap.set(speedLinesSvg, { opacity: 1 });
        speedLines.forEach((line, i) => {
            heroTl.fromTo(line, 
                { strokeDasharray: '800', strokeDashoffset: '800' },
                { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' },
                0.03 * i
            );
        });

        // Fade speed lines out after entrance
        heroTl.to(speedLinesSvg, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.in',
        }, '+=0.3');
    }

    // ────────────────────────────────────────────
    // SCROLL ANIMATIONS (SECTIONS)
    // ────────────────────────────────────────────
    function initScrollAnimations() {
        // ── HUD and Video Overlay Toggle ──
        const hudElements = '#satelliteMinimap, #speedometer, #carPathSvg, #cornerMarkers, #carCanvas';
        
        ScrollTrigger.create({
            trigger: '#hero',
            start: 'bottom 85%',
            end: 'bottom 15%',
            onLeave: () => {
                gsap.to(hudElements, { opacity: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
                gsap.to('.video-bg', { opacity: 0.68, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
                gsap.to('.video-bg-overlay', { opacity: 0.25, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
                gsap.to('#sectionLabel', { opacity: 0.5, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
            },
            onEnterBack: () => {
                gsap.to(hudElements, { opacity: 1, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
                gsap.to('.video-bg', { opacity: 0.42, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
                gsap.to('.video-bg-overlay', { opacity: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
                gsap.to('#sectionLabel', { opacity: 1, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
            }
        });

        // ── Panel Scroll Animations (Centered Transitions) ──

        // Hero Panel (Drops from Top)
        gsap.fromTo('.hero-panel', 
            { xPercent: -50, yPercent: -250 },
            {
                xPercent: -50,
                yPercent: -50,
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top 50%',
                    end: 'bottom 50%',
                    toggleActions: 'play reverse play reverse',
                    onEnter: () => document.querySelector('.hero-panel')?.classList.add('active'),
                    onLeave: () => document.querySelector('.hero-panel')?.classList.remove('active'),
                    onEnterBack: () => document.querySelector('.hero-panel')?.classList.add('active'),
                    onLeaveBack: () => document.querySelector('.hero-panel')?.classList.remove('active'),
                },
                duration: 0.8,
                ease: 'power3.out'
            }
        );

        // About Panel (Slides in from Left)
        gsap.fromTo('.about-panel', 
            { xPercent: -250, yPercent: -50 },
            {
                xPercent: -50,
                yPercent: -50,
                scrollTrigger: {
                    trigger: '#about',
                    start: 'top 50%',
                    end: 'bottom 50%',
                    toggleActions: 'play reverse play reverse',
                    onEnter: () => document.querySelector('.about-panel')?.classList.add('active'),
                    onLeave: () => document.querySelector('.about-panel')?.classList.remove('active'),
                    onEnterBack: () => document.querySelector('.about-panel')?.classList.add('active'),
                    onLeaveBack: () => document.querySelector('.about-panel')?.classList.remove('active'),
                },
                duration: 0.8,
                ease: 'power3.out'
            }
        );

        // Projects Panel (Slides in from Right)
        gsap.fromTo('.projects-panel', 
            { xPercent: 150, yPercent: -50 },
            {
                xPercent: -50,
                yPercent: -50,
                scrollTrigger: {
                    trigger: '#projects',
                    start: 'top 50%',
                    end: 'bottom 50%',
                    toggleActions: 'play reverse play reverse',
                    onEnter: () => document.querySelector('.projects-panel')?.classList.add('active'),
                    onLeave: () => document.querySelector('.projects-panel')?.classList.remove('active'),
                    onEnterBack: () => document.querySelector('.projects-panel')?.classList.add('active'),
                    onLeaveBack: () => document.querySelector('.projects-panel')?.classList.remove('active'),
                },
                duration: 0.8,
                ease: 'power3.out'
            }
        );

        // Skills Panel (Slides up from Bottom)
        gsap.fromTo('.skills-panel', 
            { xPercent: -50, yPercent: 150 },
            {
                xPercent: -50,
                yPercent: -50,
                scrollTrigger: {
                    trigger: '#skills',
                    start: 'top 50%',
                    end: 'bottom 50%',
                    toggleActions: 'play reverse play reverse',
                    onEnter: () => document.querySelector('.skills-panel')?.classList.add('active'),
                    onLeave: () => document.querySelector('.skills-panel')?.classList.remove('active'),
                    onEnterBack: () => document.querySelector('.skills-panel')?.classList.add('active'),
                    onLeaveBack: () => document.querySelector('.skills-panel')?.classList.remove('active'),
                },
                duration: 0.8,
                ease: 'power3.out'
            }
        );

        // Contact Panel (Fades & Scales in)
        gsap.fromTo('.contact-panel', 
            { xPercent: -50, yPercent: -50, scale: 0.9, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                xPercent: -50,
                yPercent: -50,
                scrollTrigger: {
                    trigger: '#contact',
                    start: 'top 50%',
                    end: 'bottom 50%',
                    toggleActions: 'play reverse play reverse',
                    onEnter: () => document.querySelector('.contact-panel')?.classList.add('active'),
                    onLeave: () => document.querySelector('.contact-panel')?.classList.remove('active'),
                    onEnterBack: () => document.querySelector('.contact-panel')?.classList.add('active'),
                    onLeaveBack: () => document.querySelector('.contact-panel')?.classList.remove('active'),
                },
                duration: 0.6,
                ease: 'power2.out'
            }
        );

        // ── Show fixed UI after loader ──
        gsap.to('#sectionLabel', { opacity: 1, duration: 0.5, delay: 0.2 });
        gsap.to('#speedometer', { opacity: 1, duration: 0.5, delay: 0.3 });
        gsap.to('#carPathSvg', { opacity: 1, duration: 0.6, delay: 0.4 });
        gsap.to('#cornerMarkers', { opacity: 1, duration: 0.6, delay: 0.4 });

        document.getElementById('sectionLabel')?.classList.add('visible');
        document.getElementById('speedometer')?.classList.add('visible');
        document.getElementById('carPathSvg')?.classList.add('visible');
        document.getElementById('cornerMarkers')?.classList.add('visible');
    }

    // ────────────────────────────────────────────
    // UPDATE STROKE-FILL HEADING PSEUDO-ELEMENT
    // (CSS custom property approach)
    // ────────────────────────────────────────────
    function patchStrokeFillCSS() {
        // Inject a tiny style rule that uses the custom property
        const style = document.createElement('style');
        style.textContent = `
            .section-heading::after {
                clip-path: inset(0 var(--clip-progress, 100%) 0 0);
            }
        `;
        document.head.appendChild(style);
    }

    // ────────────────────────────────────────────
    // INIT EVERYTHING
    // ────────────────────────────────────────────
    function init() {
        // Safe check for GSAP
        if (typeof gsap === 'undefined') {
            console.error('[GRID] GSAP is not defined. Falling back to non-animated layout.');
            // Hide loader immediately so content is visible
            const loader = document.getElementById('loader');
            if (loader) loader.style.display = 'none';
            // Show all hidden elements
            const clipEls = document.querySelectorAll('.anim-clip');
            clipEls.forEach(el => {
                el.style.clipPath = 'inset(0% 0 0 0)';
                el.style.opacity = '1';
            });
            const fadeEls = document.querySelectorAll('.anim-fade');
            fadeEls.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            initGrain();
            initCursor();
            return;
        }

        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
        patchStrokeFillCSS();

        // Lenis smooth scroll
        let lenis = null;
        if (typeof Lenis !== 'undefined') {
            lenis = new Lenis({
                duration: 0.7, // Reduced from 1.2 for snappier response
                easing: (t) => 1 - Math.pow(1 - t, 4), // Quartic Out: fast response, swift settle
                orientation: 'vertical',
                smoothWheel: true,
            });

            // Sync Lenis with GSAP ticker
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);

            // Connect Lenis scroll to ScrollTrigger
            if (typeof ScrollTrigger !== 'undefined') {
                lenis.on('scroll', ScrollTrigger.update);
            }
        }

        // Init subsystems
        initGrain();
        initCursor();
        initSpeedometer();

        // Build 3D car (Three.js) FIRST — secure WebGL context before video decoding
        const threeCtx = initCarThreeJS();

        // Start background video AFTER WebGL context is secured (defer to avoid GPU contention)
        setTimeout(initBackgroundVideo, 500);

        // Loading sequence → then reveal
        initLoader(() => {
            initHeroAnimations();
            initScrollAnimations();
            initSectionLabel();
            initCarPath(threeCtx);
        });
    }

    // ────────────────────────────────────────────
    // BACKGROUND VIDEO FADE-IN
    // ────────────────────────────────────────────
    function initBackgroundVideo() {
        const bgVideo = document.getElementById('bgVideo');
        if (!bgVideo) return;

        // Force reload of sources to evaluate updated formats and cache-busted files
        bgVideo.load();

        // Force playback just in case of autoplay restrictions
        bgVideo.play().catch(err => {
            console.warn('[GRID] Autoplay blocked, waiting for user interaction to play video:', err);
            // Fallback: start video on first user interaction
            const playVideo = () => {
                bgVideo.play().then(() => {
                    bgVideo.classList.add('loaded');
                }).catch(e => console.error('[GRID] Failed to play video after interaction:', e));
                
                const events = ['click', 'scroll', 'touchstart', 'pointerdown', 'keydown', 'wheel'];
                events.forEach(evt => document.removeEventListener(evt, playVideo));
            };
            const events = ['click', 'scroll', 'touchstart', 'pointerdown', 'keydown', 'wheel'];
            events.forEach(evt => document.addEventListener(evt, playVideo));
        });

        if (bgVideo.readyState >= 3) {
            bgVideo.classList.add('loaded');
        } else {
            bgVideo.addEventListener('playing', () => {
                bgVideo.classList.add('loaded');
            }, { once: true });
        }
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
