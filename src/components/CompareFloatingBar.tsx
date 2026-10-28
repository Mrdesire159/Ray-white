import React from 'react';
import { Scale, X, ArrowRight } from 'lucide-react';
import { Property } from '../types/property';

interface CompareFloatingBarProps {
  comparedProperties: Property[];
  onOpenCompareModal: () => void;
  onRemoveProperty: (id: string) => void;
  onClearAll: () => void;
}

export const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({
  comparedProperties,
  onOpenCompareModal,
  onRemoveProperty,
  onClearAll,
}) => {
  if (comparedProperties.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92vw] sm:w-auto animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-neutral-950 text-white rounded-2xl shadow-2xl border border-neutral-800 p-2 sm:p-2.5 sm:px-4 flex items-center justify-between gap-3 sm:gap-6 backdrop-blur-md">
        {/* Left: Indicator & Thumbnails */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#FFD200] text-neutral-950 flex items-center justify-center font-bold shrink-0">
            <Scale className="w-4 h-4" />
          </div>

          <div className="hidden sm:block">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Compare Properties</span>
              <span className="text-[10px] bg-neutral-800 text-[#FFD200] px-1.5 py-0.5 rounded font-bold">
                {comparedProperties.length}/3
              </span>
            </div>
            <div className="text-[10px] text-neutral-400">
              {comparedProperties.length === 1
                ? 'Select 1 or 2 more to compare'
                : 'Ready for side-by-side spec review'}
            </div>
          </div>

          {/* Mini Thumbnails */}
          <div className="flex items-center gap-1.5">
            {comparedProperties.map((p) => (
              <div
                key={p.id}
                className="relative group w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-800 shrink-0"
              >
                <img
                  src={p.images[0]}
                  alt={p.address}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => onRemoveProperty(p.id)}
                  className="absolute inset-0 bg-neutral-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove from compare"
                >
                  <X className="w-3.5 h-3.5 text-rose-400" />
                </button>
              </div>
            ))}

            {/* Empty slots indicator */}
            {Array.from({ length: 3 - comparedProperties.length }).map((_, idx) => (
              <div
                key={idx}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-dashed border-neutral-700 flex items-center justify-center text-neutral-600 text-xs shrink-0"
                title="Available slot"
              >
                +
              </div>
            ))}
          </div>
        </div>

        {/* Right Actions: Compare CTA & Clear */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-neutral-400 hover:text-white px-2 py-1 transition-colors cursor-pointer hidden md:inline"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={onOpenCompareModal}
            className="px-3.5 py-2 bg-[#FFD200] hover:bg-[#E5BC00] active:scale-[0.98] text-neutral-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
          >
            <span>Compare {comparedProperties.length} Homes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
