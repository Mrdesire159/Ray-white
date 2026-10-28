import React from 'react';
import { FilterState, PropertyStatus } from '../types/property';
import { PROPERTY_TYPES, ALL_FEATURES } from '../data/properties';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';

interface PropertyFiltersProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  totalResults: number;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalResults,
}) => {
  const isSale = filters.status === 'sale';

  const salePrices = [
    { label: 'Any', value: 0 },
    { label: '$1,000,000', value: 1000000 },
    { label: '$2,000,000', value: 2000000 },
    { label: '$3,000,000', value: 3000000 },
    { label: '$4,000,000', value: 4000000 },
    { label: '$5,000,000+', value: 5000000 },
  ];

  const rentPrices = [
    { label: 'Any', value: 0 },
    { label: '$700 / wk', value: 700 },
    { label: '$1,000 / wk', value: 1000 },
    { label: '$1,500 / wk', value: 1500 },
    { label: '$2,000 / wk', value: 2000 },
    { label: '$3,000+ / wk', value: 3000 },
  ];

  const currentPrices = isSale ? salePrices : rentPrices;

  const toggleFeature = (feature: string) => {
    const exists = filters.features.includes(feature);
    const newFeatures = exists
      ? filters.features.filter((f) => f !== feature)
      : [...filters.features, feature];
    onChange({ features: newFeatures });
  };

  return (
    <aside className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs sticky top-24 space-y-6">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <div className="flex items-center gap-2 font-bold text-neutral-900 text-sm">
          <SlidersHorizontal className="w-4 h-4 text-[#E5BC00]" />
          <span>Filter Properties</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors cursor-pointer"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Status: For Sale vs For Rent */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
          Listing Status
        </label>
        <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onChange({ status: 'sale', minPrice: 0, maxPrice: 0 })}
            className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
              isSale
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            For Sale
          </button>
          <button
            type="button"
            onClick={() => onChange({ status: 'rent', minPrice: 0, maxPrice: 0 })}
            className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
              !isSale
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            For Rent
          </button>
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
          Property Type
        </label>
        <div className="space-y-1.5">
          {PROPERTY_TYPES.map((type) => {
            const isChecked = filters.propertyType === type;
            return (
              <label
                key={type}
                className="flex items-center gap-2 text-xs text-neutral-700 hover:text-neutral-950 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="propertyType"
                  value={type}
                  checked={isChecked}
                  onChange={() => onChange({ propertyType: type })}
                  className="rounded-full text-[#FFD200] focus:ring-[#FFD200] border-neutral-300 w-3.5 h-3.5"
                />
                <span className={isChecked ? 'font-semibold text-neutral-900' : ''}>
                  {type}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
          {isSale ? 'Max Purchase Price' : 'Max Weekly Rent'}
        </label>
        <select
          value={filters.maxPrice}
          onChange={(e) => onChange({ maxPrice: Number(e.target.value) })}
          className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
        >
          <option value={0}>Any Price</option>
          {currentPrices.map((p) => (
            <option key={p.value} value={p.value}>
              Up to {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
          Bedrooms
        </label>
        <div className="grid grid-cols-5 gap-1">
          {['all', '1', '2', '3', '4+'].map((bed) => {
            const isSelected = filters.bedrooms === bed;
            return (
              <button
                key={bed}
                type="button"
                onClick={() => onChange({ bedrooms: bed })}
                className={`py-1.5 text-xs font-semibold rounded-md border text-center transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {bed === 'all' ? 'Any' : bed}
              </button>
            );
          })}
        </div>
      </div>

      {/* Features Checklist */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
          Features &amp; Amenities
        </label>
        <div className="space-y-2">
          {ALL_FEATURES.map((feature) => {
            const isChecked = filters.features.includes(feature);
            return (
              <label
                key={feature}
                className="flex items-center gap-2.5 text-xs text-neutral-700 hover:text-neutral-950 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleFeature(feature)}
                  className="rounded text-neutral-900 focus:ring-[#FFD200] border-neutral-300 w-3.5 h-3.5"
                />
                <span className={isChecked ? 'font-semibold text-neutral-950' : ''}>
                  {feature}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Active Results Summary */}
      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
        <span>Matching Listings:</span>
        <span className="font-bold text-neutral-900 tabular-nums">{totalResults}</span>
      </div>
    </aside>
  );
};
