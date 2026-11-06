import React, { useState } from 'react';
import { MapPin, Star, Heart, Navigation, Sparkles, ChevronRight, Compass } from 'lucide-react';
import { AirbnbStay } from '../../types/airbnb';

interface AustraliaMapPricePinsProps {
  stays: AirbnbStay[];
  selectedStayId?: string;
  onSelectStay: (stay: AirbnbStay) => void;
  onFilterRegion: (regionCategory: string) => void;
  activeRegion: string;
}

export const AustraliaMapPricePins: React.FC<AustraliaMapPricePinsProps> = ({
  stays,
  selectedStayId,
  onSelectStay,
  onFilterRegion,
  activeRegion,
}) => {
  const [hoveredStayId, setHoveredStayId] = useState<string | null>(null);

  const hoveredStay = stays.find((s) => s.id === hoveredStayId);

  return (
    <div className="relative w-full bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* Background glow & subtle radar contour */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFD200]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD200]/15 text-[#FFD200] text-xs font-black border border-[#FFD200]/30 mb-1.5">
            <Compass className="w-3.5 h-3.5 text-[#FFD200]" />
            <span>Interactive Australia Price Map</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Explore Stays with Live Location Price Tags</span>
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Click on any regional price tag pin across Australia to view premier villas &amp; holiday escapes.
          </p>
        </div>

        {/* Legend / Stats Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-neutral-900/90 border border-neutral-800 rounded-2xl px-3.5 py-2 text-xs text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Showing <strong>{stays.length}</strong> Popular Australian Escapes</span>
        </div>
      </div>

      {/* The Australia Map Container */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[580px] bg-neutral-950/70 rounded-2xl border border-neutral-800/80 overflow-hidden flex items-center justify-center shadow-inner">
        {/* Stylized Australia SVG Map Silhouette */}
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] opacity-85 select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ausGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e1e24" />
            </linearGradient>
            <linearGradient id="coastGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD200" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Mainland Australia Stylized Path */}
          <path
            d="M 230 115 
               C 270 95, 330 95, 370 125 
               C 420 85, 490 85, 520 145 
               C 560 135, 620 145, 670 170 
               C 720 150, 770 120, 790 140 
               C 800 170, 780 230, 830 270 
               C 870 310, 910 390, 890 470 
               C 880 500, 830 535, 790 540 
               C 740 550, 700 500, 640 525 
               C 580 545, 530 500, 480 515 
               C 410 540, 350 510, 300 480 
               C 240 450, 190 410, 150 430 
               C 110 410, 95 340, 115 280 
               C 100 230, 130 170, 190 140 Z"
            fill="url(#ausGradient)"
            stroke="url(#coastGlow)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Tasmania Island */}
          <path
            d="M 770 580 
               C 800 575, 835 590, 830 620 
               C 820 645, 785 640, 765 625 
               C 755 605, 760 585, 770 580 Z"
            fill="url(#ausGradient)"
            stroke="url(#coastGlow)"
            strokeWidth="3"
          />

          {/* State / Region subtle demarcation text */}
          <text x="180" y="320" fill="#475569" fontSize="16" fontWeight="bold" letterSpacing="3">WESTERN AUSTRALIA</text>
          <text x="470" y="240" fill="#475569" fontSize="15" fontWeight="bold" letterSpacing="3">NORTHERN TERRITORY</text>
          <text x="700" y="260" fill="#475569" fontSize="16" fontWeight="bold" letterSpacing="3">QUEENSLAND</text>
          <text x="470" y="420" fill="#475569" fontSize="15" fontWeight="bold" letterSpacing="3">SOUTH AUSTRALIA</text>
          <text x="730" y="440" fill="#475569" fontSize="16" fontWeight="bold" letterSpacing="3">NEW SOUTH WALES</text>
          <text x="700" y="520" fill="#475569" fontSize="14" fontWeight="bold" letterSpacing="2">VICTORIA</text>
          <text x="840" y="615" fill="#475569" fontSize="12" fontWeight="bold">TAS</text>

          {/* Oceans subtle watermarks */}
          <text x="70" y="190" fill="#334155" fontSize="13" fontStyle="italic">Indian Ocean</text>
          <text x="830" y="190" fill="#334155" fontSize="13" fontStyle="italic">Coral Sea</text>
          <text x="860" y="520" fill="#334155" fontSize="13" fontStyle="italic">Pacific Ocean</text>
          <text x="440" y="585" fill="#334155" fontSize="13" fontStyle="italic">Southern Ocean</text>
        </svg>

        {/* Floating Price Tag Pins Rendered Over Coordinates */}
        {stays.map((stay) => {
          const isHovered = hoveredStayId === stay.id;
          const isSelected = selectedStayId === stay.id;

          return (
            <div
              key={stay.id}
              style={{
                left: `${stay.coordinates.mapXPercent}%`,
                top: `${stay.coordinates.mapYPercent}%`,
              }}
              onMouseEnter={() => setHoveredStayId(stay.id)}
              onMouseLeave={() => setHoveredStayId(null)}
              onClick={() => {
                onSelectStay(stay);
                onFilterRegion(stay.regionCategory);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
            >
              {/* Pulsing halo ring */}
              <span className={`absolute -inset-1.5 rounded-full transition-opacity ${
                isSelected ? 'bg-[#FFD200] opacity-80 animate-ping' : 'bg-blue-400 opacity-40 group-hover:opacity-75 group-hover:animate-ping'
              }`} />

              {/* The Floating Price Tag Badge */}
              <div
                className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black shadow-xl transition-all transform duration-200 ${
                  isSelected
                    ? 'bg-[#FFD200] text-neutral-950 ring-2 ring-white scale-110'
                    : isHovered
                    ? 'bg-blue-600 text-white ring-2 ring-[#FFD200] scale-110 -translate-y-1'
                    : 'bg-neutral-900/95 text-white border border-neutral-700/80 hover:bg-neutral-800'
                }`}
              >
                <span className="text-[10px] opacity-75">🇦🇺</span>
                <span className="font-mono tabular-nums font-black">${stay.pricePerNight}</span>
                <span className="text-[9px] font-normal opacity-70">/nt</span>
              </div>

              {/* Small arrow marker */}
              <div className={`w-2 h-2 mx-auto -mt-0.5 rotate-45 transition-colors ${
                isSelected ? 'bg-[#FFD200]' : isHovered ? 'bg-blue-600' : 'bg-neutral-900 border-r border-b border-neutral-700'
              }`} />

              {/* Location Tag Subtitle Label */}
              <div className="hidden sm:block text-center mt-0.5">
                <span className="text-[10px] font-bold text-neutral-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-black/60 px-1.5 py-0.2 rounded-md whitespace-nowrap">
                  {stay.suburb}
                </span>
              </div>
            </div>
          );
        })}

        {/* Hovered Stay Preview Card Overlay */}
        {hoveredStay && (
          <div
            style={{
              left: `${Math.min(Math.max(hoveredStay.coordinates.mapXPercent, 22), 78)}%`,
              top: `${hoveredStay.coordinates.mapYPercent > 60 ? hoveredStay.coordinates.mapYPercent - 28 : hoveredStay.coordinates.mapYPercent + 12}%`,
            }}
            className="absolute -translate-x-1/2 z-30 w-72 sm:w-80 bg-neutral-900/95 backdrop-blur-md rounded-2xl border border-neutral-700 p-3 shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex gap-3 items-center">
              <img
                src={hoveredStay.images[0]}
                alt={hoveredStay.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0 border border-neutral-700"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-[#FFD200] uppercase tracking-wider truncate">
                    {hoveredStay.destination}
                  </span>
                  <div className="flex items-center gap-0.5 text-[11px] font-bold text-white shrink-0">
                    <Star className="w-3 h-3 fill-[#FFD200] text-[#FFD200]" />
                    <span>{hoveredStay.rating}</span>
                  </div>
                </div>
                <h4 className="text-xs font-black text-white truncate mt-0.5">
                  {hoveredStay.title}
                </h4>
                <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                  {hoveredStay.distanceToAttraction}
                </p>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-sm font-black text-[#FFD200] font-mono">
                    ${hoveredStay.pricePerNight} AUD
                  </span>
                  <span className="text-[10px] text-neutral-400">/ night</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Region Selector Pills Bottom Row */}
      <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 hidden sm:inline">
          Filter by Region:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {stays.map((stay) => (
            <button
              key={stay.id}
              onClick={() => {
                onSelectStay(stay);
                onFilterRegion(stay.regionCategory);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                activeRegion === stay.regionCategory
                  ? 'bg-[#FFD200] text-neutral-950 border-[#FFD200] shadow-md font-black'
                  : 'bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <span>{stay.suburb}</span>
              <span className="font-mono text-[10px] opacity-80">(${stay.pricePerNight}/nt)</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
