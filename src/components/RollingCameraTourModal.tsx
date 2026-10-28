import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  Compass,
  Info,
  CalendarCheck,
  PhoneCall,
  Bed,
  Bath,
  Car,
  Sparkles,
  MapPin,
  Camera,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Property, TourRoom, TourHotspot } from '../types/property';
import { getTourRoomsForProperty } from '../data/tourData';
import { getAgentById } from '../data/agents';

interface RollingCameraTourModalProps {
  property: Property | null;
  onClose: () => void;
  onOpenAppraisal?: () => void;
  onOpenAgentContact?: (agentId: string) => void;
}

export const RollingCameraTourModal: React.FC<RollingCameraTourModalProps> = ({
  property,
  onClose,
  onOpenAppraisal,
  onOpenAgentContact,
}) => {
  if (!property) return null;

  const rooms: TourRoom[] = useMemo(() => getTourRoomsForProperty(property), [property]);
  const agent = useMemo(() => getAgentById(property.agentId), [property.agentId]);

  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isPlayingAutoTour, setIsPlayingAutoTour] = useState(true);
  const [tourSpeed, setTourSpeed] = useState<number>(1); // 0.5x, 1x, 1.5x
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<TourHotspot | null>(null);
  const [showRoomInfo, setShowRoomInfo] = useState(true);

  // 3D Camera Rolling angles
  const [cameraRollAngle, setCameraRollAngle] = useState(0); // -15 to +15 deg
  const [cameraPanX, setCameraPanX] = useState(0); // -80 to +80 px
  const [cameraPanY, setCameraPanY] = useState(0);
  const [cameraZoom, setCameraZoom] = useState(1.08); // 1.0 to 1.3
  const [isTransitioning, setIsTransitioning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const currentRoom = rooms[currentRoomIndex] || rooms[0];

  // Web Audio API ambient room resonance
  useEffect(() => {
    if (!isMuted) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;

          // Low mellow atmospheric drone
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(110, ctx.currentTime); // Gentle A2 tone
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, ctx.currentTime);

          gain.gain.setValueAtTime(0.025, ctx.currentTime);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          gainNodeRef.current = gain;
        }
      } catch {
        // Audio policy ignore
      }
    } else {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isMuted]);

  // Handle room change with smooth camera roll transition
  const handleSelectRoom = (index: number) => {
    if (index === currentRoomIndex) return;
    setIsTransitioning(true);
    setActiveHotspot(null);

    // Initial rolling dip transition
    setCameraRollAngle(index > currentRoomIndex ? -6 : 6);
    setCameraZoom(1.15);

    setTimeout(() => {
      setCurrentRoomIndex(index);
      // Settle camera back
      setTimeout(() => {
        setCameraRollAngle(0);
        setCameraZoom(1.08);
        setCameraPanX(0);
        setCameraPanY(0);
        setIsTransitioning(false);
      }, 350);
    }, 280);
  };

  const handleNextRoom = () => {
    const nextIdx = (currentRoomIndex + 1) % rooms.length;
    handleSelectRoom(nextIdx);
  };

  const handlePrevRoom = () => {
    const prevIdx = (currentRoomIndex - 1 + rooms.length) % rooms.length;
    handleSelectRoom(prevIdx);
  };

  // Continuous auto-roll camera motion
  useEffect(() => {
    let animId: number;
    let startTime = performance.now();

    const render = (time: number) => {
      if (isPlayingAutoTour && !isTransitioning) {
        const elapsed = (time - startTime) * 0.001 * tourSpeed;
        // Subtle rolling camera pan: oscillates slowly horizontally and tilts subtly
        const roll = Math.sin(elapsed * 0.7) * 3.5;
        const panX = Math.cos(elapsed * 0.5) * 28;
        const panY = Math.sin(elapsed * 0.4) * 12;
        const zoom = 1.06 + Math.sin(elapsed * 0.3) * 0.04;

        setCameraRollAngle(roll);
        setCameraPanX(panX);
        setCameraPanY(panY);
        setCameraZoom(zoom);
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlayingAutoTour, tourSpeed, isTransitioning]);

  // Auto room advance timer when auto-tour is playing
  useEffect(() => {
    if (!isPlayingAutoTour) return;

    const intervalTime = Math.max(4500, 7500 / tourSpeed);
    const timer = setInterval(() => {
      handleNextRoom();
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlayingAutoTour, currentRoomIndex, tourSpeed, rooms.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNextRoom();
      } else if (e.key === 'ArrowLeft') {
        handlePrevRoom();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlayingAutoTour((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRoomIndex, rooms.length]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={containerRef}
        className="relative w-full h-full sm:max-w-7xl sm:h-[94vh] bg-neutral-950 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-neutral-800"
      >
        {/* Top Floating Control Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 px-4 sm:px-6 py-4 bg-gradient-to-b from-neutral-950/90 via-neutral-950/60 to-transparent flex items-center justify-between gap-4">
          {/* Property & Room Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD200] text-neutral-950 flex items-center justify-center shadow-lg font-extrabold text-sm shrink-0">
              <Camera className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFD200]">
                  Virtual Rolling Camera Walkthrough
                </span>
                <span className="text-neutral-500 text-xs">·</span>
                <span className="text-xs text-neutral-300 font-medium">
                  Room {currentRoomIndex + 1} of {rooms.length}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight flex items-center gap-2 truncate max-w-sm sm:max-w-md">
                <span>{currentRoom.name}</span>
                <span className="text-neutral-400 font-normal text-xs sm:text-sm hidden md:inline">
                  — {property.address}, {property.suburb}
                </span>
              </h2>
            </div>
          </div>

          {/* Quick Actions & Dismiss */}
          <div className="flex items-center gap-2">
            {/* Audio Ambience Toggle */}
            <button
              type="button"
              onClick={() => setIsMuted((m) => !m)}
              className={`p-2.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                !isMuted
                  ? 'bg-[#FFD200] text-neutral-950 border-[#FFD200]'
                  : 'bg-neutral-900/80 text-neutral-300 border-neutral-700 hover:text-white'
              }`}
              title={isMuted ? 'Turn on architectural sound ambience' : 'Mute ambience'}
            >
              {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Room Info Toggle */}
            <button
              type="button"
              onClick={() => setShowRoomInfo((s) => !s)}
              className={`p-2.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                showRoomInfo
                  ? 'bg-neutral-800 text-white border-neutral-600'
                  : 'bg-neutral-900/80 text-neutral-400 border-neutral-700 hover:text-white'
              }`}
              title="Toggle Architectural Specs"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700 text-neutral-300 hover:text-white backdrop-blur-md transition-colors cursor-pointer hidden sm:flex"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 backdrop-blur-md transition-colors cursor-pointer"
              aria-label="Close rolling tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN ROLLING CAMERA VIEWPORT */}
        <div
          className="relative flex-1 w-full overflow-hidden flex items-center justify-center bg-neutral-950 select-none"
          style={{ perspective: '1400px' }}
        >
          {/* Animated 3D Rolling Perspective Image Frame */}
          <div
            className={`w-full h-full transition-transform duration-300 ease-out origin-center ${
              isTransitioning ? 'opacity-40 filter blur-xs scale-105' : 'opacity-100 filter-none'
            }`}
            style={{
              transform: `rotateZ(${cameraRollAngle}deg) scale(${cameraZoom}) translate3d(${cameraPanX}px, ${cameraPanY}px, 0)`,
              transformStyle: 'preserve-3d',
            }}
          >
            <img
              src={currentRoom.image}
              alt={currentRoom.name}
              className="w-full h-full object-cover object-center pointer-events-none filter brightness-95 contrast-[1.03]"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Steadicam Rolling Frame Vignette & Lens Grain */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(5,5,8,0.7)_100%)]" />

          {/* Camera Crosshair & Level Indicator (Subtle Cinema HUD) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
            <div className="w-12 h-12 border border-white/40 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#FFD200] rounded-full" />
            </div>
            {/* Horizon rolling level notches */}
            <div
              className="absolute w-48 h-[1px] bg-white/30 transition-transform duration-100"
              style={{ transform: `rotate(${cameraRollAngle}deg)` }}
            />
          </div>

          {/* Interactive Room Hotspots */}
          {currentRoom.hotspots &&
            currentRoom.hotspots.map((spot) => {
              const isSelected = activeHotspot?.id === spot.id;
              return (
                <div
                  key={spot.id}
                  style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHotspot(isSelected ? null : spot);
                    }}
                    className="relative group p-2 focus:outline-none cursor-pointer"
                    title={spot.title}
                  >
                    {/* Pulsing ring */}
                    <span className="absolute inset-0 rounded-full bg-[#FFD200] opacity-40 animate-ping" />
                    {/* Central marker button */}
                    <div className="relative w-7 h-7 rounded-full bg-neutral-900/90 text-[#FFD200] border-2 border-[#FFD200] flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {/* Hotspot detail popup */}
                  {isSelected && (
                    <div className="absolute left-1/2 bottom-10 -translate-x-1/2 w-64 p-3 bg-neutral-900/95 text-white rounded-xl shadow-2xl border border-neutral-700 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 z-30">
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-neutral-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD200]">
                          Architectural Detail
                        </span>
                        <button
                          onClick={() => setActiveHotspot(null)}
                          className="text-neutral-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">{spot.title}</h4>
                      <p className="text-[11px] text-neutral-300 leading-relaxed font-normal">
                        {spot.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

          {/* Left / Right Screen Gliding Arrows */}
          <button
            type="button"
            onClick={handlePrevRoom}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full bg-neutral-900/70 hover:bg-neutral-900 text-white border border-neutral-700/80 backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Previous Room"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleNextRoom}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full bg-neutral-900/70 hover:bg-neutral-900 text-white border border-neutral-700/80 backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Next Room"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Left Side: Room Architectural Specs Drawer (Dismissable) */}
          {showRoomInfo && (
            <div className="absolute bottom-28 left-4 sm:left-6 z-20 max-w-xs sm:max-w-sm bg-neutral-900/85 backdrop-blur-md border border-neutral-800 p-4 rounded-2xl text-white shadow-2xl space-y-2.5 animate-in fade-in slide-in-from-left-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD200] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{currentRoom.subtitle || 'Architectural Specification'}</span>
                </span>
                {currentRoom.dimensions && (
                  <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md font-mono">
                    {currentRoom.dimensions}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-300 font-normal leading-relaxed">
                {currentRoom.architecturalNote}
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-neutral-800 text-[11px] text-neutral-400 flex-wrap">
                <span className="text-white font-semibold">{property.priceDisplay}</span>
                {property.priceReduced && property.originalPriceDisplay && (
                  <span className="text-neutral-500 line-through text-[10px]">
                    {property.originalPriceDisplay}
                  </span>
                )}
                {property.priceReduced && property.savingsAmount && (
                  <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-500/30">
                    Save ${property.savingsAmount.toLocaleString()}
                  </span>
                )}
                <span>·</span>
                <span>{property.bedrooms} Bed</span>
                <span>·</span>
                <span>{property.bathrooms} Bath</span>
              </div>
            </div>
          )}

          {/* Floating On-Screen Camera Controls Bar */}
          <div className="absolute bottom-28 right-4 sm:right-6 z-20 flex flex-col gap-2 items-end">
            {/* Camera Roll Tilt Manual Control */}
            <div className="bg-neutral-900/85 backdrop-blur-md border border-neutral-800 p-2.5 rounded-2xl text-white shadow-xl flex items-center gap-3 text-xs">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Roll Angle:
              </span>
              <input
                type="range"
                min="-15"
                max="15"
                step="1"
                value={cameraRollAngle}
                onChange={(e) => {
                  setIsPlayingAutoTour(false);
                  setCameraRollAngle(parseFloat(e.target.value));
                }}
                className="w-20 sm:w-24 accent-[#FFD200] cursor-pointer"
                title="Manually roll camera angle"
              />
              <span className="text-[10px] font-mono text-[#FFD200] w-7 text-right">
                {Math.round(cameraRollAngle)}°
              </span>
            </div>

            {/* Play/Pause, Speed & Reset */}
            <div className="flex items-center gap-1.5 bg-neutral-900/85 backdrop-blur-md border border-neutral-800 p-1.5 rounded-2xl text-white shadow-xl">
              <button
                type="button"
                onClick={() => setIsPlayingAutoTour((p) => !p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  isPlayingAutoTour
                    ? 'bg-[#FFD200] text-neutral-950 shadow-xs'
                    : 'bg-neutral-800 text-white hover:bg-neutral-700'
                }`}
                title="Play/Pause continuous rolling walkthrough"
              >
                {isPlayingAutoTour ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Auto Roll</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Roll</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setTourSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 0.5 : 1))}
                className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-300 font-bold text-[11px] cursor-pointer"
                title="Tour speed"
              >
                {tourSpeed}x
              </button>

              <button
                type="button"
                onClick={() => {
                  setCameraRollAngle(0);
                  setCameraPanX(0);
                  setCameraPanY(0);
                  setCameraZoom(1.08);
                }}
                className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Reset Camera Center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM ROOM NAVIGATION & TIMELINE BAR */}
        <div className="relative z-30 px-4 sm:px-6 py-3.5 bg-neutral-950 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Room Thumbnails Sequence Strip */}
          <div className="w-full sm:w-auto flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {rooms.map((room, idx) => {
              const isActive = idx === currentRoomIndex;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleSelectRoom(idx)}
                  className={`group relative flex items-center gap-2 p-1.5 rounded-xl border transition-all shrink-0 cursor-pointer text-left ${
                    isActive
                      ? 'bg-neutral-900 border-[#FFD200] shadow-md ring-1 ring-[#FFD200]'
                      : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-10 h-8 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="pr-1.5 hidden md:block">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      0{idx + 1}
                    </div>
                    <div
                      className={`text-xs font-semibold truncate max-w-[100px] ${
                        isActive ? 'text-white' : 'text-neutral-300'
                      }`}
                    >
                      {room.name.split('&')[0]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action CTAs */}
          <div className="w-full sm:w-auto flex items-center justify-end gap-2 shrink-0">
            {agent && onOpenAgentContact && (
              <button
                type="button"
                onClick={() => onOpenAgentContact(agent.id)}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold border border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#FFD200]" />
                <span className="hidden md:inline">Contact Agent:</span>
                <span>{agent.name.split(' ')[0]}</span>
              </button>
            )}

            {onOpenAppraisal && (
              <button
                type="button"
                onClick={onOpenAppraisal}
                className="px-4 py-2 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Book In-Person Inspection</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
