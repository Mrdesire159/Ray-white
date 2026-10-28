import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  RotateCcw,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Eye,
  Scale,
  Sparkles,
  Bed,
  Bath,
  Car,
  Compass,
  ArrowUp,
  ArrowDown,
  Sliders,
  Maximize2,
  Camera
} from 'lucide-react';
import { Property } from '../types/property';

interface RollingBallDisplayProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onTourInside?: (property: Property) => void;
  onToggleCompare: (propertyId: string) => void;
  comparedIds: string[];
  hideHeader?: boolean;
}

export const RollingBallDisplay: React.FC<RollingBallDisplayProps> = ({
  properties,
  onSelectProperty,
  onTourInside,
  onToggleCompare,
  comparedIds,
  hideHeader = false,
}) => {
  // 3D rotation angles (degrees)
  const [rotX, setRotX] = useState<number>(-8);
  const [rotY, setRotY] = useState<number>(15);
  const [isAutoRolling, setIsAutoRolling] = useState<boolean>(true);
  const [rollSpeed, setRollSpeed] = useState<number>(0.5); // speed multiplier
  const [rollAxis, setRollAxis] = useState<'horizontal' | 'diagonal' | 'vertical'>('horizontal');
  const [selectedBallIndex, setSelectedBallIndex] = useState<number>(0);
  const [sphereFilter, setSphereFilter] = useState<'all' | 'sale' | 'rent'>('all');
  const [isDragging, setIsDragging] = useState(false);

  // Inertia and physics refs
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocity = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const animFrameId = useRef<number | null>(null);

  // Filter properties based on sphere tab
  const displayProperties = useMemo(() => {
    if (sphereFilter === 'all') return properties;
    return properties.filter((p) => p.status === sphereFilter);
  }, [properties, sphereFilter]);

  // Ensure selected index is within bounds
  useEffect(() => {
    if (selectedBallIndex >= displayProperties.length) {
      setSelectedBallIndex(0);
    }
  }, [displayProperties.length, selectedBallIndex]);

  // Auto-rolling and inertia loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(32, currentTime - lastTime);
      lastTime = currentTime;

      if (!isDragging) {
        if (isAutoRolling) {
          // Continuous roll based on selected axis
          if (rollAxis === 'horizontal') {
            setRotY((y) => (y + rollSpeed * (dt / 16)) % 360);
          } else if (rollAxis === 'vertical') {
            setRotX((x) => Math.max(-55, Math.min(55, x + rollSpeed * 0.6 * (dt / 16))));
          } else {
            setRotY((y) => (y + rollSpeed * 0.8 * (dt / 16)) % 360);
            setRotX((x) => Math.sin(currentTime * 0.001) * 20);
          }
        } else if (Math.abs(velocity.current.vx) > 0.05 || Math.abs(velocity.current.vy) > 0.05) {
          // Coasting physics with friction
          setRotY((y) => y + velocity.current.vx);
          setRotX((x) => Math.max(-60, Math.min(60, x - velocity.current.vy)));
          velocity.current.vx *= 0.92; // friction
          velocity.current.vy *= 0.92;
        }
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isAutoRolling, isDragging, rollSpeed, rollAxis]);

  // Drag handlers for rolling the ball
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    velocity.current = { vx: 0, vy: 0 };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    velocity.current = { vx: deltaX * 0.4, vy: deltaY * 0.3 };
    setRotY((prev) => prev + deltaX * 0.4);
    setRotX((prev) => Math.max(-60, Math.min(60, prev - deltaY * 0.3)));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      velocity.current = { vx: 0, vy: 0 };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastMousePos.current.x;
    const deltaY = e.touches[0].clientY - lastMousePos.current.y;

    velocity.current = { vx: deltaX * 0.5, vy: deltaY * 0.4 };
    setRotY((prev) => prev + deltaX * 0.5);
    setRotX((prev) => Math.max(-60, Math.min(60, prev - deltaY * 0.4)));

    lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Calculate 3D sphere coordinate positions on a spherical surface
  // Using Fibonacci sphere distribution
  const sphereNodes = useMemo(() => {
    const N = displayProperties.length;
    const radius = 330; // 3D sphere radius in pixels

    return displayProperties.map((prop, i) => {
      // Golden spiral distribution on sphere
      const phi = Math.acos(-1 + (2 * (i + 0.5)) / N); // latitude
      const theta = Math.sqrt(N * Math.PI) * phi; // longitude

      // Calculate cartesian coordinates relative to sphere center
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * 0.8 * Math.cos(phi); // slightly flattened sphere for comfortable viewing
      const z = radius * Math.sin(theta) * Math.sin(phi);

      return {
        prop,
        x,
        y,
        z,
        index: i,
        theta,
        phi,
      };
    });
  }, [displayProperties]);

  // Roll the ball to focus directly on a chosen house
  const focusOnNode = (node: typeof sphereNodes[0]) => {
    setSelectedBallIndex(node.index);
    setIsAutoRolling(false);
    // Calculate required rotation so this node faces camera (+Z axis)
    const targetRotY = (-(node.theta * 180) / Math.PI) + 90;
    const targetRotX = ((node.phi - Math.PI / 2) * 180) / Math.PI;
    setRotY(targetRotY);
    setRotX(Math.max(-45, Math.min(45, targetRotX * 0.5)));
  };

  const activeProp = displayProperties[selectedBallIndex] || displayProperties[0] || properties[0];
  const isCompared = comparedIds.includes(activeProp.id);
  const activeSell = activeProp.sellingPrice || (activeProp.status === 'sale' ? activeProp.price : 2800000);
  const activeRent = activeProp.rentagePricePerWeek || (activeProp.status === 'rent' ? activeProp.price : 1250);

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${hideHeader ? 'py-4' : 'py-8 sm:py-12'} space-y-6 select-none`}>
      {/* Standalone Header (only when not embedded in home hero) */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-[#FFD200] text-neutral-950 flex items-center justify-center font-bold shadow-md">
              <Compass className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
                <span>3D Spherical Orbital Residences</span>
                <span className="text-xs bg-neutral-900 text-[#FFD200] font-bold px-2.5 py-0.5 rounded-full">
                  Ray White Prestige
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200">
                  ✦ 3D Spherical Orbit
                </span>
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  ✦ Inside Camera Walkthrough
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  ✦ Dual Price Matrix
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sphere Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
        {/* Filter Buttons */}
        <div className="bg-black/40 backdrop-blur-md p-1 rounded-xl flex items-center gap-1 border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => setSphereFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              sphereFilter === 'all'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            All ({properties.length})
          </button>
          <button
            type="button"
            onClick={() => setSphereFilter('sale')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              sphereFilter === 'sale'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            For Sale
          </button>
          <button
            type="button"
            onClick={() => setSphereFilter('rent')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              sphereFilter === 'rent'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xs'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            For Rent
          </button>
        </div>

        {/* Play / Pause / Reset Actions */}
        <div className="flex items-center gap-2">
          {/* Auto-roll toggle */}
          <button
            type="button"
            onClick={() => setIsAutoRolling(!isAutoRolling)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isAutoRolling
                ? 'bg-gradient-to-r from-amber-400 to-[#FFD200] text-neutral-950 border-amber-300 shadow-md'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            {isAutoRolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoRolling ? 'Rolling On' : 'Start Roll'}</span>
          </button>

          {/* Reset Orientation */}
          <button
            type="button"
            onClick={() => {
              setRotX(-8);
              setRotY(15);
            }}
            className="p-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Reset Sphere Orientation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Sphere Canvas Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: 3D Sphere Interactive Stage (8 cols) */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="lg:col-span-8 relative h-[580px] sm:h-[640px] bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing border-2 border-neutral-800"
          style={{ perspective: '1200px' }}
        >
          {/* Ambient Deep Space Radial Gradient with Colorful Celestial Aurora */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#111c38_0%,#060a14_100%)] pointer-events-none" />
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Atmospheric Glowing Ball Horizon Rings */}
          <div className="absolute w-[520px] h-[520px] rounded-full border border-cyan-500/20 pointer-events-none shadow-[0_0_60px_rgba(6,182,212,0.12)]" />
          <div className="absolute w-[440px] h-[440px] rounded-full border border-amber-400/25 pointer-events-none shadow-[0_0_80px_rgba(251,191,36,0.15)]" />
          <div className="absolute w-[360px] h-[360px] rounded-full border border-dashed border-purple-400/30 pointer-events-none animate-[spin_60s_linear_infinite]" />
          <div className="absolute w-[220px] h-[220px] rounded-full border border-emerald-400/25 pointer-events-none" />

          {/* Central Sphere Core Halo */}
          <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-amber-500/10 blur-2xl pointer-events-none" />

          {/* Central 3D Rotating Sphere Pivot */}
          <div
            className="relative w-0 h-0 transition-transform duration-75"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            }}
          >
            {/* Equator Guide Ring on the Ball */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 w-[660px] h-[660px] rounded-full border-2 border-amber-400/35 pointer-events-none shadow-[0_0_30px_rgba(251,191,36,0.25)]"
              style={{
                transform: 'rotateX(90deg)',
                transformStyle: 'preserve-3d',
              }}
            />

            {/* Latitude Ring */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-cyan-400/30 pointer-events-none"
              style={{
                transform: 'translateY(-140px) rotateX(90deg)',
                transformStyle: 'preserve-3d',
              }}
            />
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-purple-400/30 pointer-events-none"
              style={{
                transform: 'translateY(140px) rotateX(90deg)',
                transformStyle: 'preserve-3d',
              }}
            />

            {/* Render Nodes distributed on Sphere */}
            {sphereNodes.map((node) => {
              const { prop, x, y, z, index } = node;
              const isSelected = index === selectedBallIndex;
              const isSale = prop.status === 'sale';

              return (
                <div
                  key={prop.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    focusOnNode(node);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer group"
                  style={{
                    transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${-rotY}deg) rotateX(${-rotX}deg)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div
                    className={`w-36 sm:w-40 p-2.5 rounded-2xl backdrop-blur-md transition-all duration-300 border ${
                      isSelected
                        ? 'bg-slate-900/95 text-white border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.6)] scale-110 z-30 ring-2 ring-amber-400'
                        : isSale
                        ? 'bg-slate-900/85 hover:bg-slate-900 text-neutral-200 border-emerald-500/40 hover:border-emerald-400 opacity-90 hover:opacity-100 hover:scale-105'
                        : 'bg-slate-900/85 hover:bg-slate-900 text-neutral-200 border-blue-500/40 hover:border-blue-400 opacity-90 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-1.5 bg-neutral-800 shadow-inner">
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <span
                        className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase shadow-xs ${
                          isSale
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        }`}
                      >
                        {isSale ? 'Sale' : 'Rent'}
                      </span>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-950/90 text-white backdrop-blur-xs">
                        {prop.suburb}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-white truncate">
                      {prop.address}
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="text-amber-400 font-black tabular-nums">
                        {prop.priceDisplay}
                      </span>
                      <span className="text-neutral-400 font-semibold">
                        {prop.bedrooms}b/{prop.bathrooms}ba
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Touch & Drag Indicator Overlay */}
          <div className="absolute bottom-4 left-4 bg-neutral-900/85 backdrop-blur-md text-neutral-300 px-3 py-1.5 rounded-xl text-xs font-medium border border-neutral-800 pointer-events-none flex items-center gap-2 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD200] animate-ping" />
            <span>Flick or drag to roll sphere in 3D</span>
          </div>


          {/* Quick Manual Spin Controls on Canvas */}
          <div className="absolute right-4 bottom-4 flex items-center gap-1 bg-neutral-900/85 backdrop-blur-md border border-neutral-800 rounded-xl p-1 text-white shadow-lg">
            <button
              type="button"
              onClick={() => {
                setIsAutoRolling(false);
                setRotY((y) => y - 35);
              }}
              className="p-1.5 hover:bg-neutral-800 rounded-lg cursor-pointer text-neutral-300 hover:text-white"
              title="Roll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAutoRolling(false);
                setRotX((x) => Math.min(50, x + 15));
              }}
              className="p-1.5 hover:bg-neutral-800 rounded-lg cursor-pointer text-neutral-300 hover:text-white"
              title="Roll Down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAutoRolling(false);
                setRotX((x) => Math.max(-50, x - 15));
              }}
              className="p-1.5 hover:bg-neutral-800 rounded-lg cursor-pointer text-neutral-300 hover:text-white"
              title="Roll Up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAutoRolling(false);
                setRotY((y) => y + 35);
              }}
              className="p-1.5 hover:bg-neutral-800 rounded-lg cursor-pointer text-neutral-300 hover:text-white"
              title="Roll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Selected Property Spotlight Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Orbital Focus ({selectedBallIndex + 1} of {displayProperties.length})
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFD200] text-neutral-950">
                {activeProp.type}
              </span>
            </div>

            {/* Photo & Address */}
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-neutral-100 shadow-sm group">
              <img
                src={activeProp.images[0]}
                alt={activeProp.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <span
                className={`absolute top-2 left-2 px-2.5 py-0.5 rounded text-[10px] font-bold text-white shadow-xs ${
                  activeProp.status === 'sale' ? 'bg-emerald-600' : 'bg-blue-600'
                }`}
              >
                {activeProp.status === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-lg text-neutral-900 leading-snug">
                {activeProp.address}
              </h3>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                {activeProp.suburb}, {activeProp.state} {activeProp.postcode}
              </p>
            </div>

            {/* Dual Price List Summary Box */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-neutral-600 font-semibold">Selling Price:</span>
                <div className="text-right">
                  <span className="text-base font-extrabold text-neutral-900 tabular-nums">
                    ${activeSell.toLocaleString()}
                  </span>
                  {activeProp.status === 'sale' && activeProp.priceReduced && activeProp.originalPrice && (
                    <div className="flex items-center justify-end gap-1 text-[10px]">
                      <span className="text-neutral-400 line-through tabular-nums">
                        ${activeProp.originalPrice.toLocaleString()}
                      </span>
                      {activeProp.savingsAmount && (
                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded">
                          Save ${activeProp.savingsAmount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-1 border-t border-neutral-200">
                <span className="text-xs text-neutral-600 font-semibold">Rentage Rate:</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-neutral-900 tabular-nums">
                    ${activeRent.toLocaleString()} <span className="text-[10px] font-normal text-neutral-500">/ wk</span>
                  </span>
                  {activeProp.status === 'rent' && activeProp.priceReduced && activeProp.originalPrice && (
                    <div className="flex items-center justify-end gap-1 text-[10px]">
                      <span className="text-neutral-400 line-through tabular-nums">
                        ${activeProp.originalPrice.toLocaleString()}/wk
                      </span>
                      {activeProp.savingsAmount && (
                        <span className="text-[9px] font-extrabold text-blue-700 bg-blue-100 px-1 py-0.2 rounded">
                          Save ${activeProp.savingsAmount.toLocaleString()}/wk
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5">
                <span>Gross Yield:</span>
                <span className="font-bold text-emerald-700">{activeProp.grossYield || '2.4%'}</span>
              </div>
            </div>

            {/* Key Specs */}
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 pt-1">
              <div
                className="flex items-center gap-1.5 cursor-help hover:text-indigo-600 transition-colors"
                title={`${activeProp.bedrooms} Bedrooms: Private sleeping quarters and wardrobe suites in this ${activeProp.type}`}
              >
                <Bed className="w-4 h-4 text-indigo-500" />
                <span className="tabular-nums">{activeProp.bedrooms} Beds</span>
              </div>
              <div
                className="flex items-center gap-1.5 cursor-help hover:text-cyan-600 transition-colors"
                title={`${activeProp.bathrooms} Bathrooms: Full washroom amenities${activeProp.bathrooms > 1 ? ' including master ensuite' : ''}`}
              >
                <Bath className="w-4 h-4 text-cyan-500" />
                <span className="tabular-nums">{activeProp.bathrooms} Baths</span>
              </div>
              <div
                className="flex items-center gap-1.5 cursor-help hover:text-amber-600 transition-colors"
                title={`${activeProp.carSpaces} Car Spaces: Secure parking accommodation and garage storage`}
              >
                <Car className="w-4 h-4 text-amber-500" />
                <span className="tabular-nums">{activeProp.carSpaces} Cars</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              {onTourInside && (
                <button
                  type="button"
                  onClick={() => onTourInside(activeProp)}
                  className="w-full py-2.5 px-3 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-neutral-950" />
                  <span>Tour Inside (Rolling Camera)</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onToggleCompare(activeProp.id)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isCompared
                      ? 'bg-neutral-950 text-[#FFD200] border-neutral-950'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isCompared ? 'Compared' : 'Compare'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectProperty(activeProp)}
                  className="py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Sphere Node Carousel / Switcher */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-3 shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1 mb-2">
              Select House to Orbit
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {sphereNodes.map((node) => (
                <button
                  key={node.prop.id}
                  type="button"
                  onClick={() => focusOnNode(node)}
                  className={`w-14 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer relative ${
                    node.index === selectedBallIndex
                      ? 'border-[#FFD200] ring-2 ring-[#FFD200]'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  title={`${node.prop.address}, ${node.prop.suburb}`}
                >
                  <img
                    src={node.prop.images[0]}
                    alt={node.prop.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
