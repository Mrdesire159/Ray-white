import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Scale,
  Bed,
  Bath,
  Car,
  Eye,
  List,
  Library,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Property } from '../types/property';
import { getAgentById } from '../data/agents';

interface BookDisplayViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onToggleCompare: (propertyId: string) => void;
  comparedIds: string[];
}

// Colors for book spines on the bookshelf
const SPINE_THEMES = [
  { bg: 'from-amber-950 to-neutral-900', border: 'border-amber-800', accent: '#FFD200', text: 'text-amber-100', ribbon: '#FFD200' },
  { bg: 'from-slate-900 to-neutral-950', border: 'border-slate-700', accent: '#38BDF8', text: 'text-slate-100', ribbon: '#38BDF8' },
  { bg: 'from-emerald-950 to-neutral-900', border: 'border-emerald-800', accent: '#34D399', text: 'text-emerald-100', ribbon: '#34D399' },
  { bg: 'from-rose-950 to-neutral-950', border: 'border-rose-900', accent: '#FB7185', text: 'text-rose-100', ribbon: '#FB7185' },
  { bg: 'from-zinc-900 to-stone-950', border: 'border-zinc-700', accent: '#FFD200', text: 'text-zinc-100', ribbon: '#FFD200' },
  { bg: 'from-indigo-950 to-neutral-900', border: 'border-indigo-800', accent: '#A5B4FC', text: 'text-indigo-100', ribbon: '#A5B4FC' },
];

export const BookDisplayView: React.FC<BookDisplayViewProps> = ({
  properties,
  onSelectProperty,
  onToggleCompare,
  comparedIds,
}) => {
  const [viewMode, setViewMode] = useState<'shelf' | 'reader'>('shelf');
  const [currentPage, setCurrentPage] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showContents, setShowContents] = useState(false);
  const [hoveredBookIndex, setHoveredBookIndex] = useState<number | null>(null);

  // Reset active photo index when flipping page
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [currentPage]);

  // Keyboard navigation for realistic book experience
  useEffect(() => {
    if (viewMode !== 'reader') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage((prev) => Math.min(properties.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setViewMode('shelf');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [properties.length, viewMode]);

  if (properties.length === 0) return null;

  const currentProperty = properties[currentPage];
  const agent = getAgentById(currentProperty.agentId);
  const isCompared = comparedIds.includes(currentProperty.id);

  const sellingVal = currentProperty.sellingPrice || (currentProperty.status === 'sale' ? currentProperty.price : 2850000);
  const rentWeeklyVal = currentProperty.rentagePricePerWeek || (currentProperty.status === 'rent' ? currentProperty.price : 1350);
  const rentMonthlyVal = currentProperty.rentagePricePerMonth || Math.round((rentWeeklyVal * 52) / 12);
  const yieldVal = currentProperty.grossYield || (((rentWeeklyVal * 52) / sellingVal) * 100).toFixed(1) + '%';

  const images = currentProperty.images && currentProperty.images.length > 0
    ? currentProperty.images
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-neutral-900 text-[#FFD200] flex items-center justify-center font-bold shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
              <span>Ray White Architectural Bookshelf</span>
              <span className="text-xs bg-[#FFD200] text-neutral-950 font-bold px-2 py-0.5 rounded-full">
                {properties.length} Volumes
              </span>
            </h1>
            <p className="text-xs text-neutral-500">
              Houses formatted as collectible luxury monographs · Browse the shelf or open two-page spreads
            </p>
          </div>
        </div>

        {/* View Switcher & Toolbar */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Switcher: Bookshelf vs Open Monograph */}
          <div className="bg-neutral-100 p-1 rounded-xl flex items-center gap-1 border border-neutral-200">
            <button
              type="button"
              onClick={() => setViewMode('shelf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'shelf'
                  ? 'bg-neutral-900 text-[#FFD200] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>Bookshelf View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('reader')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'reader'
                  ? 'bg-neutral-900 text-[#FFD200] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Open Monograph</span>
            </button>
          </div>

          {viewMode === 'reader' && (
            <>
              <button
                type="button"
                onClick={() => setShowContents(!showContents)}
                className="px-3 py-1.5 bg-white border border-neutral-300 hover:border-neutral-400 rounded-lg text-xs font-bold text-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <List className="w-3.5 h-3.5 text-[#E5BC00]" />
                <span className="hidden sm:inline">Index</span>
              </button>

              <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-lg p-1 shadow-2xs">
                <button
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="p-1 rounded text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  title="Previous Volume (Left Arrow)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-neutral-800 px-2 select-none tabular-nums">
                  {currentPage + 1} / {properties.length}
                </span>
                <button
                  type="button"
                  disabled={currentPage === properties.length - 1}
                  onClick={() => setCurrentPage((p) => Math.min(properties.length - 1, p + 1))}
                  className="p-1 rounded text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  title="Next Volume (Right Arrow)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table of Contents Drawer */}
      {showContents && viewMode === 'reader' && (
        <div className="bg-white p-5 rounded-xl border border-neutral-300 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-3">
            <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider">
              Index of Featured Residences
            </h3>
            <button
              onClick={() => setShowContents(false)}
              className="text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer"
            >
              Close Index ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {properties.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setCurrentPage(idx);
                  setShowContents(false);
                }}
                className={`p-2.5 rounded-lg text-left transition-colors flex items-center justify-between cursor-pointer ${
                  idx === currentPage
                    ? 'bg-[#FFD200]/20 font-bold text-neutral-950 border border-[#FFD200]'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                <div className="truncate mr-2">
                  <span className="text-neutral-400 font-mono mr-1.5">Vol. {idx + 1}</span>
                  <span>{p.address}, {p.suburb}</span>
                </div>
                <span className="text-[11px] font-bold text-neutral-900 tabular-nums shrink-0">
                  {p.priceDisplay}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODE 1: THE ARCHITECTURAL BOOKSHELF (Houses displayed like upright books) */}
      {viewMode === 'shelf' && (
        <div className="space-y-10">
          {/* Bookshelf Introduction Banner */}
          <div className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-neutral-800">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_right,#ffd20015_0%,transparent_70%)] pointer-events-none" />
            <div className="space-y-2 z-10">
              <span className="text-[#FFD200] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                The Estate Library
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                Architectural Monograph Library
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
                Every residence has been bound as an editorial monograph. Hover to inspect key specs or click any volume on the shelf to open its full two-page dossier and dual price list.
              </p>
            </div>
            <div className="flex items-center gap-3 z-10">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage(0);
                  setViewMode('reader');
                }}
                className="px-4 py-2.5 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                <span>Open Volume I</span>
              </button>
            </div>
          </div>

          {/* Realistic Bookshelf Container */}
          <div className="bg-[#2a1d17] p-6 sm:p-10 rounded-3xl border-8 border-[#3b2a21] shadow-2xl relative overflow-hidden">
            {/* Ambient Woodgrain Backing & Warm Spotlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1b120e] via-[#2a1d17] to-[#150d0a] opacity-95 pointer-events-none" />
            <div className="absolute top-0 left-1/4 right-1/4 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />

            {/* Bookshelf Row (Divided into 2 tiers if many houses) */}
            <div className="relative z-10 space-y-14">
              {/* Shelf Tier 1 */}
              <div>
                <div className="flex items-end gap-3 sm:gap-4 overflow-x-auto pb-4 pt-8 px-2 scrollbar-thin scrollbar-thumb-amber-900/50">
                  {properties.map((prop, idx) => {
                    const theme = SPINE_THEMES[idx % SPINE_THEMES.length];
                    const isHovered = hoveredBookIndex === idx;
                    const sell = prop.sellingPrice || (prop.status === 'sale' ? prop.price : 2800000);
                    const rent = prop.rentagePricePerWeek || (prop.status === 'rent' ? prop.price : 1250);

                    return (
                      <div
                        key={prop.id}
                        onMouseEnter={() => setHoveredBookIndex(idx)}
                        onMouseLeave={() => setHoveredBookIndex(null)}
                        onClick={() => {
                          setCurrentPage(idx);
                          setViewMode('reader');
                        }}
                        className="group flex flex-col items-center cursor-pointer relative shrink-0 transition-all duration-300"
                        style={{
                          transform: isHovered ? 'translateY(-16px) scale(1.02)' : 'translateY(0)',
                        }}
                      >
                        {/* Book Spine (Vertical Hardcover Book) */}
                        <div
                          className={`w-14 sm:w-16 h-72 sm:h-80 rounded-t-md bg-gradient-to-r ${theme.bg} border-l-2 border-r-2 ${theme.border} shadow-[0_10px_25px_rgba(0,0,0,0.6)] flex flex-col justify-between items-center py-4 px-1.5 relative select-none transition-shadow group-hover:shadow-[0_15px_30px_rgba(255,210,0,0.25)]`}
                        >
                          {/* Gold Foil Top Band */}
                          <div className="w-full flex flex-col items-center gap-1 border-b border-amber-500/20 pb-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD200] shadow-xs" />
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#FFD200]">
                              VOL.{idx + 1}
                            </span>
                          </div>

                          {/* Vertical Rotated Title on Spine */}
                          <div className="flex-1 flex items-center justify-center my-2 overflow-hidden w-full">
                            <div className="rotate-90 whitespace-nowrap text-[11px] sm:text-xs font-serif font-bold tracking-wider text-amber-50/90 truncate max-w-[190px]">
                              {prop.address} · {prop.suburb}
                            </div>
                          </div>

                          {/* Status Badge & Base Foil */}
                          <div className="w-full flex flex-col items-center gap-1.5 pt-2 border-t border-amber-500/20">
                            <span
                              className={`text-[8px] font-extrabold uppercase px-1 py-0.5 rounded tracking-tighter ${
                                prop.status === 'sale'
                                  ? 'bg-emerald-800/90 text-emerald-200'
                                  : 'bg-blue-800/90 text-blue-200'
                              }`}
                            >
                              {prop.status === 'sale' ? 'SALE' : 'RENT'}
                            </span>
                            <span className="text-[10px] font-bold text-amber-300 font-mono">
                              {prop.status === 'sale'
                                ? `$${(sell / 1000000).toFixed(1)}M`
                                : `$${rent}/w`}
                            </span>
                          </div>

                          {/* Ribbon bookmark hanging below spine */}
                          <div
                            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2.5 h-5 rounded-b-xs shadow-md"
                            style={{ backgroundColor: theme.ribbon }}
                          />
                        </div>

                        {/* Interactive Floating Peek Preview Card on Hover */}
                        {isHovered && (
                          <div className="absolute -top-40 z-30 w-56 bg-neutral-950 text-white rounded-xl p-3 shadow-2xl border border-[#FFD200] animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                            <div className="aspect-[16/10] rounded-lg overflow-hidden mb-2 bg-neutral-800">
                              <img
                                src={prop.images[0]}
                                alt={prop.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="text-xs font-bold truncate text-[#FFD200]">{prop.address}</div>
                            <div className="text-[10px] text-neutral-400">{prop.suburb} · {prop.bedrooms} Bed · {prop.bathrooms} Bath</div>
                            <div className="text-[11px] font-extrabold text-white mt-1">
                              Sell: ${sell.toLocaleString()} · Rent: ${rent}/wk
                            </div>
                            <div className="text-[9px] text-[#FFD200] font-semibold mt-1 flex items-center gap-1">
                              <span>Click to open book</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Wooden Shelf Surface Plank */}
                <div className="w-full h-5 bg-gradient-to-b from-[#4a3429] via-[#3b271d] to-[#251710] rounded-sm shadow-[0_8px_15px_rgba(0,0,0,0.8)] border-t border-amber-600/30 flex items-center justify-between px-6">
                  <span className="text-[9px] font-serif uppercase tracking-widest text-amber-200/50">
                    Ray White Rare Books &amp; Architectural Folios
                  </span>
                  <span className="text-[9px] text-amber-200/40">Shelf I</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: THE 2-PAGE OPEN MONOGRAPH SPREAD */}
      {viewMode === 'reader' && (
        <div className="relative bg-[#2B2927] rounded-3xl p-3 sm:p-6 shadow-2xl border-4 border-[#3D3A37] overflow-hidden">
          {/* Silk Bookmark Ribbon */}
          <div className="absolute top-0 right-16 sm:right-24 w-6 h-28 bg-[#FFD200] shadow-lg transform -skew-y-3 z-30 pointer-events-none flex flex-col justify-end items-center pb-2">
            <span className="text-[8px] font-extrabold uppercase tracking-tighter text-neutral-950 transform rotate-90">
              RAY WHITE
            </span>
          </div>

          {/* The Open Book Canvas with Spine Shadow */}
          <div className="bg-[#FAF7F2] rounded-2xl shadow-inner grid grid-cols-1 lg:grid-cols-12 min-h-[640px] relative overflow-hidden border border-[#E8E2D8]">
            {/* Spine Crease Center Line on Large Screens */}
            <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/10 via-black/25 to-transparent z-20 pointer-events-none" />

            {/* LEFT PAGE: The Architectural Plate (6 Cols) */}
            <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E8E2D8] relative bg-[#FCFAF7]">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold tracking-widest uppercase text-neutral-400 pb-3 border-b border-[#E8E2D8]">
                  <span>Plate No. {currentPage + 1}</span>
                  <span>{currentProperty.suburb} Portfolio</span>
                </div>

                {/* Large Image Showcase Plate */}
                <div className="mt-4 relative aspect-[4/3] rounded-xl overflow-hidden shadow-md border-4 border-white bg-neutral-900 group">
                  <img
                    src={images[activePhotoIndex]}
                    alt={currentProperty.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />

                  <div className="absolute top-3 left-3 bg-neutral-950/85 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-md shadow">
                    {currentProperty.status === 'sale' ? 'For Sale' : 'For Rent'}
                  </div>
                </div>

                {/* Alternate Thumbnail Plates */}
                {images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                          idx === activePhotoIndex
                            ? 'border-[#FFD200] ring-2 ring-[#FFD200]'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Plate thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Caption & Folio Number */}
              <div className="pt-6 border-t border-[#E8E2D8] mt-6 flex items-end justify-between text-xs text-neutral-500">
                <div>
                  <div className="font-serif italic text-neutral-800 text-sm">
                    &ldquo;{currentProperty.title}&rdquo;
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400 mt-0.5">
                    Archival Architecture Series · Ray White Est. 1902
                  </div>
                </div>
                <span className="font-mono text-neutral-400 font-bold">p. {currentPage * 2 + 1}</span>
              </div>
            </div>

            {/* RIGHT PAGE: Editorial Story & Dual Price List (6 Cols) */}
            <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative bg-[#FAF7F2]">
              <div className="space-y-6">
                {/* Top Folio Header */}
                <div className="flex items-center justify-between text-[11px] font-bold tracking-widest uppercase text-neutral-400 pb-3 border-b border-[#E8E2D8]">
                  <span>Ray White Monograph · Vol. {currentPage + 1}</span>
                  <span className="text-neutral-700 font-semibold">{currentProperty.type}</span>
                </div>

                {/* Title & Suburb Headline */}
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                    {currentProperty.address}
                  </h2>
                  <div className="text-xs font-bold text-neutral-600 mt-1 uppercase tracking-wider">
                    {currentProperty.suburb}, {currentProperty.state} {currentProperty.postcode}
                  </div>
                </div>

                {/* DUAL PRICING BOOKPLATE (SELLING & RENTAGE SIDE BY SIDE) */}
                <div className="bg-white p-4 rounded-xl border border-neutral-300 shadow-xs space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                    <span>Official Tariff Breakdown</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-extrabold">
                      Gross Yield: {yieldVal}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-100">
                    {/* Selling Price Box */}
                    <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        Selling Price
                      </div>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-lg sm:text-xl font-extrabold text-neutral-950 tabular-nums">
                          ${sellingVal.toLocaleString()}
                        </span>
                        {currentProperty.status === 'sale' && currentProperty.priceReduced && currentProperty.originalPrice && (
                          <span className="text-xs text-neutral-400 line-through tabular-nums">
                            ${currentProperty.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {currentProperty.status === 'sale' && currentProperty.priceReduced && currentProperty.savingsAmount && (
                        <div className="mt-0.5">
                          <span className="inline-flex items-center text-[9px] font-extrabold text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded">
                            Save ${currentProperty.savingsAmount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                        {currentProperty.auctionDate ? 'Auction Guide' : 'Buy Now / Private Treaty'}
                      </div>
                    </div>

                    {/* Rentage Price Box */}
                    <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        Rentage Rate
                      </div>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-lg sm:text-xl font-extrabold text-neutral-950 tabular-nums">
                          ${rentWeeklyVal.toLocaleString()} <span className="text-xs font-normal text-neutral-500">/ wk</span>
                        </span>
                        {currentProperty.status === 'rent' && currentProperty.priceReduced && currentProperty.originalPrice && (
                          <span className="text-xs text-neutral-400 line-through tabular-nums">
                            ${currentProperty.originalPrice.toLocaleString()}/wk
                          </span>
                        )}
                      </div>
                      {currentProperty.status === 'rent' && currentProperty.priceReduced && currentProperty.savingsAmount && (
                        <div className="mt-0.5">
                          <span className="inline-flex items-center text-[9px] font-extrabold text-blue-800 bg-blue-100 px-1 py-0.2 rounded">
                            Save ${currentProperty.savingsAmount.toLocaleString()}/wk
                          </span>
                        </div>
                      )}
                      <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                        ${rentMonthlyVal.toLocaleString()} / mo · Bond ${(rentWeeklyVal * 4).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Specs Matrix */}
                <div className="grid grid-cols-4 gap-2 text-center py-2.5 px-3 bg-neutral-100/70 rounded-xl border border-neutral-200 text-xs">
                  <div>
                    <div className="text-[10px] text-neutral-500 font-medium">Bedrooms</div>
                    <div className="font-extrabold text-neutral-900 text-sm tabular-nums mt-0.5">
                      {currentProperty.bedrooms || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 font-medium">Bathrooms</div>
                    <div className="font-extrabold text-neutral-900 text-sm tabular-nums mt-0.5">
                      {currentProperty.bathrooms || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 font-medium">Parking</div>
                    <div className="font-extrabold text-neutral-900 text-sm tabular-nums mt-0.5">
                      {currentProperty.carSpaces || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 font-medium">Land Area</div>
                    <div className="font-extrabold text-neutral-900 text-sm tabular-nums mt-0.5">
                      {currentProperty.landSizeM2 ? `${currentProperty.landSizeM2.toLocaleString()}m²` : 'Strata'}
                    </div>
                  </div>
                </div>

                {/* Editorial Description */}
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-serif text-justify">
                  {currentProperty.description}
                </p>

                {/* Inclusions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentProperty.features.slice(0, 5).map((f) => (
                    <span
                      key={f}
                      className="text-[11px] font-semibold text-neutral-700 bg-white border border-neutral-300 px-2 py-0.5 rounded-md"
                    >
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions and Agent Sign-off */}
              <div className="pt-6 border-t border-[#E8E2D8] mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#FFD200]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold text-neutral-900">{agent.name}</div>
                    <div className="text-[10px] text-neutral-500">{agent.office}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => onToggleCompare(currentProperty.id)}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial ${
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
                    onClick={() => onSelectProperty(currentProperty)}
                    className="px-4 py-2 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer flex-1 sm:flex-initial"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Dossier</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
