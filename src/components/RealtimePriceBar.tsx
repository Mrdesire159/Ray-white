import React, { useState } from 'react';
import {
  TrendingDown,
  Percent,
  Sparkles,
  RotateCcw,
  Sliders,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { usePrice } from '../context/PriceContext';

export const RealtimePriceBar: React.FC = () => {
  const {
    globalReductionPercent,
    setGlobalReductionPercent,
    totalPortfolioSavings,
    isRealTimeSyncActive,
    setIsRealTimeSyncActive,
    resetAllReductions,
  } = usePrice();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const presets = [0, 5, 10, 15, 20, 25];

  return (
    <div className="bg-neutral-950 text-white border-b border-amber-400/30 transition-all shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Buyer Savings (shown only when active reductions produce savings) */}
          {totalPortfolioSavings > 0 ? (
            <div className="text-xs text-neutral-300 flex items-center gap-2">
              <span className="text-neutral-400 text-[11px]">
                Total Buyer Savings:{' '}
                <strong className="text-[#FFD200] font-mono">
                  ${totalPortfolioSavings.toLocaleString()} AUD
                </strong>
              </span>
            </div>
          ) : (
            <div />
          )}

          {/* Right: Quick Reduction Presets & Custom Slider Toggle - Each button uniquely themed */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <div className="flex items-center bg-neutral-900/90 border border-neutral-800 rounded-xl p-1 gap-1 text-xs font-bold shadow-inner">
              {presets.map((pct) => {
                const isActive = globalReductionPercent === pct && isRealTimeSyncActive;
                // Specific theme color for each button: Blue, Green, Red alternating
                const buttonStyles: Record<number, { active: string; inactive: string }> = {
                  0: {
                    active: 'bg-blue-600 text-white shadow-xs shadow-blue-500/30 ring-1 ring-blue-400',
                    inactive: 'text-blue-300 hover:text-white hover:bg-blue-600/30',
                  },
                  5: {
                    active: 'bg-emerald-600 text-white shadow-xs shadow-emerald-500/30 ring-1 ring-emerald-400',
                    inactive: 'text-emerald-300 hover:text-white hover:bg-emerald-600/30',
                  },
                  10: {
                    active: 'bg-red-600 text-white shadow-xs shadow-red-500/30 ring-1 ring-red-400',
                    inactive: 'text-red-300 hover:text-white hover:bg-red-600/30',
                  },
                  15: {
                    active: 'bg-sky-600 text-white shadow-xs shadow-sky-500/30 ring-1 ring-sky-400',
                    inactive: 'text-sky-300 hover:text-white hover:bg-sky-600/30',
                  },
                  20: {
                    active: 'bg-teal-600 text-white shadow-xs shadow-teal-500/30 ring-1 ring-teal-400',
                    inactive: 'text-teal-300 hover:text-white hover:bg-teal-600/30',
                  },
                  25: {
                    active: 'bg-rose-600 text-white shadow-xs shadow-rose-500/30 ring-1 ring-rose-400',
                    inactive: 'text-rose-300 hover:text-white hover:bg-rose-600/30',
                  },
                };

                const style = buttonStyles[pct] || buttonStyles[0];

                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setGlobalReductionPercent(pct);
                      if (!isRealTimeSyncActive) setIsRealTimeSyncActive(true);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      isActive ? style.active : style.inactive
                    }`}
                  >
                    {pct === 0 ? 'Normal' : `-${pct}%`}
                  </button>
                );
              })}
            </div>

            {/* Adjust Button - Indigo/Sky Accent */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 hover:text-white rounded-xl border border-indigo-700/60 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              title="Custom real-time reduction slider"
            >
              <Sliders className="w-3 h-3 text-indigo-400" />
              <span className="hidden xs:inline">Adjust</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Reset Button - Crimson Red Accent */}
            {globalReductionPercent > 0 && (
              <button
                type="button"
                onClick={resetAllReductions}
                className="px-2 py-1.5 rounded-xl text-rose-300 bg-red-950/80 border border-red-700/60 hover:bg-red-900 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold shadow-2xs"
                title="Reset to 0% reduction"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Expanded Real-Time Slider Drawer */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <span className="text-[11px] font-bold text-neutral-400 shrink-0">
                Live Reduction Slider:
              </span>
              <input
                type="range"
                min={0}
                max={30}
                step={1}
                value={globalReductionPercent}
                onChange={(e) => {
                  setGlobalReductionPercent(parseInt(e.target.value, 10));
                  if (!isRealTimeSyncActive) setIsRealTimeSyncActive(true);
                }}
                className="w-full accent-[#FFD200] cursor-pointer"
              />
              <span className="text-xs font-mono font-black text-[#FFD200] w-12 text-right">
                -{globalReductionPercent}%
              </span>
            </div>

            <div className="text-[11px] text-neutral-400 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                Equalised instantly across Listing Cards, Modal Views, Loan Calculator, &amp; Price List.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
