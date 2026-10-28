import React, { useState, useEffect } from 'react';
import { Sun, Thermometer, Sparkles, CloudSun, Wind, Droplets } from 'lucide-react';
import { fetchClimateComfort, getCachedClimateComfort, ClimateComfortData } from '../services/climateService';

interface ClimateComfortBadgeProps {
  suburb: string;
  state?: string;
  variant?: 'compact' | 'badge' | 'detailed' | 'card' | 'inline';
  className?: string;
  showTooltip?: boolean;
}

export const ClimateComfortBadge: React.FC<ClimateComfortBadgeProps> = ({
  suburb,
  state = 'NSW',
  variant = 'compact',
  className = '',
  showTooltip = true,
}) => {
  const [data, setData] = useState<ClimateComfortData | null>(() =>
    getCachedClimateComfort(suburb, state)
  );
  const [isLoading, setIsLoading] = useState(!data);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchClimateComfort(suburb, state)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [suburb, state]);

  if (isLoading || !data) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-50/60 text-amber-700/70 text-[11px] font-medium animate-pulse border border-amber-200/50 ${className}`}
      >
        <Sun className="w-3 h-3 text-amber-400 animate-spin" />
        <span>Climate info...</span>
      </div>
    );
  }

  // Visual score badge styling
  const getScoreColor = (score: number) => {
    if (score >= 93) return 'from-amber-500 to-orange-500 text-white';
    if (score >= 88) return 'from-amber-400 to-yellow-500 text-neutral-950';
    return 'from-blue-500 to-teal-500 text-white';
  };

  /* ------------------------------------------------------------- */
  /* VARIANT: DETAILED (Used in PropertyDetailModal)               */
  /* ------------------------------------------------------------- */
  if (variant === 'detailed' || variant === 'card') {
    return (
      <div
        className={`bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 rounded-2xl p-4 sm:p-5 border border-amber-200/70 shadow-xs relative overflow-hidden ${className}`}
      >
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-700 ring-1 ring-amber-400/30">
                <Sun className="w-5 h-5 text-amber-600 fill-amber-400/50" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-neutral-900 tracking-tight">
                    Climate Comfort Index
                  </h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200/80">
                    {data.comfortRating}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-medium">
                  {data.suburb}, {data.state} Local Microclimate
                </p>
              </div>
            </div>

            {/* Comfort Score Circle */}
            <div className="flex items-center gap-2 text-right">
              <div>
                <div className="text-xl sm:text-2xl font-black text-amber-600 tabular-nums leading-none">
                  {data.comfortScore}
                  <span className="text-xs text-neutral-400 font-normal">/100</span>
                </div>
                <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Comfort Rating
                </div>
              </div>
            </div>
          </div>

          {/* Microclimate Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-amber-200/50">
            {/* 1. Daily Sunshine */}
            <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-amber-100/80 shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Daily Sunshine</span>
              </div>
              <div className="text-base sm:text-lg font-black text-neutral-900 mt-0.5 tabular-nums">
                {data.dailySunshineHours} <span className="text-xs font-bold text-neutral-600">hrs/day</span>
              </div>
              <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                ~{data.annualSunnyDays} sunny days/yr
              </div>
            </div>

            {/* 2. Temperature Range */}
            <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-amber-100/80 shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500">
                <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                <span>Annual Range</span>
              </div>
              <div className="text-base sm:text-lg font-black text-neutral-900 mt-0.5 tabular-nums">
                {data.tempRange.min}° – {data.tempRange.max}°C
              </div>
              <div className="text-[10px] text-neutral-500 font-medium mt-0.5">
                Summer {data.summerAverageMax}° / Winter {data.winterAverageMin}°
              </div>
            </div>

            {/* 3. Solar Generation Potential */}
            <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-amber-100/80 shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Solar Potential</span>
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-700 mt-0.5">
                {data.solarPotential}
              </div>
              <div className="text-[10px] text-neutral-500 font-medium mt-0.5">
                Ideal for PV arrays
              </div>
            </div>

            {/* 4. Atmospheric Comfort */}
            <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-amber-100/80 shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500">
                <Wind className="w-3.5 h-3.5 text-teal-500" />
                <span>Atmosphere</span>
              </div>
              <div className="text-base sm:text-lg font-black text-neutral-900 mt-0.5 tabular-nums">
                {data.humidityAverage}% <span className="text-xs font-medium text-neutral-500">RH</span>
              </div>
              <div className="text-[10px] text-neutral-500 font-medium mt-0.5">
                UV Index avg: {data.uvIndexAverage}
              </div>
            </div>
          </div>

          {/* Suburb Microclimate Summary */}
          <div className="mt-3 text-xs text-neutral-600 bg-amber-500/10 p-2.5 rounded-xl border border-amber-200/50 leading-relaxed font-normal">
            <span className="font-bold text-amber-900 mr-1">Local Suburb Profile:</span>
            {data.summary}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* VARIANT: INLINE / COMPACT (Used in PropertyCard & Listings)    */
  /* ------------------------------------------------------------- */
  return (
    <div
      className={`group/climate relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsTooltipOpen(true)}
      onMouseLeave={() => setIsTooltipOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsTooltipOpen((prev) => !prev);
      }}
    >
      {/* Badge Button */}
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50/80 hover:from-amber-100 hover:to-orange-100 text-neutral-800 border border-amber-200/90 shadow-2xs transition-all duration-200 cursor-help"
        tabIndex={0}
        role="button"
        aria-label={`Climate Comfort: ${data.dailySunshineHours} hours sunshine, ${data.tempRange.min} to ${data.tempRange.max} degrees Celsius`}
      >
        <span className="flex items-center text-amber-600">
          <Sun className="w-3.5 h-3.5 fill-amber-400 text-amber-600 animate-[spin_16s_linear_infinite]" />
        </span>

        <span className="text-[11px] font-black text-amber-900 tracking-tight tabular-nums">
          {data.dailySunshineHours}h <span className="font-semibold text-neutral-600">sun/day</span>
        </span>

        <span className="text-neutral-300 font-light">•</span>

        <span className="text-[11px] font-bold text-neutral-700 tracking-tight tabular-nums flex items-center gap-0.5">
          <Thermometer className="w-3 h-3 text-rose-500 inline" />
          {data.tempRange.min}°–{data.tempRange.max}°C
        </span>

        <span className="ml-0.5 px-1 py-0.2 rounded text-[9px] font-black bg-amber-200/80 text-amber-900">
          {data.comfortScore}
        </span>
      </div>

      {/* Hover Tooltip Popup */}
      {showTooltip && (
        <div
          role="tooltip"
          className={`absolute bottom-full mb-2 left-0 sm:left-1/2 sm:-translate-x-1/2 w-72 p-3.5 bg-neutral-900/95 text-white rounded-2xl shadow-2xl border border-neutral-700/80 backdrop-blur-md transition-all duration-200 z-50 pointer-events-none text-left ${
            isTooltipOpen
              ? 'opacity-100 visible translate-y-0'
              : 'opacity-0 invisible translate-y-1'
          }`}
        >
          {/* Tooltip Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-lg bg-amber-400/20 text-amber-400">
                <CloudSun className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-black text-white tracking-tight">
                  Climate Comfort Index
                </div>
                <div className="text-[10px] text-amber-300/90 font-medium">
                  {data.suburb}, {data.state} • {data.comfortRating}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-400 text-neutral-950">
                {data.comfortScore}/100
              </span>
            </div>
          </div>

          {/* Metric Rows */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between py-0.5 text-neutral-300">
              <span className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
                <Sun className="w-3 h-3 text-amber-400" /> Average Sunshine:
              </span>
              <span className="font-bold text-white tabular-nums">
                {data.dailySunshineHours} hrs/day ({data.annualSunnyDays} days/yr)
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5 text-neutral-300">
              <span className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
                <Thermometer className="w-3 h-3 text-rose-400" /> Temperature Range:
              </span>
              <span className="font-bold text-white tabular-nums">
                {data.tempRange.min}°C – {data.tempRange.max}°C
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5 text-neutral-300">
              <span className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
                <Droplets className="w-3 h-3 text-teal-400" /> Humidity & Breeze:
              </span>
              <span className="font-semibold text-neutral-200">
                {data.humidityAverage}% avg • Sea breezes
              </span>
            </div>
          </div>

          {/* Context Note */}
          <p className="mt-2 pt-2 border-t border-neutral-800 text-[11px] leading-relaxed text-neutral-300 font-normal">
            {data.summary}
          </p>

          <div className="mt-2 text-[9px] text-neutral-400 italic flex items-center justify-between">
            <span>BoM Localized Climatology Data</span>
            <span className="text-amber-400 font-semibold">{data.solarPotential} Solar</span>
          </div>

          {/* Caret */}
          <div className="absolute top-full left-6 sm:left-1/2 sm:-translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-neutral-900/95" />
        </div>
      )}
    </div>
  );
};
