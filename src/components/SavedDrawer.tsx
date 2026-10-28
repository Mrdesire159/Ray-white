import React from 'react';
import { X, Heart, Trash2, ArrowRight, Eye, Scale } from 'lucide-react';
import { Property } from '../types/property';

interface SavedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedProperties: Property[];
  onRemove: (id: string) => void;
  onSelectProperty: (property: Property) => void;
  onClearAll: () => void;
  comparedIds?: string[];
  onToggleCompare?: (id: string) => void;
  onOpenCompare?: () => void;
}

export const SavedDrawer: React.FC<SavedDrawerProps> = ({
  isOpen,
  onClose,
  savedProperties,
  onRemove,
  onSelectProperty,
  onClearAll,
  comparedIds = [],
  onToggleCompare,
  onOpenCompare,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="font-bold text-base text-neutral-900">
              Saved Properties ({savedProperties.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {savedProperties.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-neutral-400 hover:text-neutral-700 underline"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedProperties.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 space-y-3">
              <Heart className="w-10 h-10 text-neutral-300 mx-auto" />
              <p className="text-sm font-semibold text-neutral-700">No properties saved yet</p>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Click the heart icon on any property card to save it here for quick comparison and inspection tracking.
              </p>
            </div>
          ) : (
            savedProperties.map((prop) => (
              <div
                key={prop.id}
                className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex gap-3 group relative hover:border-neutral-300 transition-colors"
              >
                <img
                  src={prop.images[0]}
                  alt={prop.title}
                  className="w-20 h-20 rounded-lg object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-neutral-900 truncate">
                      {prop.address}
                    </div>
                    <div className="text-xs text-neutral-500">{prop.suburb}</div>
                    <div className="text-sm font-extrabold text-neutral-900 tabular-nums mt-0.5">
                      {prop.priceDisplay}
                    </div>
                    {prop.priceReduced && prop.originalPriceDisplay && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span className="text-[10px] text-neutral-400 line-through">
                          {prop.originalPriceDisplay}
                        </span>
                        {prop.savingsAmount && (
                          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded">
                            Save ${prop.savingsAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProperty(prop);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                    {onToggleCompare && (
                      <button
                        type="button"
                        onClick={() => onToggleCompare(prop.id)}
                        className={`px-2 py-1 text-[11px] font-semibold rounded flex items-center gap-1 transition-colors cursor-pointer ${
                          comparedIds.includes(prop.id)
                            ? 'bg-neutral-900 text-[#FFD200]'
                            : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
                        }`}
                        title="Add to side-by-side comparison"
                      >
                        <Scale className="w-3 h-3" />
                        <span>{comparedIds.includes(prop.id) ? 'Compared' : 'Compare'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemove(prop.id)}
                      className="p-1 text-neutral-400 hover:text-rose-600 transition-colors ml-auto"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
