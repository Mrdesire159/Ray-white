import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Scale,
  Heart,
  Bed,
  Bath,
  Car,
  Maximize2,
  MapPin,
  ArrowRight,
  Camera,
} from 'lucide-react';
import { Property, PropertyStatus } from '../types/property';
import { ClimateComfortBadge } from './ClimateComfortBadge';

interface HouseSlideViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onTourInside: (property: Property) => void;
  onToggleCompare: (propertyId: string) => void;
  comparedIds: string[];
  savedIds: string[];
  onToggleSave: (propertyId: string) => void;
}

export const HouseSlideView: React.FC<HouseSlideViewProps> = ({
  properties,
  onSelectProperty,
  onTourInside,
  onToggleCompare,
  comparedIds,
  savedIds,
  onToggleSave,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'sale' | 'rent'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const filteredProperties = properties.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.status === activeFilter;
  });

  // Keep index within bounds when filter changes
  useEffect(() => {
    if (currentIndex >= filteredProperties.length) {
      setCurrentIndex(0);
    }
  }, [filteredProperties.length, currentIndex]);

  // Autoplay slide rotation
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredProperties.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, filteredProperties.length]);

  const currentProp = filteredProperties[currentIndex] || filteredProperties[0];
  if (!currentProp) return null;

  const isSaved = savedIds.includes(currentProp.id);
  const isCompared = comparedIds.includes(currentProp.id);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredProperties.length) % filteredProperties.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredProperties.length);
  };

  return (
    <section className="py-8 sm:py-12 bg-white border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* MAIN SLIDE CARD */}
        <div className="bg-neutral-50 rounded-3xl border border-neutral-200 overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12 transition-all">
          {/* Left: Full-Bleed Architectural Visual (7 cols) */}
          <div className="lg:col-span-7 relative h-[360px] sm:h-[480px] lg:h-[560px] bg-neutral-900 overflow-hidden group">
            <img
              src={currentProp.images[0]}
              alt={currentProp.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-black/20" />

            {/* Slide Navigation Arrows */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-neutral-900/60 hover:bg-neutral-900 text-white backdrop-blur-md transition-all cursor-pointer z-10"
              aria-label="Previous residence"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-neutral-900/60 hover:bg-neutral-900 text-white backdrop-blur-md transition-all cursor-pointer z-10"
              aria-label="Next residence"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase shadow-md ${
                  currentProp.status === 'sale' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                {currentProp.status === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-neutral-900/90 text-white backdrop-blur-md border border-white/20">
                {currentProp.suburb}, {currentProp.state}
              </span>
            </div>

            {/* Floating Quick Action: Save & Tour */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleSave(currentProp.id)}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                  isSaved
                    ? 'bg-rose-500 text-white'
                    : 'bg-neutral-900/70 text-white hover:bg-neutral-900'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save property'}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right: Architectural Details & Specifications (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white space-y-6">
            <div>
              {/* Type & Suburb */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {currentProp.type} · Built {currentProp.yearBuilt || 2021}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Gross Yield {currentProp.grossYield || '2.4%'}
                </span>
              </div>

              {/* Title & Address */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 mt-2 leading-tight">
                {currentProp.address}
              </h3>
              <p className="text-xs text-neutral-500 font-semibold mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>{currentProp.suburb}, {currentProp.state} {currentProp.postcode}</span>
              </p>

              {/* Climate Comfort Badge */}
              <div className="mt-3">
                <ClimateComfortBadge
                  suburb={currentProp.suburb}
                  state={currentProp.state}
                  variant="compact"
                />
              </div>

              {/* Dual Price Schedule Matrix */}
              <div className="mt-5 p-4 bg-neutral-50 rounded-2xl border border-neutral-200/90 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-neutral-500">Purchase / Valuation:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-neutral-950 tabular-nums">
                      {currentProp.priceDisplay}
                    </span>
                    {currentProp.priceReduced && currentProp.originalPriceDisplay && (
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <span className="text-xs text-neutral-400 line-through tabular-nums">
                          {currentProp.originalPriceDisplay}
                        </span>
                        {currentProp.savingsAmount && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                            Save ${currentProp.savingsAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t border-neutral-200">
                  <span className="text-xs font-semibold text-neutral-500">Rentage Guide:</span>
                  <span className="text-base font-bold text-neutral-900 tabular-nums">
                    ${(currentProp.rentagePricePerWeek || 1200).toLocaleString()}{' '}
                    <span className="text-xs font-normal text-neutral-500">/ week</span>
                  </span>
                </div>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-3 gap-2 py-4 border-y border-neutral-100 text-center mt-5">
                <div className="p-2 rounded-xl bg-neutral-50">
                  <div className="flex items-center justify-center gap-1 text-neutral-400 mb-1">
                    <Bed className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-bold text-neutral-900">{currentProp.bedrooms}</div>
                  <div className="text-[10px] text-neutral-500 font-medium">Bedrooms</div>
                </div>

                <div className="p-2 rounded-xl bg-neutral-50">
                  <div className="flex items-center justify-center gap-1 text-neutral-400 mb-1">
                    <Bath className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-bold text-neutral-900">{currentProp.bathrooms}</div>
                  <div className="text-[10px] text-neutral-500 font-medium">Bathrooms</div>
                </div>

                <div className="p-2 rounded-xl bg-neutral-50">
                  <div className="flex items-center justify-center gap-1 text-neutral-400 mb-1">
                    <Car className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-bold text-neutral-900">{currentProp.carSpaces}</div>
                  <div className="text-[10px] text-neutral-500 font-medium">Car Garage</div>
                </div>
              </div>

              {/* Narrative description */}
              <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed mt-4">
                {currentProp.description}
              </p>
            </div>

            {/* Action Bar */}
            <div className="space-y-2 pt-4 border-t border-neutral-100">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onTourInside(currentProp)}
                  className="py-3 px-4 bg-gradient-to-r from-amber-400 via-[#FFD200] to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-neutral-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Tour Inside</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectProperty(currentProp)}
                  className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => onToggleCompare(currentProp.id)}
                  className={`text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isCompared
                      ? 'bg-neutral-900 text-[#FFD200] border-neutral-900'
                      : 'text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isCompared ? 'In Compare List' : 'Add to Compare'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="text-xs font-bold text-neutral-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Next Residence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Selector Strip */}
        <div className="mt-6 flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {filteredProperties.map((prop, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={prop.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`group flex items-center gap-2 p-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-md ring-2 ring-[#FFD200]'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <img
                  src={prop.images[0]}
                  alt={prop.title}
                  className="w-10 h-8 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="pr-2 text-left hidden sm:block">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    {prop.suburb}
                  </div>
                  <div className={`text-xs font-bold truncate max-w-[120px] ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                    {prop.priceDisplay}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
