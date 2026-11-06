import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  CalendarCheck,
  Volume2,
  VolumeX,
  Camera,
  Play,
  ChevronDown,
  ChevronUp,
  Award,
  ShieldCheck,
  Building2,
  Maximize2,
  Pause,
} from 'lucide-react';

interface CinematicWelcomeOverlayProps {
  atmosphere: 'day' | 'sunset' | 'twilight';
  onAtmosphereChange: (mode: 'day' | 'sunset' | 'twilight') => void;
  displayMode: 'photo' | '3d';
  onToggleDisplayMode: () => void;
  isAudioActive: boolean;
  onToggleAudio: () => void;
  onExploreListings?: () => void;
  onOpenAppraisal?: () => void;
  onToggleFullscreen?: () => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

export const CinematicWelcomeOverlay: React.FC<CinematicWelcomeOverlayProps> = ({
  atmosphere,
  onAtmosphereChange,
  displayMode,
  onToggleDisplayMode,
  isAudioActive,
  onToggleAudio,
  onExploreListings,
  onOpenAppraisal,
  onToggleFullscreen,
  isPlaying = false,
  onTogglePlay,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isTheaterModalOpen, setIsTheaterModalOpen] = useState(false);

  return (
    <>
      {/* Cinematic Anamorphic Top & Bottom Framing Scrim */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
        {/* Top Vignette with subtle golden horizon streak */}
        <div className="h-28 sm:h-36 bg-gradient-to-b from-neutral-950/90 via-neutral-950/50 to-transparent relative">
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#FFD200]/40 to-transparent blur-[0.5px]" />
        </div>

        {/* Bottom Grounding Scrim */}
        <div className="h-44 sm:h-56 bg-gradient-to-t from-neutral-950/95 via-neutral-950/60 to-transparent relative">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFD200]/25 to-transparent" />
        </div>
      </div>

      {/* Main Welcoming Centerpiece */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 lg:p-10 pointer-events-none select-none">
        {/* Top Row: Heritage Crest */}
        <div className="flex items-center justify-start gap-3 pointer-events-auto">
          {/* Heritage Badge */}
          <div className="flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 rounded-full bg-neutral-950/75 backdrop-blur-md border border-white/15 text-white shadow-xl">
            <span className="w-2 h-2 rounded-full bg-[#FFD200] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FFD200]">
              EST. 1902 · PRESTIGE COLLECTION
            </span>
          </div>
        </div>

        {/* Center / Mid Section: Grand Cinematic Welcoming Marquee */}
        <div className="w-full max-w-4xl mx-auto my-auto text-center pointer-events-auto transition-all duration-300">
          {/* Subtle Anamorphic Glow Line */}
          <div className="w-32 sm:w-48 h-0.5 mx-auto bg-gradient-to-r from-transparent via-[#FFD200] to-transparent mb-4 opacity-90 shadow-[0_0_12px_#FFD200]" />

          {/* Grand Cinematic Typography: RAY WHITE REAL ESTATE */}
          <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
            <div className="text-[11px] sm:text-xs md:text-sm font-extrabold uppercase tracking-[0.3em] sm:tracking-[0.45em] text-[#FFD200] drop-shadow-md">
              WELCOME TO
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] leading-none">
              <span className="inline-block bg-gradient-to-b from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
                RAY WHITE
              </span>{' '}
              <span className="inline-block bg-gradient-to-r from-[#FFE04D] via-[#FFD200] to-[#E5BC00] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(204,204,204,0.4)]">
                REAL ESTATE
              </span>
            </h1>

            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-neutral-300/90 pt-1">
              AUSTRALASIA&apos;S PREMIER PROPERTY NETWORK · 120+ YEARS OF EXCELLENCE
            </div>
          </div>

          {/* Collapsible Cinematic Welcoming Prose Card */}
          {isExpanded ? (
            <div className="relative mx-auto max-w-2xl bg-neutral-950/70 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/15 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              {/* Subtle Gold Corner Accents */}
              <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[#FFD200]/70" />
              <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[#FFD200]/70" />
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-[#FFD200]/70" />
              <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-[#FFD200]/70" />

              <p className="text-xs sm:text-sm md:text-base font-normal leading-relaxed text-neutral-200 text-balance drop-shadow-sm">
                &ldquo;For over a century, <strong className="text-white font-extrabold">Ray White Real Estate</strong> has opened the doors to Australasia&apos;s most extraordinary residences, architectural sanctuaries, and visionary estates. Whether you are seeking your forever home, expanding an investment portfolio, or embarking on your next chapter — we warmly welcome you to experience real estate elevated to an art form.&rdquo;
              </p>

              {/* Welcoming Key Stats / Accreditations */}
              <div className="grid grid-cols-3 gap-2 pt-4 mt-3 border-t border-white/10 text-center">
                <div>
                  <div className="text-sm sm:text-lg font-black text-[#FFD200] tabular-nums">120+ Yrs</div>
                  <div className="text-[10px] sm:text-xs font-semibold text-neutral-400">Heritage &amp; Trust</div>
                </div>
                <div>
                  <div className="text-sm sm:text-lg font-black text-emerald-400 tabular-nums">14,000+</div>
                  <div className="text-[10px] sm:text-xs font-semibold text-neutral-400">Prestige Listings</div>
                </div>
                <div>
                  <div className="text-sm sm:text-lg font-black text-blue-400 tabular-nums">1,000+</div>
                  <div className="text-[10px] sm:text-xs font-semibold text-neutral-400">Local Offices</div>
                </div>
              </div>

              {/* Action Buttons in Ray White Tri-Tone Palette (Gold, Emerald, Blue) */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 pt-4">
                {/* Primary: Explore Listings (Ray White Gold) */}
                <button
                  type="button"
                  onClick={onExploreListings}
                  className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-[#FFD200] to-[#E5BC00] hover:brightness-105 active:scale-95 text-neutral-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-[#FFD200]/25 transition-all flex items-center gap-2 cursor-pointer border border-[#FFD200]"
                >
                  <Compass className="w-4 h-4 text-neutral-950" />
                  <span>Explore Properties</span>
                </button>

                {/* Secondary: Book Appraisal (Oceanic Blue) */}
                <button
                  type="button"
                  onClick={onOpenAppraisal}
                  className="px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer border border-blue-500"
                >
                  <CalendarCheck className="w-4 h-4 text-white" />
                  <span>VIP Appraisal</span>
                </button>

                {/* Tertiary: 3D Villa Interactive / Full Screen Experience (Emerald Green) */}
                <button
                  type="button"
                  onClick={onToggleDisplayMode}
                  className="px-3.5 sm:px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-500"
                  title="Toggle 3D interactive camera roam"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <span>{displayMode === '3d' ? 'Photo Flight' : '3D Interactive'}</span>
                </button>

                {/* Minimize Note Button */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors cursor-pointer border border-white/10"
                  title="Minimize welcoming note to view full residence"
                  aria-label="Minimize note"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Minimized Pill to allow unrestricted visual enjoyment */
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-950/80 backdrop-blur-md border border-[#FFD200]/40 text-white shadow-2xl animate-in fade-in">
              <span className="text-xs font-extrabold text-[#FFD200]">
                Ray White Prestige Welcome Note
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="px-2 py-0.5 rounded-md bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 text-xs font-black transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Read Note</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Status Bar: Audio Soundscape & Cinematic Theater Mode */}
        <div className="flex items-center justify-between gap-3 pointer-events-auto">
          {/* Audio Ambience Pill */}
          <button
            type="button"
            onClick={onToggleAudio}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer text-xs font-bold ${
              isAudioActive
                ? 'bg-[#FFD200] text-neutral-950 border-[#FFD200] shadow-lg shadow-[#FFD200]/20'
                : 'bg-neutral-950/70 hover:bg-neutral-950 text-neutral-300 border-white/15'
            }`}
          >
            {isAudioActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>Ambient Audio Playing</span>
                <span className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-2 bg-neutral-950 rounded animate-pulse" />
                  <span className="w-0.5 h-3 bg-neutral-950 rounded animate-pulse" />
                  <span className="w-0.5 h-1.5 bg-neutral-950 rounded animate-pulse" />
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Play Soundscape</span>
              </>
            )}
          </button>

          {/* Full Screen Cinematic Theater Experience Trigger */}
          <div className="flex items-center gap-2">
            {onTogglePlay && (
              <button
                type="button"
                onClick={onTogglePlay}
                aria-pressed={isPlaying}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs border backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
                  isPlaying
                    ? 'bg-[#FFD200] text-neutral-950 border-[#FFD200]'
                    : 'bg-neutral-950/80 hover:bg-neutral-900 text-white border-white/20 hover:border-[#FFD200]'
                }`}
                title={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-[#FFD200]" />
                )}
                <span>{isPlaying ? 'Pause video' : 'Play video'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsTheaterModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-neutral-950/80 hover:bg-neutral-900 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:border-[#FFD200]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFD200]" />
              <span className="hidden sm:inline">Cinematic Prologue</span>
            </button>

            {onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="p-1.5 sm:p-2 rounded-xl bg-neutral-950/80 hover:bg-neutral-900 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all cursor-pointer"
                title="Fullscreen Theater Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FULL THEATER CINEMATIC PROLOGUE MODAL */}
      {isTheaterModalOpen && (
        <div className="fixed inset-0 z-60 bg-neutral-950/95 backdrop-blur-lg flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl bg-gradient-to-b from-neutral-900/90 to-neutral-950/95 border-y-2 border-[#FFD200] p-6 sm:p-12 text-center text-white shadow-2xl rounded-2xl overflow-hidden">
            {/* Film Scope Letterbox Accents */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFD200] to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFD200] to-transparent" />

            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Emblem */}
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFD200] text-neutral-950 flex items-center justify-center font-black text-2xl shadow-xl shadow-[#FFD200]/25 border-2 border-white/20">
                RW
              </div>

              <div>
                <p className="text-xs uppercase font-black tracking-[0.5em] text-[#FFD200]">
                  A TRADITION OF EXCELLENCE SINCE 1902
                </p>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mt-2 leading-tight">
                  RAY WHITE REAL ESTATE
                </h2>
                <div className="w-24 h-0.5 mx-auto bg-[#FFD200] mt-3" />
              </div>

              <div className="text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4 font-normal">
                <p>
                  &ldquo;To every client who crosses our threshold, we extend our most gracious welcome to <strong className="text-white">Ray White Real Estate</strong>.
                </p>
                <p>
                  For more than twelve decades across Australasia, our name has been synonymous with integrity, architectural distinction, and an unwavering commitment to realizing our clients&apos; highest aspirations.
                </p>
                <p className="text-[#FFD200] font-medium italic">
                  From iconic coastal retreats to serene hinterland sanctuaries, welcome to the benchmark of luxury living.&rdquo;
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsTheaterModalOpen(false);
                    onExploreListings?.();
                  }}
                  className="px-6 py-3 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-black text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-[#FFD200]/30"
                >
                  Enter Property Collection
                </button>
                <button
                  type="button"
                  onClick={() => setIsTheaterModalOpen(false)}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer border border-neutral-700"
                >
                  Return to Showcase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
