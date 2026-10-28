import React from 'react';
import {
  X,
  Scale,
  Bed,
  Bath,
  Car,
  Maximize2,
  Calendar,
  Check,
  Minus,
  Plus,
  Eye,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Sun
} from 'lucide-react';
import { Property } from '../types/property';
import { getAgentById } from '../data/agents';
import { ALL_FEATURES } from '../data/properties';
import { ClimateComfortBadge } from './ClimateComfortBadge';
import { usePrice } from '../context/PriceContext';

interface PropertyCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedProperties: Property[];
  onRemoveProperty: (id: string) => void;
  onAddProperty: (property: Property) => void;
  onSelectProperty: (property: Property) => void;
  onClearAll: () => void;
}

export const PropertyCompareModal: React.FC<PropertyCompareModalProps> = ({
  isOpen,
  onClose,
  comparedProperties,
  onRemoveProperty,
  onAddProperty,
  onSelectProperty,
  onClearAll,
}) => {
  const { syncedProperties } = usePrice();
  if (!isOpen) return null;

  // Find remaining properties that are not currently in comparison (to allow adding)
  const availableToAdd = syncedProperties.filter(
    (p) => !comparedProperties.some((cp) => cp.id === p.id)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-neutral-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFD200] flex items-center justify-center text-neutral-950 font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                Property Comparison
              </h2>
              <p className="text-xs text-neutral-500">
                Comparing {comparedProperties.length} of 3 maximum properties side-by-side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {comparedProperties.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Close comparison"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Comparison Table Area */}
        <div className="overflow-x-auto overflow-y-auto p-4 sm:p-6">
          {comparedProperties.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                <Scale className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">No properties selected for comparison</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Select up to 3 properties from the listings or cards using the &quot;Compare&quot; option to review prices, bedrooms, land size, and features side-by-side.
              </p>
            </div>
          ) : (
            <div className="min-w-[680px]">
              {/* Properties Top Row (Cards) */}
              <div className="grid grid-cols-4 gap-4 pb-6 border-b border-neutral-200">
                {/* Column 0: Label column */}
                <div className="flex flex-col justify-end pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Property Overview
                  </span>
                  <span className="text-xs text-neutral-500 mt-1">
                    Side-by-side specification evaluation
                  </span>
                </div>

                {/* Columns 1 to 3: Compared Properties */}
                {comparedProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-neutral-50 rounded-xl border border-neutral-200 p-3 flex flex-col justify-between relative group hover:border-neutral-300 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => onRemoveProperty(prop.id)}
                      className="absolute top-2 right-2 p-1.5 bg-neutral-900/80 hover:bg-neutral-950 text-white rounded-full z-10 transition-colors"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-neutral-200 mb-2 relative">
                        <img
                          src={prop.images[0]}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span
                          className={`absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded text-white ${
                            prop.status === 'sale' ? 'bg-emerald-600' : 'bg-blue-600'
                          }`}
                        >
                          {prop.status === 'sale' ? 'For Sale' : 'For Rent'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-neutral-900 line-clamp-1">
                        {prop.address}
                      </h4>
                      <p className="text-xs text-neutral-500 font-medium">{prop.suburb}</p>

                      <div className="mt-2 text-base font-extrabold text-neutral-900 tabular-nums">
                        {prop.priceDisplay}
                      </div>
                      {prop.priceReduced && prop.originalPriceDisplay && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="text-[11px] text-neutral-400 line-through">
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

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectProperty(prop);
                      }}
                      className="mt-3 w-full py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#FFD200]" />
                      <span>View Full Listing</span>
                    </button>
                  </div>
                ))}

                {/* Add slot placeholder if fewer than 3 */}
                {comparedProperties.length < 3 && (
                  <div className="border-2 border-dashed border-neutral-200 hover:border-[#FFD200] rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors bg-white">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-2">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-800">Add Property</span>
                    <span className="text-[11px] text-neutral-400 mt-0.5">
                      ({3 - comparedProperties.length} slot available)
                    </span>

                    {availableToAdd.length > 0 && (
                      <select
                        onChange={(e) => {
                          const found = availableToAdd.find((p) => p.id === e.target.value);
                          if (found) onAddProperty(found);
                          e.target.value = '';
                        }}
                        defaultValue=""
                        className="mt-3 w-full bg-neutral-50 border border-neutral-300 rounded-lg px-2 py-1.5 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#FFD200] cursor-pointer"
                      >
                        <option value="" disabled>
                          Select a property...
                        </option>
                        {availableToAdd.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.address}, {p.suburb} ({p.priceDisplay})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* If only 1 property, add a second placeholder slot to balance grid */}
                {comparedProperties.length === 1 && (
                  <div className="border border-neutral-100 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-neutral-50/50 text-neutral-400 text-xs">
                    <span>Select up to 3 homes to compare side-by-side</span>
                  </div>
                )}
              </div>

              {/* Specification Comparison Rows */}
              <div className="divide-y divide-neutral-100 text-xs">
                {/* 1. Price row */}
                <div className="grid grid-cols-4 gap-4 py-3.5 items-center">
                  <div className="font-bold text-neutral-600">Price / Rent</div>
                  {comparedProperties.map((p) => (
                    <div key={p.id}>
                      <div className="font-extrabold text-sm text-neutral-900 tabular-nums">
                        {p.priceDisplay}
                      </div>
                      {p.priceReduced && p.originalPriceDisplay && (
                        <div className="text-[10px] text-neutral-400 line-through">
                          {p.originalPriceDisplay}
                        </div>
                      )}
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparedProperties.length }).map((_, i) => (
                    <div key={i} className="text-neutral-300">—</div>
                  ))}
                </div>

                {/* 2. Property Type */}
                <div className="grid grid-cols-4 gap-4 py-3 items-center bg-neutral-50/50">
                  <div className="font-bold text-neutral-600">Property Type</div>
                  {comparedProperties.map((p) => (
                    <div key={p.id} className="font-semibold text-neutral-800">
                      {p.type}
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparedProperties.length }).map((_, i) => (
                    <div key={i} className="text-neutral-300">—</div>
                  ))}
                </div>

                {/* 3. Bedrooms */}
                <div className="grid grid-cols-4 gap-4 py-3.5 items-center">
                  <div className="font-bold text-neutral-600 flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-neutral-400" />
                    <span>Bedrooms</span>
                  </div>
                  {comparedProperties.map((p) => (
                    <div key={p.id} className="font-bold text-neutral-900 tabular-nums">
                      {p.bedrooms || '—'} {p.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparedProperties.length }).map((_, i) => (
                    <div key={i} className="text-neutral-300">—</div>
                  ))}
                </div>

                {/* 4. Bathrooms */}
                <div className="grid grid-cols-4 gap-4 py-3.5 items-center bg-neutral-50/50">
                  <div className="font-bold text-neutral-600 flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-neutral-400" />
                    <span>Bathrooms</span>
                  </div>
                  {comparedProperties.map((p) => (
                    <div key={p.id} className="font-bold text-neutral-900 tabular-nums">
                      {p.bathrooms || '—'} {p.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparedProperties.length }).map((_, i) => (
                    <div key={i} className="text-neutral-300">—</div>
                  ))}
                </div>

                {/* 5. Car Spaces */}
                <div className="grid grid-cols-4 gap-4 py-3.5 items-center">
                  <div className="font-bold text-neutral-600 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-neutral-400" />
                    <span>Car Spaces</span>
                  </div>
                  {comparedProperties.map((p) => (
                    <div key={p.id} className="font-bold text-neutral-900 tabular-nums">
                      {p.carSpaces || '0'} {p.carSpaces === 1 ? 'Space' : 'Spaces'}
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparedProperties.length }).map((_, i) => (
                    <div key={i} className="text-neutral-300">—</div>
                  ))}
                </div>

                {/* 6. Land / Building Size */}
                <div className="grid grid-cols-4 gap-4 py-3.5 items-center bg-neutral-50/50">
                  <div className="font-bold text-neutral-600 flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4 text-neutral-400" />
                    <span>Size / Area</span>
                  </div>
                  {comparedProperties.map((p) => (
                    <div key={p.id} className="font-bold text-neutral-900 tabular-nums">
                      {p.landSizeM2 ? `${p.landSizeM2}m² Land` : p.buildingSizeM2 ? `${p.buildingSizeM2}m² Internal` : '—'}
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparedProperties.length }).map((_, i) => (
                    <div key={i} className="text-neutral-300">—</div>
                  ))}
                </div>

                {/* Climate Comfort Metric */}
                <div className="grid grid-cols-4 gap-4 py-3.5 items-center bg-amber-50/40">
                  <div className="font-bold text-neutral-700 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Climate Comfort</span>
                  </div>
                  {comparedProperties.map((p) => (
                    <div key={p.id}>
                      <ClimateComfortBadge
                        suburb={p.suburb}
                        state={p.state}
                        variant="compact"
                      />
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparedProperties.length }).map((_, i) => (
                    <div key={i} className="text-neutral-300">—</div>
                  ))}
                </div>

                {/* 7. Next Open Inspection */}
                <div className="grid grid-cols-4 gap-4 py-3.5 items-center">
                  <div className="font-bold text-neutral-600 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <span>Next Inspection</span>
                  </div>
                  {comparedProperties.map((p) => (
                    <div key={p.id} className="text-neutral-800">
                      {p.inspections.length > 0 ? (
                        <div>
                          <div className="font-bold text-neutral-900">{p.inspections[0].date}</div>
                          <div className="text-[11px] text-neutral-500">{p.inspections[0].time}</div>
                        </div>
                      ) : (
                        <span className="text-neutral-400">By appointment</span>
                      )}
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparedProperties.length }).map((_, i) => (
                    <div key={i} className="text-neutral-300">—</div>
                  ))}
                </div>

                {/* 8. Listing Agent */}
                <div className="grid grid-cols-4 gap-4 py-3.5 items-center bg-neutral-50/50">
                  <div className="font-bold text-neutral-600">Listing Agent</div>
                  {comparedProperties.map((p) => {
                    const agent = getAgentById(p.agentId);
                    return (
                      <div key={p.id} className="flex items-center gap-2">
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-7 h-7 rounded-full object-cover border border-[#FFD200]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-neutral-900 truncate">{agent.name}</div>
                          <div className="text-[10px] text-neutral-500 truncate">{agent.office}</div>
                        </div>
                      </div>
                    );
                  })}
                  {Array.from({ length: 3 - comparedProperties.length }).map((_, i) => (
                    <div key={i} className="text-neutral-300">—</div>
                  ))}
                </div>

                {/* 9. Features Matrix */}
                <div className="pt-4 pb-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Features &amp; Inclusions Checklist
                  </div>
                </div>

                {ALL_FEATURES.map((feat) => (
                  <div key={feat} className="grid grid-cols-4 gap-4 py-2.5 items-center">
                    <div className="font-medium text-neutral-700">{feat}</div>
                    {comparedProperties.map((p) => {
                      const hasFeature = p.features.includes(feat);
                      return (
                        <div key={p.id}>
                          {hasFeature ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Yes</span>
                            </span>
                          ) : (
                            <span className="text-neutral-300">
                              <Minus className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {Array.from({ length: 3 - comparedProperties.length }).map((_, i) => (
                      <div key={i} className="text-neutral-300">—</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
