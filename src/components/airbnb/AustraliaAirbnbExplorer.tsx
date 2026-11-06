import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Heart,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  CalendarCheck,
  ShieldCheck,
  Award
} from 'lucide-react';
import { AIRBNB_STAYS, AUSTRALIA_REGIONS } from '../../data/airbnbStays';
import { AirbnbStay } from '../../types/airbnb';
import { AustraliaMapPricePins } from './AustraliaMapPricePins';
import { AirbnbStayModal } from './AirbnbStayModal';

interface AustraliaAirbnbExplorerProps {
  onOpenInbox?: () => void;
}

export const AustraliaAirbnbExplorer: React.FC<AustraliaAirbnbExplorerProps> = ({ onOpenInbox }) => {
  const [selectedStay, setSelectedStay] = useState<AirbnbStay | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(1500);
  const [minGuests, setMinGuests] = useState<number>(1);
  const [onlySuperhost, setOnlySuperhost] = useState<boolean>(false);
  const [onlyGuestFavorite, setOnlyGuestFavorite] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating-desc'>('recommended');

  const [savedStayIds, setSavedStayIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rw_saved_airbnb_stays');
      return saved ? JSON.parse(saved) : ['ab-syd-1', 'ab-byron-1'];
    } catch {
      return ['ab-syd-1', 'ab-byron-1'];
    }
  });

  const toggleSaveStay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedStayIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id];
      try {
        localStorage.setItem('rw_saved_airbnb_stays', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Filtered & Sorted Stays
  const filteredStays = useMemo(() => {
    return AIRBNB_STAYS.filter((stay) => {
      // Region
      if (activeRegion !== 'all' && stay.regionCategory !== activeRegion) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = stay.title.toLowerCase().includes(q);
        const matchDest = stay.destination.toLowerCase().includes(q);
        const matchSuburb = stay.suburb.toLowerCase().includes(q);
        const matchState = stay.state.toLowerCase().includes(q);
        if (!matchTitle && !matchDest && !matchSuburb && !matchState) return false;
      }

      // Price Filter
      if (stay.pricePerNight > maxPriceFilter) return false;

      // Guests
      if (stay.guests < minGuests) return false;

      // Superhost
      if (onlySuperhost && !stay.isSuperhost) return false;

      // Guest favorite
      if (onlyGuestFavorite && !stay.isGuestFavorite) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.pricePerNight - b.pricePerNight;
      if (sortBy === 'price-desc') return b.pricePerNight - a.pricePerNight;
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      return 0; // recommended
    });
  }, [activeRegion, searchQuery, maxPriceFilter, minGuests, onlySuperhost, onlyGuestFavorite, sortBy]);

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#22252A] pb-16">
      {/* 1. Header Banner */}
      <section className="bg-neutral-950 text-white pt-8 pb-10 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD200]/15 text-[#FFD200] text-xs font-black border border-[#FFD200]/30 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ray White Holiday Escapes • Australia-Wide</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                Australian Airbnb Collection
              </h1>
              <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mt-1 leading-relaxed">
                Handpicked luxury villas, beachfront retreats, and vineyard homesteads across Australia's most sought-after destinations, tagged with verified nightly rates.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl shrink-0">
              <div className="text-center px-2">
                <span className="block text-xl font-black text-[#FFD200] font-mono">{AIRBNB_STAYS.length}</span>
                <span className="text-[10px] text-neutral-400 uppercase font-bold">Stays</span>
              </div>
              <div className="w-px h-8 bg-neutral-800" />
              <div className="text-center px-2">
                <span className="block text-xl font-black text-emerald-400 font-mono">4.97★</span>
                <span className="text-[10px] text-neutral-400 uppercase font-bold">Avg Rating</span>
              </div>
              <div className="w-px h-8 bg-neutral-800" />
              <div className="text-center px-2">
                <span className="block text-xl font-black text-blue-400 font-mono">6 States</span>
                <span className="text-[10px] text-neutral-400 uppercase font-bold">Covered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Australia Map with Live Price Tags */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <AustraliaMapPricePins
          stays={AIRBNB_STAYS}
          selectedStayId={selectedStay?.id}
          onSelectStay={(stay) => setSelectedStay(stay)}
          onFilterRegion={(reg) => setActiveRegion(reg)}
          activeRegion={activeRegion}
        />
      </section>

      {/* 3. Filter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-sm space-y-4">
          {/* Top row: Search input + Region Selector */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by destination (e.g. Bondi, Byron, Noosa, Margaret River)..."
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Region Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {AUSTRALIA_REGIONS.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => setActiveRegion(reg.id)}
                  className={`px-3 py-2 rounded-xl font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                    activeRegion === reg.id
                      ? 'bg-neutral-950 text-[#FFD200] border-neutral-900 shadow-md font-black'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                  }`}
                >
                  <span>{reg.icon}</span>
                  <span>{reg.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom row: Filters for Price slider, Guests, Superhost & Sorting */}
          <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-neutral-700">
            {/* Price Slider */}
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 font-bold shrink-0">Max Price:</span>
              <input
                type="range"
                min={300}
                max={1500}
                step={50}
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(parseInt(e.target.value, 10))}
                className="accent-neutral-900 w-32 cursor-pointer"
              />
              <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-md">
                ${maxPriceFilter} AUD / nt
              </span>
            </div>

            {/* Guests */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-bold">Guests:</span>
              {[1, 2, 4, 6, 8].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMinGuests(num)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                    minGuests === num
                      ? 'bg-[#FFD200] text-neutral-950 border-[#FFD200] font-black'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                  }`}
                >
                  {num === 1 ? 'Any' : `${num}+`}
                </button>
              ))}
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlySuperhost}
                  onChange={(e) => setOnlySuperhost(e.target.checked)}
                  className="rounded text-neutral-900 focus:ring-[#FFD200] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-neutral-800">Superhost Only</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyGuestFavorite}
                  onChange={(e) => setOnlyGuestFavorite(e.target.checked)}
                  className="rounded text-neutral-900 focus:ring-[#FFD200] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-neutral-800">Guest Favorites</span>
              </label>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-neutral-500 text-xs">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-neutral-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="recommended">Featured Stays</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated (★)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Listings Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <p className="text-xs text-neutral-600 font-medium">
            Showing <strong className="text-neutral-900">{filteredStays.length}</strong> Australian holiday properties
          </p>
          {activeRegion !== 'all' && (
            <button
              onClick={() => setActiveRegion('all')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Reset to All Australia
            </button>
          )}
        </div>

        {filteredStays.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-3 mt-6">
            <Compass className="w-12 h-12 text-neutral-300 mx-auto" />
            <h3 className="text-base font-bold text-neutral-800">No stays matched your criteria</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Try adjusting your max price slider, lowering guest counts, or selecting "All Popular Regions".
            </p>
            <button
              onClick={() => {
                setActiveRegion('all');
                setMaxPriceFilter(1500);
                setMinGuests(1);
                setSearchQuery('');
                setOnlySuperhost(false);
                setOnlyGuestFavorite(false);
              }}
              className="px-4 py-2 bg-neutral-900 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredStays.map((stay) => {
              const isSaved = savedStayIds.includes(stay.id);

              return (
                <div
                  key={stay.id}
                  onClick={() => setSelectedStay(stay)}
                  className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/90 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                    <img
                      src={stay.images[0]}
                      alt={stay.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                    {/* Top Badges: Region + Favorite Button */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-neutral-950/80 backdrop-blur-md text-white border border-white/20">
                        {stay.suburb}, {stay.state}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => toggleSaveStay(stay.id, e)}
                        className="p-2 rounded-full bg-neutral-950/60 hover:bg-neutral-950/90 text-white backdrop-blur-md transition-all cursor-pointer shadow-md"
                        aria-label="Save stay"
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                      </button>
                    </div>

                    {/* Bottom Badges: Price Tag Pill + Highlight Badge */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                      <div className="px-3 py-1.5 rounded-xl bg-[#FFD200] text-neutral-950 font-black text-xs shadow-lg flex items-center gap-1">
                        <span className="font-mono text-sm">${stay.pricePerNight}</span>
                        <span className="text-[10px] font-bold">AUD / nt</span>
                      </div>

                      <div className="flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg text-white text-[11px] font-bold">
                        <Star className="w-3.5 h-3.5 fill-[#FFD200] text-[#FFD200]" />
                        <span>{stay.rating}</span>
                        <span className="text-neutral-400 text-[10px]">({stay.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        <span>{stay.propertyType}</span>
                        {stay.isSuperhost && (
                          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Superhost
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-sm sm:text-base text-neutral-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {stay.title}
                      </h3>

                      <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                        {stay.tagline}
                      </p>
                    </div>

                    {/* Location Landmark & Distance */}
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{stay.distanceToAttraction}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-neutral-500 shrink-0">
                        {stay.guests} guests • {stay.bedrooms} beds
                      </div>
                    </div>

                    {/* Card Action Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedStay(stay)}
                      className="w-full py-2 bg-neutral-900 group-hover:bg-[#FFD200] group-hover:text-neutral-950 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>View Dates &amp; Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Stay Details & Reservation Modal */}
      <AirbnbStayModal
        stay={selectedStay}
        onClose={() => setSelectedStay(null)}
        onOpenInbox={onOpenInbox}
      />
    </div>
  );
};
