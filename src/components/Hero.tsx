import React, { useState } from 'react';
import { Search, MapPin, Home as HomeIcon, DollarSign, Bed, ChevronDown } from 'lucide-react';
import { PropertyStatus, PropertyType } from '../types/property';
import { SUBURBS, PROPERTY_TYPES } from '../data/properties';

interface HeroProps {
  onSearch: (params: {
    status: PropertyStatus;
    location: string;
    propertyType: string;
    minPrice: number;
    maxPrice: number;
    bedrooms: string;
  }) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const [activeTab, setActiveTab] = useState<PropertyStatus>('sale');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('All Types');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [bedrooms, setBedrooms] = useState('all');

  const buyPriceOptions = [
    { label: 'Any Min', value: 0 },
    { label: '$750,000', value: 750000 },
    { label: '$1,000,000', value: 1000000 },
    { label: '$1,500,000', value: 1500000 },
    { label: '$2,000,000', value: 2000000 },
    { label: '$3,000,000', value: 3000000 },
    { label: '$4,000,000', value: 4000000 },
  ];

  const buyMaxPriceOptions = [
    { label: 'Any Max', value: 0 },
    { label: '$1,500,000', value: 1500000 },
    { label: '$2,500,000', value: 2500000 },
    { label: '$3,500,000', value: 3500000 },
    { label: '$5,000,000', value: 5000000 },
    { label: '$8,000,000+', value: 8000000 },
  ];

  const rentPriceOptions = [
    { label: 'Any Min', value: 0 },
    { label: '$600 / wk', value: 600 },
    { label: '$800 / wk', value: 800 },
    { label: '$1,000 / wk', value: 1000 },
    { label: '$1,500 / wk', value: 1500 },
    { label: '$2,000 / wk', value: 2000 },
  ];

  const rentMaxPriceOptions = [
    { label: 'Any Max', value: 0 },
    { label: '$1,000 / wk', value: 1000 },
    { label: '$1,500 / wk', value: 1500 },
    { label: '$2,500 / wk', value: 2500 },
    { label: '$3,500+ / wk', value: 3500 },
  ];

  const currentMinPrices = activeTab === 'sale' ? buyPriceOptions : rentPriceOptions;
  const currentMaxPrices = activeTab === 'sale' ? buyMaxPriceOptions : rentMaxPriceOptions;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      status: activeTab,
      location,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
    });
  };

  const handleQuickTag = (tagLocation: string) => {
    setLocation(tagLocation);
    onSearch({
      status: activeTab,
      location: tagLocation,
      propertyType: 'All Types',
      minPrice: 0,
      maxPrice: 0,
      bedrooms: 'all',
    });
  };

  return (
    <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center bg-neutral-900 text-white overflow-hidden">
      {/* High-Resolution Modern Architectural Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
          alt="Modern luxury architectural home"
          className="w-full h-full object-cover object-center filter brightness-[0.82]"
          referrerPolicy="no-referrer"
        />
        {/* Measured Scrim Gradient for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/40" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 w-full text-center">
        {/* Hero Kicker & Headlines */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-[#FFD200] mb-4 border border-white/15">
            <span>Australasia’s Premier Real Estate Network</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-balance leading-tight">
            Find your place with <span className="text-[#FFD200]">Ray White</span>
          </h1>
          <p className="mt-3.5 text-base sm:text-lg text-neutral-200 text-balance max-w-2xl mx-auto font-normal">
            Discover premier residences, curated luxury estates, and rental opportunities across Sydney and beyond.
          </p>
        </div>

        {/* Large Overlaying Search Box */}
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-4 sm:p-6 text-neutral-900 text-left border border-neutral-100">
          {/* Tab Selector: Buy vs. Rent */}
          <div className="flex items-center gap-2 mb-5 border-b border-neutral-200 pb-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('sale');
                setMinPrice(0);
                setMaxPrice(0);
              }}
              className={`px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'sale'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md ring-2 ring-emerald-400/30'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span>For Sale</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'sale' ? 'bg-white/25 text-white' : 'bg-neutral-200 text-neutral-600'}`}>14k+</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('rent');
                setMinPrice(0);
                setMaxPrice(0);
              }}
              className={`px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'rent'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-blue-400/30'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span>For Rent</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'rent' ? 'bg-white/25 text-white' : 'bg-neutral-200 text-neutral-600'}`}>5.8k+</span>
            </button>
            <span className="ml-auto hidden sm:block text-xs text-neutral-500 font-semibold">
              {activeTab === 'sale' ? '✦ Direct Australasia Settlements' : '✦ Verified Rental Yields'}
            </span>
          </div>

          {/* Form Fields: Location, Property Type, Min Price, Max Price, Bedrooms */}
          <form onSubmit={handleSearchSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              {/* Location Field */}
              <div className="lg:col-span-4">
                <label className="block text-xs font-semibold text-neutral-600 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E5BC00]" />
                  <span>Location or Suburb</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Point Piper, Surry Hills, Bondi"
                    className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-neutral-900 text-sm rounded-lg px-3.5 py-2.5 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#FFD200] transition-colors"
                  />
                  {location && (
                    <button
                      type="button"
                      onClick={() => setLocation('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Property Type */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-neutral-600 mb-1 flex items-center gap-1.5">
                  <HomeIcon className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Property Type</span>
                </label>
                <div className="relative">
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-neutral-900 text-sm rounded-lg px-3 py-2.5 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#FFD200] appearance-none cursor-pointer pr-8"
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Price Range (Min & Max) */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-neutral-600 mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Min Price</span>
                </label>
                <div className="relative">
                  <select
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-neutral-900 text-sm rounded-lg px-2.5 py-2.5 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#FFD200] appearance-none cursor-pointer pr-7"
                  >
                    {currentMinPrices.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  <span>Max Price</span>
                </label>
                <div className="relative">
                  <select
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-neutral-900 text-sm rounded-lg px-2.5 py-2.5 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#FFD200] appearance-none cursor-pointer pr-7"
                  >
                    {currentMaxPrices.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Bedrooms */}
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-neutral-600 mb-1 flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Beds</span>
                </label>
                <div className="relative">
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-neutral-900 text-sm rounded-lg px-2 py-2.5 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#FFD200] appearance-none cursor-pointer pr-6"
                  >
                    <option value="all">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5+">5+</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Search Button with Magnifying Glass in Ray White Yellow */}
              <div className="lg:col-span-1">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-[#FFD200] to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-[0.98] text-neutral-950 font-black rounded-xl transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer h-[44px]"
                  title="Search Properties"
                >
                  <Search className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
                  <span className="lg:hidden text-sm ml-1">Search</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick Suburb Shortcut Links */}
          <div className="mt-4 pt-3.5 border-t border-neutral-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-extrabold text-neutral-700 mr-1 flex items-center gap-1">
              <span>Popular:</span>
            </span>
            {[
              { name: 'Point Piper', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
              { name: 'Double Bay', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
              { name: 'Surry Hills', color: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200' },
              { name: 'Bondi Beach', color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200' },
              { name: 'Wahroonga', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200' },
              { name: 'Mosman', color: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200' },
            ].map((sub) => (
              <button
                key={sub.name}
                type="button"
                onClick={() => handleQuickTag(sub.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${sub.color}`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>

        {/* Quantified Trust Markers Strip */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-white/10 text-neutral-300 text-xs sm:text-sm">
          <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
            <div className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums">120+</div>
            <div className="text-neutral-300 text-xs font-semibold mt-0.5">Years of Heritage</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums">$65.8B</div>
            <div className="text-neutral-300 text-xs font-semibold mt-0.5">Annual Sales Volume</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
            <div className="text-xl sm:text-2xl font-black text-cyan-400 tabular-nums">1,000+</div>
            <div className="text-neutral-300 text-xs font-semibold mt-0.5">Offices Australasia</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
            <div className="text-xl sm:text-2xl font-black text-purple-400 tabular-nums">98.2%</div>
            <div className="text-neutral-300 text-xs font-semibold mt-0.5">Client Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};
