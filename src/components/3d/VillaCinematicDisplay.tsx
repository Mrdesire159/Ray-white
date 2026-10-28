import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { buildVillaModel, VillaModelObjects } from './VillaModel';
import { VillaCameraDirector } from './VillaDirector';
import { villaAudio } from './VillaAudio';

type AtmosphereMode = 'day' | 'sunset' | 'twilight';
type DisplayMode = 'photo' | '3d';

interface VillaCinematicDisplayProps {
  onOpenAppraisal?: () => void;
  onOpenChat?: () => void;
  onExploreListings?: () => void;
}

export const VillaCinematicDisplay: React.FC<VillaCinematicDisplayProps> = ({
  onOpenAppraisal,
  onOpenChat,
  onExploreListings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [displayMode, setDisplayMode] = useState<DisplayMode>('photo');
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(0.5); // Default to smooth slow-mo
  const [timelineProgress, setTimelineProgress] = useState(0);
  const [atmosphere, setAtmosphere] = useState<AtmosphereMode>('day');
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFreeOrbit, setIsFreeOrbit] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Active refs to avoid re-triggering Three.js initialization effect
  const displayModeRef = useRef<DisplayMode>('photo');
  displayModeRef.current = displayMode;

  const isPlayingRef = useRef(true);
  isPlayingRef.current = isPlaying;

  const speedMultiplierRef = useRef(0.5);
  speedMultiplierRef.current = speedMultiplier;

  const timelineProgressRef = useRef(0);
  const isDraggingScrubberRef = useRef(false);

  // Photo transform element ref for zero-overhead direct GPU transform updates
  const photoTransformRef = useRef<HTMLDivElement>(null);

  // Internal refs for Three.js
  const directorRef = useRef<VillaCameraDirector | null>(null);
  const modelObjectsRef = useRef<VillaModelObjects | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Orbit drag state for free roam
  const isDraggingOrbitRef = useRef(false);
  const orbitPreviousMouseRef = useRef({ x: 0, y: 0 });
  const orbitSphericalRef = useRef({ radius: 24, theta: 0.3, phi: 1.1 });
  const orbitTargetRef = useRef(new THREE.Vector3(-1.5, 2.5, 0));

  // Compute smooth hardware-accelerated cinematic drone flight transform
  const computeTransform = useCallback((t: number) => {
    const angle = t * Math.PI * 2;
    const sinA = Math.sin(angle);
    const cosA = Math.cos(angle);
    const sin2A = Math.sin(angle * 2);

    // Zoom from 1.07 to 1.23 to reveal intricate pool and interior details
    const scale = 1.08 + 0.14 * (0.5 - 0.5 * cosA);
    // Smooth horizontal tracking pan
    const translateX = -sinA * 3.8;
    // Slow vertical sweep showing pool water up to interior and upper terrace
    const translateY = cosA * 2.4 + sin2A * 0.7;

    return `translate3d(${translateX.toFixed(3)}%, ${translateY.toFixed(3)}%, 0px) scale(${scale.toFixed(3)})`;
  }, []);

  // 1. Initialize Three.js 3D Scene ONCE on mount
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    try {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 650;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    cameraRef.current = camera;

    const director = new VillaCameraDirector(camera);
    directorRef.current = director;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    const hemiLight = new THREE.HemisphereLight(0xd9ecff, 0x5a6552, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfff8ee, 2.2);
    sunLight.position.set(22, 28, 16);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    scene.background = new THREE.Color(0xbfe3f7);
    scene.fog = new THREE.FogExp2(0xbfe3f7, 0.008);

    const villaModel = buildVillaModel();
    modelObjectsRef.current = villaModel;
    scene.add(villaModel.group);

    // Continuous High-Performance Animation Loop
    let lastTime = performance.now();
    let lastUiUpdate = 0;

    const animate = (currentTime: number) => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const isCurrentPlaying = isPlayingRef.current && !isDraggingScrubberRef.current;
      const currentMode = displayModeRef.current;
      const speed = speedMultiplierRef.current;

      if (isCurrentPlaying) {
        // Increment continuous progress: ~45 seconds loop at 1x, ~90s at 0.5x
        const increment = (delta / 45) * speed;
        let next = timelineProgressRef.current + increment;
        if (next >= 1) next -= 1;
        timelineProgressRef.current = next;

        // In photo mode: update DOM transform directly on GPU thread (0ms lag, no React overhead)
        if (currentMode === 'photo' && photoTransformRef.current) {
          photoTransformRef.current.style.transform = computeTransform(next);
        }

        // Throttle UI scrubber state update to ~10 times per second for silky responsive UI
        if (currentTime - lastUiUpdate > 90) {
          setTimelineProgress(next);
          lastUiUpdate = currentTime;
        }

        // In 3D mode: update camera director
        if (currentMode === '3d' && director) {
          director.update(delta * speed);
        }
      }

      // 3D Rendering ONLY when active (saves 100% GPU/CPU overhead in photo mode)
      if (currentMode === '3d') {
        villaModel.update(currentTime / 1000);

        if (director.isFreeOrbit) {
          const { radius, theta, phi } = orbitSphericalRef.current;
          const target = orbitTargetRef.current;
          camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
          camera.position.y = target.y + radius * Math.cos(phi);
          camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
          camera.lookAt(target);
        }

        renderer.render(scene, camera);
      }
    };

    reqIdRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !canvas || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
      villaAudio.stop();
    };
  }, [computeTransform]);

  // Lighting Atmosphere controller
  const applyAtmosphere = useCallback((mode: AtmosphereMode) => {
    setAtmosphere(mode);
    const scene = sceneRef.current;
    const sunLight = sunLightRef.current;
    const hemiLight = hemiLightRef.current;
    const model = modelObjectsRef.current;
    if (!scene || !sunLight || !hemiLight || !model) return;

    if (mode === 'day') {
      scene.background = new THREE.Color(0xbfe3f7);
      if (scene.fog) scene.fog.color.set(0xbfe3f7);
      sunLight.color.setHex(0xfff8ee);
      sunLight.intensity = 2.2;
      sunLight.position.set(22, 28, 16);
      hemiLight.color.setHex(0xd9ecff);
      hemiLight.groundColor.setHex(0x5a6552);
      hemiLight.intensity = 0.75;
      model.poolLights.forEach((l) => (l.intensity = 0.8));
      model.soffitLights.forEach((l) => (l.intensity = 0.9));
      model.interiorLights.forEach((l) => (l.intensity = 1.4));
    } else if (mode === 'sunset') {
      scene.background = new THREE.Color(0xfb923c);
      if (scene.fog) scene.fog.color.set(0xfb923c);
      sunLight.color.setHex(0xff7722);
      sunLight.intensity = 2.4;
      sunLight.position.set(28, 12, -18);
      hemiLight.color.setHex(0xfde047);
      hemiLight.groundColor.setHex(0x374151);
      hemiLight.intensity = 0.65;
      model.poolLights.forEach((l) => (l.intensity = 2.0));
      model.soffitLights.forEach((l) => (l.intensity = 2.2));
      model.interiorLights.forEach((l) => (l.intensity = 2.5));
    } else if (mode === 'twilight') {
      scene.background = new THREE.Color(0x0a1122);
      if (scene.fog) scene.fog.color.set(0x0a1122);
      sunLight.color.setHex(0x38bdf8);
      sunLight.intensity = 0.35;
      sunLight.position.set(-18, 20, -18);
      hemiLight.color.setHex(0x1e293b);
      hemiLight.groundColor.setHex(0x020617);
      hemiLight.intensity = 0.4;
      model.poolLights.forEach((l) => (l.intensity = 3.5));
      model.soffitLights.forEach((l) => (l.intensity = 2.8));
      model.interiorLights.forEach((l) => (l.intensity = 3.0));
    }
  }, []);

  // Controls
  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const changeSpeed = (s: number) => {
    setSpeedMultiplier(s);
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    timelineProgressRef.current = val;
    setTimelineProgress(val);
    if (photoTransformRef.current && displayModeRef.current === 'photo') {
      photoTransformRef.current.style.transform = computeTransform(val);
    }
    if (directorRef.current && displayModeRef.current === '3d') {
      directorRef.current.setProgress(val);
    }
  };

  const toggleAudio = () => {
    if (isAudioActive) {
      villaAudio.stop();
      setIsAudioActive(false);
    } else {
      villaAudio.play();
      setIsAudioActive(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const toggleFreeOrbit = () => {
    if (displayMode !== '3d') {
      setDisplayMode('3d');
    }
    if (directorRef.current) {
      directorRef.current.isFreeOrbit = !isFreeOrbit;
      setIsFreeOrbit(!isFreeOrbit);
    }
  };

  // Free orbit drag events for 3D mode
  const handlePointerDown = (e: React.PointerEvent) => {
    if (displayMode === '3d' && isFreeOrbit) {
      isDraggingOrbitRef.current = true;
      orbitPreviousMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (displayMode === '3d' && isFreeOrbit && isDraggingOrbitRef.current) {
      const deltaX = e.clientX - orbitPreviousMouseRef.current.x;
      const deltaY = e.clientY - orbitPreviousMouseRef.current.y;
      orbitPreviousMouseRef.current = { x: e.clientX, y: e.clientY };

      orbitSphericalRef.current.theta -= deltaX * 0.006;
      orbitSphericalRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, orbitSphericalRef.current.phi + deltaY * 0.006)
      );
    }
  };

  const handlePointerUp = () => {
    isDraggingOrbitRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (displayMode === '3d' && isFreeOrbit) {
      orbitSphericalRef.current.radius = Math.max(
        10,
        Math.min(45, orbitSphericalRef.current.radius + e.deltaY * 0.02)
      );
    }
  };

  // Atmosphere filter styling applied directly to the real photograph
  const getAtmospherePhotoStyle = () => {
    if (atmosphere === 'sunset') {
      return {
        filter: 'sepia(0.24) saturate(1.35) hue-rotate(-10deg) brightness(0.96) contrast(1.08)',
      };
    }
    if (atmosphere === 'twilight') {
      return {
        filter: 'brightness(0.66) contrast(1.22) saturate(1.22) hue-rotate(185deg)',
      };
    }
    // daylight
    return {
      filter: 'brightness(1.02) contrast(1.03) saturate(1.04)',
    };
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-neutral-950 select-none transition-all duration-300 ${
        isFullscreen ? 'h-screen' : 'h-[620px] sm:h-[720px] lg:h-[780px]'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* 1. REAL PICTURE DISPLAY (DEFAULT): With smooth cinematic slow-motion camera glide */}
      {displayMode === 'photo' && (
        <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-neutral-950">
          <div
            ref={photoTransformRef}
            className="w-full h-full relative overflow-hidden will-change-transform"
            style={{
              transform: computeTransform(timelineProgress),
            }}
          >
            <img
              src="/assets/aistudio/OIP__44__14d0dc70.webp"
              alt="The Horizon Pavilion Luxury Villa"
              className="w-full h-full object-cover object-center transition-all duration-700 select-none"
              style={getAtmospherePhotoStyle()}
              draggable={false}
            />

            {/* Twilight pool illumination overlay when in twilight mode */}
            {atmosphere === 'twilight' && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70 transition-opacity duration-700 bg-[radial-gradient(circle_at_60%_80%,rgba(56,189,248,0.5)_0%,transparent_50%)]"
              />
            )}

            {/* Sunset golden-hour sun flare overlay */}
            {atmosphere === 'sunset' && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-screen opacity-50 transition-opacity duration-700 bg-[radial-gradient(circle_at_80%_20%,rgba(251,146,60,0.45)_0%,transparent_60%)]"
              />
            )}
          </div>
        </div>
      )}

      {/* 2. 3D INTERACTIVE WEBGL CANVAS: Available via 1-click toggle */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block absolute inset-0 ${
          displayMode === '3d' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none -z-10'
        } ${isFreeOrbit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      />

      {/* Top Controls Overlay: Minimal Audio & Fullscreen */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 pointer-events-auto z-20">
        {/* Audio Soundscape Toggle */}
        <button
          type="button"
          onClick={toggleAudio}
          className={`p-2 rounded-xl border backdrop-blur-md shadow-lg transition-all cursor-pointer ${
            isAudioActive
              ? 'bg-[#FFD200] text-neutral-950 border-amber-300'
              : 'bg-neutral-900/70 hover:bg-neutral-900 text-white/80 border-white/10'
          }`}
          title={isAudioActive ? 'Mute Audio' : 'Unmute Ambient Soundscape'}
        >
          {isAudioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-neutral-900/70 hover:bg-neutral-900 text-white/80 border border-white/10 backdrop-blur-md shadow-lg transition-all cursor-pointer"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
