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
  Zap,
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
          {/* Left: Indicator & Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FFD200] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-[#FFD200]" />
                <span>Live Price Sync Engine</span>
              </span>
            </div>

            <span className="text-neutral-500 hidden md:inline">|</span>

            <div className="text-xs text-neutral-300 flex items-center gap-2">
              <span className="font-semibold">
                Prices Reduced by{' '}
                <strong className="text-emerald-400 font-extrabold tabular-nums">
                  {globalReductionPercent}%
                </strong>{' '}
                in Real-Time
              </span>
              {totalPortfolioSavings > 0 && (
                <span className="hidden lg:inline text-neutral-400 text-[11px]">
                  (Total Buyer Savings:{' '}
                  <strong className="text-[#FFD200] font-mono">
                    ${totalPortfolioSavings.toLocaleString()} AUD
                  </strong>
                  )
                </span>
              )}
            </div>
          </div>

          {/* Right: Quick Reduction Presets & Custom Slider Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs font-bold">
              {presets.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => {
                    setGlobalReductionPercent(pct);
                    if (!isRealTimeSyncActive) setIsRealTimeSyncActive(true);
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                    globalReductionPercent === pct && isRealTimeSyncActive
                      ? 'bg-[#FFD200] text-neutral-950 shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {pct === 0 ? 'Normal' : `-${pct}%`}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border border-neutral-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Custom real-time reduction slider"
            >
              <Sliders className="w-3 h-3 text-[#FFD200]" />
              <span className="hidden xs:inline">Adjust</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {globalReductionPercent > 0 && (
              <button
                type="button"
                onClick={resetAllReductions}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Reset to 0% reduction"
              >
                <RotateCcw className="w-3.5 h-3.5" />
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
