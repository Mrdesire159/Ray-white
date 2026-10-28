/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { PropertyCard } from './components/PropertyCard';
import { PropertyFilters } from './components/PropertyFilters';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { Chatbot } from './components/Chatbot';
import { AppraisalModal } from './components/AppraisalModal';
import { AgentDirectory } from './components/AgentDirectory';
import { ContactView } from './components/ContactView';
import { SellView } from './components/SellView';
import { SavedDrawer } from './components/SavedDrawer';
import { PropertyCompareModal } from './components/PropertyCompareModal';
import { CompareFloatingBar } from './components/CompareFloatingBar';
import { PriceListView } from './components/PriceListView';
import { BookDisplayView } from './components/BookDisplayView';
import { RollingBallDisplay } from './components/RollingBallDisplay';
import { VillaCinematicDisplay } from './components/3d/VillaCinematicDisplay';
import { HouseSlideView } from './components/HouseSlideView';
import { RollingCameraTourModal } from './components/RollingCameraTourModal';
import { MarketTrends } from './components/MarketTrends';
import { PropertyVideoStorage } from './components/PropertyVideoStorage';
import { RealtimePriceBar } from './components/RealtimePriceBar';
import { Footer } from './components/Footer';
import { AdminPortal } from './components/admin/AdminPortal';
import { AdminPasswordGate } from './components/admin/AdminPasswordGate';
import { AdminPasswordModal } from './components/admin/AdminPasswordModal';
import { PropertyMapClustered } from './components/PropertyMapClustered';
import { useTheme } from './context/ThemeContext';
import { useRequests } from './context/RequestContext';
import { usePrice } from './context/PriceContext';

import { Property, FilterState, PropertyStatus } from './types/property';
import { PROPERTIES, SUBURBS } from './data/properties';
import {
  ArrowRight,
  Sparkles,
  MapPin,
  CalendarCheck,
  TrendingUp,
  Award,
  ShieldCheck,
  LayoutGrid,
  Map as MapIcon,
  ChevronDown,
  TableProperties,
  BookOpen,
  Compass,
  Camera,
  MessageSquare,
  Film,
  Play
} from 'lucide-react';

const initialFilters: FilterState = {
  status: 'sale',
  location: '',
  propertyType: 'All Types',
  minPrice: 0,
  maxPrice: 0,
  bedrooms: 'all',
  bathrooms: 'all',
  carSpaces: 'all',
  features: [],
  sortBy: 'featured',
};

export default function App() {
  const { theme } = useTheme();
  const { isAdminAuthenticated } = useRequests();
  const { syncedProperties } = usePrice();
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<
    'home' | 'listings' | 'pricelist' | 'book' | 'rollingball' | 'trends' | 'videos' | 'sell' | 'agents' | 'contact' | 'admin' | 'villatour'
  >('home');
  const [heroMode, setHeroMode] = useState<'cinematic' | 'rollingball'>('cinematic');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [tourProperty, setTourProperty] = useState<Property | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAppraisalOpen, setIsAppraisalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rw_saved_properties');
      return saved ? JSON.parse(saved) : ['rw-sale-1', 'rw-rent-1'];
    } catch {
      return ['rw-sale-1', 'rw-rent-1'];
    }
  });

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareToast, setCompareToast] = useState<string | null>(null);
  const [comparedPropertyIds, setComparedPropertyIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rw_compared_properties');
      return saved ? JSON.parse(saved) : ['rw-sale-1', 'rw-sale-2'];
    } catch {
      return ['rw-sale-1', 'rw-sale-2'];
    }
  });

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Keep selectedProperty always in sync with real-time price reductions
  const activeSelectedProperty = useMemo(() => {
    if (!selectedProperty) return null;
    return syncedProperties.find((p) => p.id === selectedProperty.id) || selectedProperty;
  }, [selectedProperty, syncedProperties]);

  const activeTourProperty = useMemo(() => {
    if (!tourProperty) return null;
    return syncedProperties.find((p) => p.id === tourProperty.id) || tourProperty;
  }, [tourProperty, syncedProperties]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rw_saved_properties', JSON.stringify(savedPropertyIds));
    } catch {
      // Ignore in strict environments
    }
  }, [savedPropertyIds]);

  useEffect(() => {
    try {
      localStorage.setItem('rw_compared_properties', JSON.stringify(comparedPropertyIds));
    } catch {
      // Ignore
    }
  }, [comparedPropertyIds]);

  const toggleSaveProperty = (id: string) => {
    setSavedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleClearSaved = () => {
    setSavedPropertyIds([]);
  };

  const savedPropertiesList = useMemo(() => {
    return syncedProperties.filter((p) => savedPropertyIds.includes(p.id));
  }, [savedPropertyIds, syncedProperties]);

  const toggleCompareProperty = (id: string) => {
    if (comparedPropertyIds.includes(id)) {
      setComparedPropertyIds((prev) => prev.filter((pId) => pId !== id));
    } else {
      if (comparedPropertyIds.length >= 3) {
        setCompareToast('You can compare up to 3 properties at a time. Please remove one first.');
        setTimeout(() => setCompareToast(null), 3500);
        return;
      }
      setComparedPropertyIds((prev) => [...prev, id]);
    }
  };

  const handleRemoveCompare = (id: string) => {
    setComparedPropertyIds((prev) => prev.filter((pId) => pId !== id));
  };

  const handleAddCompare = (property: Property) => {
    if (comparedPropertyIds.length >= 3) {
      setCompareToast('You can compare up to 3 properties at a time. Please remove one first.');
      setTimeout(() => setCompareToast(null), 3500);
      return;
    }
    if (!comparedPropertyIds.includes(property.id)) {
      setComparedPropertyIds((prev) => [...prev, property.id]);
    }
  };

  const handleClearAllCompare = () => {
    setComparedPropertyIds([]);
  };

  const comparedPropertiesList = useMemo(() => {
    return syncedProperties.filter((p) => comparedPropertyIds.includes(p.id));
  }, [comparedPropertyIds, syncedProperties]);

  // Staff keyboard shortcut (Ctrl+Shift+A or Cmd+Shift+A) to open portal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (isAdminAuthenticated) {
          setCurrentView('admin');
        } else {
          setIsAdminPasswordModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminAuthenticated]);

  // Main navigation handler
  const handleNavigate = (view: string, tab?: PropertyStatus) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'buy') {
      setFilters((prev) => ({ ...prev, status: 'sale', minPrice: 0, maxPrice: 0 }));
      setCurrentView('listings');
    } else if (view === 'rent') {
      setFilters((prev) => ({ ...prev, status: 'rent', minPrice: 0, maxPrice: 0 }));
      setCurrentView('listings');
    } else if (view === 'admin') {
      if (!isAdminAuthenticated) {
        setIsAdminPasswordModalOpen(true);
        return;
      }
      setCurrentView('admin');
    } else if (
      view === 'home' ||
      view === 'villatour' ||
      view === 'pricelist' ||
      view === 'book' ||
      view === 'rollingball' ||
      view === 'trends' ||
      view === 'videos' ||
      view === 'sell' ||
      view === 'agents' ||
      view === 'contact'
    ) {
      setCurrentView(view as any);
    } else {
      setCurrentView('listings');
    }
  };


  const updateFilters = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const resetFilters = () => {
    setFilters((prev) => ({
      ...initialFilters,
      status: prev.status, // preserve active status tab
    }));
  };

  // Filtered & Sorted Properties List with Real-time Equal Reduced Pricing
  const filteredProperties = useMemo(() => {
    return syncedProperties.filter((item) => {
      // 1. Status: Sale vs Rent
      if (item.status !== filters.status) return false;

      // 2. Location (suburb or address match)
      if (filters.location.trim()) {
        const query = filters.location.trim().toLowerCase();
        const addressMatch = item.address.toLowerCase().includes(query);
        const suburbMatch = item.suburb.toLowerCase().includes(query);
        const stateMatch = item.state.toLowerCase().includes(query);
        if (!addressMatch && !suburbMatch && !stateMatch) return false;
      }

      // 3. Property Type
      if (filters.propertyType !== 'All Types' && item.type !== filters.propertyType) {
        return false;
      }

      // 4. Price range
      if (filters.minPrice > 0 && item.price < filters.minPrice) return false;
      if (filters.maxPrice > 0 && item.price > filters.maxPrice) return false;

      // 5. Bedrooms
      if (filters.bedrooms !== 'all') {
        const minBeds = parseInt(filters.bedrooms.replace('+', ''), 10);
        if (item.bedrooms < minBeds) return false;
      }

      // 6. Features
      if (filters.features.length > 0) {
        const hasAllFeatures = filters.features.every((f) => item.features.includes(f));
        if (!hasAllFeatures) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'beds-desc') return b.bedrooms - a.bedrooms;
      if (filters.sortBy === 'newest') return (b.yearBuilt || 2020) - (a.yearBuilt || 2020);
      // 'featured'
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.price - a.price;
    });
  }, [filters, syncedProperties]);

  // Featured lists for homepage showcases
  const featuredSales = useMemo(() => {
    return syncedProperties.filter((p) => p.status === 'sale').slice(0, 3);
  }, [syncedProperties]);

  const featuredRentals = useMemo(() => {
    return syncedProperties.filter((p) => p.status === 'rent').slice(0, 3);
  }, [syncedProperties]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#22252A]">
      {/* Real-time Price Reduction & Equality Control Bar */}
      <RealtimePriceBar />

      {/* Compare Limit Toast Notification */}
      {compareToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <span className="text-[#FFD200]">⚠️</span>
          <span>{compareToast}</span>
        </div>
      )}

      {/* 1. Global Navigation & Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAppraisal={() => setIsAppraisalOpen(true)}
        savedCount={savedPropertyIds.length}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        compareCount={comparedPropertyIds.length}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <div className="space-y-0">
            {/* 1. WEBSITE DISPLAY PAGE HERO: 3D Villa Flythrough & Showcase */}
            <section className="relative bg-neutral-950 text-white border-b border-white/10 overflow-hidden">
              {/* Display Hero Content */}
              {heroMode === 'cinematic' ? (
                <div>
                  <VillaCinematicDisplay
                    onOpenAppraisal={() => setIsAppraisalOpen(true)}
                    onOpenChat={() => setIsChatOpen(true)}
                    onExploreListings={() => handleNavigate('buy')}
                  />
                </div>
              ) : (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                  <RollingBallDisplay
                    hideHeader={true}
                    properties={syncedProperties}
                    onSelectProperty={(p) => setSelectedProperty(p)}
                    onTourInside={(p) => setTourProperty(p)}
                    onToggleCompare={toggleCompareProperty}
                    comparedIds={comparedPropertyIds}
                  />
                </div>
              )}
            </section>

            {/* 2. HOUSES ON A SLIDE VIEW: Horizontal Architectural Slider */}
            <HouseSlideView
              properties={syncedProperties}
              onSelectProperty={(p) => setSelectedProperty(p)}
              onTourInside={(p) => setTourProperty(p)}
              onToggleCompare={toggleCompareProperty}
              comparedIds={comparedPropertyIds}
              savedIds={savedPropertyIds}
              onToggleSave={toggleSaveProperty}
            />


            {/* 4. Market Trends & Econometric Data Visualization Tool */}
            <div id="market-trends">
              <MarketTrends
                onRequestValuation={() => setIsAppraisalOpen(true)}
                onSelectRegionListing={(stateStr) => {
                  setFilters((prev) => ({ ...prev, location: stateStr }));
                  setCurrentView('listings');
                }}
              />
            </div>



            {/* 4.5. Landed Property & House Video Storage Showcase */}
            <section className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white py-14 border-y border-neutral-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD200]/20 text-[#FFD200] text-xs font-black border border-[#FFD200]/40">
                      <Film className="w-3.5 h-3.5" />
                      <span>4K Cloud Video Vault &amp; Drone Surveys</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                      Landed Property &amp; House Video Storage
                    </h2>
                    <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                      Stream cinema-grade 4K drone flyovers of expansive country acreages, topographic boundary surveys, and architectural house walkthroughs. Upload, organize, and stream custom property videos directly from our high-speed cloud vault.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleNavigate('videos')}
                        className="px-5 py-3 bg-[#FFD200] hover:bg-[#E5BC00] active:scale-95 text-neutral-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Film className="w-4 h-4 fill-neutral-950" />
                        <span>Open Video Storage Vault</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('videos')}
                        className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl border border-neutral-700 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Compass className="w-4 h-4 text-[#FFD200]" />
                        <span>Watch 4K Landed Acreage Tours</span>
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-5 relative">
                    <div
                      onClick={() => handleNavigate('videos')}
                      className="group relative rounded-2xl overflow-hidden border border-neutral-700/80 shadow-2xl cursor-pointer bg-neutral-900 aspect-video flex items-center justify-center"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
                        alt="Landed Property Video Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold">
                          🌳 Landed Property
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#FFD200] text-neutral-950 text-[10px] font-black">
                          4K 60FPS
                        </span>
                      </div>
                      <div className="w-14 h-14 rounded-full bg-[#FFD200] text-neutral-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform z-10">
                        <Play className="w-6 h-6 fill-neutral-950 ml-0.5" />
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-left">
                        <div className="text-xs font-bold text-white drop-shadow truncate">
                          The Solar Country Estate • 2.2 Hectares
                        </div>
                        <div className="text-[10px] text-neutral-300 drop-shadow">
                          Bowral, NSW • Includes 4K Drone Boundary Cadastre
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Minimalist Advisory Callout Banner (Clean & Uncluttered) */}
            <section className="bg-neutral-900 py-12 text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FFD200]">
                      Ray White Advisory &amp; Virtual Walkthroughs
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                      Ready to tour a home or schedule a private valuation?
                    </h3>
                    <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-xl">
                      Explore houses through our rolling 3D camera view, calculate loan repayments, or speak with an accredited Ray White Principal in your area.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsChatOpen(true)}
                      className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer border border-neutral-700 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-[#FFD200]" />
                      <span>Chat with Concierge</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAppraisalOpen(true)}
                      className="px-5 py-2.5 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>Request Free Appraisal</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW: PROPERTY LISTINGS PAGE (THE "SALES PAGE") */}
        {currentView === 'listings' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Page Header Strip */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  {filters.status === 'sale' ? 'Residential Sales' : 'Residential Rentals'}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  {filters.status === 'sale' ? 'Properties For Sale' : 'Properties For Rent'}
                  {filters.location && (
                    <span className="text-neutral-500 font-normal text-xl sm:text-2xl ml-2">
                      in “{filters.location}”
                    </span>
                  )}
                </h1>
                <p className="text-xs text-neutral-600 mt-1">
                  Showing <span className="font-bold text-neutral-900">{filteredProperties.length}</span> verified listings
                </p>
              </div>

              {/* View Switch & Sort Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Sort dropdown */}
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-lg px-3 py-2">
                  <span>Sort:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      updateFilters({
                        sortBy: e.target.value as FilterState['sortBy'],
                      })
                    }
                    className="bg-transparent font-bold text-neutral-900 focus:outline-none cursor-pointer"
                  >
                    <option value="featured">Featured First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="beds-desc">Bedrooms: Most</option>
                    <option value="newest">Recently Built / Added</option>
                  </select>
                </div>

                {/* View Mode Toggle: Grid vs Map vs Price List vs Book vs 3D Ball */}
                <div className="flex items-center bg-neutral-200/70 p-1 rounded-lg gap-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white text-neutral-900 shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('map')}
                    className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      viewMode === 'map'
                        ? 'bg-white text-neutral-900 shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                    title="Map View"
                  >
                    <MapIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Map</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('pricelist')}
                    className="p-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-white rounded transition-colors cursor-pointer"
                    title="Price List (Rent & Sell)"
                  >
                    <TableProperties className="w-4 h-4 text-emerald-600" />
                    <span className="hidden md:inline">Price List</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('book')}
                    className="p-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-white rounded transition-colors cursor-pointer"
                    title="Book Monograph View"
                  >
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span className="hidden md:inline">Book</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('rollingball')}
                    className="p-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-white rounded transition-colors cursor-pointer"
                    title="3D Rolling Ball Display"
                  >
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span className="hidden md:inline">3D Ball</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Layout Grid: Left Sidebar Filter + Right Property Cards */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* 4. Filter Sidebar */}
              <div className="lg:col-span-3">
                <PropertyFilters
                  filters={filters}
                  onChange={updateFilters}
                  onReset={resetFilters}
                  totalResults={filteredProperties.length}
                />
              </div>

              {/* Property Listings Output Grid or Map View */}
              <div className="lg:col-span-9">
                {viewMode === 'map' ? (
                  /* Clustered interactive map view */
                  <PropertyMapClustered
                    properties={filteredProperties}
                    onSelectProperty={(p) => setSelectedProperty(p)}
                    onTourInside={(p) => setTourProperty(p)}
                    savedIds={savedPropertyIds}
                    onToggleSave={toggleSaveProperty}
                    comparedIds={comparedPropertyIds}
                    onToggleCompare={toggleCompareProperty}
                    currentStatus={filters.status}
                    onStatusChange={(status) => updateFilters({ status, minPrice: 0, maxPrice: 0 })}
                    saleCount={syncedProperties.filter((p) => p.status === 'sale').length}
                    rentCount={syncedProperties.filter((p) => p.status === 'rent').length}
                  />
                ) : filteredProperties.length === 0 ? (
                  <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center space-y-4">
                    <div className="text-4xl">🔍</div>
                    <h3 className="text-lg font-bold text-neutral-900">No properties matched your criteria</h3>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      Try expanding your price range, clearing selected features, or switching between Buy and Rent.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProperties.map((prop) => (
                      <PropertyCard
                        key={prop.id}
                        property={prop}
                        onSelect={(p) => setSelectedProperty(p)}
                        onTourInside={(p) => setTourProperty(p)}
                        isSaved={savedPropertyIds.includes(prop.id)}
                        onToggleSave={toggleSaveProperty}
                        isCompared={comparedPropertyIds.includes(prop.id)}
                        onToggleCompare={toggleCompareProperty}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PRICE LIST (BOTH RENTAGE & SELLING) */}
        {currentView === 'pricelist' && (
          <PriceListView
            properties={syncedProperties}
            onSelectProperty={(p) => setSelectedProperty(p)}
            onToggleCompare={toggleCompareProperty}
            comparedIds={comparedPropertyIds}
          />
        )}

        {/* VIEW: BOOK DISPLAY (HOUSE DISPLAYED LIKE BOOKS) */}
        {currentView === 'book' && (
          <BookDisplayView
            properties={syncedProperties}
            onSelectProperty={(p) => setSelectedProperty(p)}
            onToggleCompare={toggleCompareProperty}
            comparedIds={comparedPropertyIds}
          />
        )}

        {/* VIEW: 3D ROLLING BALL DISPLAY */}
        {currentView === 'rollingball' && (
          <RollingBallDisplay
            properties={syncedProperties}
            onSelectProperty={(p) => setSelectedProperty(p)}
            onTourInside={(p) => setTourProperty(p)}
            onToggleCompare={toggleCompareProperty}
            comparedIds={comparedPropertyIds}
          />
        )}

        {/* VIEW: REGIONAL MARKET TRENDS & YIELD ANALYTICS */}
        {currentView === 'trends' && (
          <div className="py-8">
            <MarketTrends
              onRequestValuation={() => setIsAppraisalOpen(true)}
              onSelectRegionListing={(stateStr) => {
                setFilters((prev) => ({ ...prev, location: stateStr }));
                setCurrentView('listings');
              }}
            />
          </div>
        )}

        {/* VIEW: DEDICATED VILLA 3D CINEMATIC TOUR */}
        {currentView === 'villatour' && (
          <div className="bg-neutral-950 text-white min-h-[calc(100vh-80px)]">
            {/* Top Villa Hero */}
            <div className="border-b border-white/10">
              <VillaCinematicDisplay
                onOpenAppraisal={() => setIsAppraisalOpen(true)}
                onOpenChat={() => setIsChatOpen(true)}
                onExploreListings={() => handleNavigate('buy')}
              />
            </div>

            {/* Architectural Profile & Monograph */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/40 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Signature Architectural Masterpiece</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                      The Horizon Pavilion Villa
                    </h2>
                    <p className="text-sm text-neutral-400 mt-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#FFD200]" />
                      <span>42 Marine Parade, Sorrento, VIC 3943 • Private Treaty</span>
                    </p>
                  </div>

                  <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                    Sculpted with minimalist geometry and pure architectural restraint, The Horizon Pavilion Villa commands a coveted ocean-facing vantage in exclusive Sorrento. Dual cantilevered white concrete frames envelop floor-to-ceiling panoramic glass panels, fusing sun-drenched timber decking with a sunken multi-tier swimming pool, waterfall retaining wall, and verdant private grounds.
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                    <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-neutral-400">Accommodations</span>
                      <p className="text-lg font-black text-white mt-1">5 Master Suites</p>
                      <p className="text-xs text-neutral-400">All with private travertine en-suites</p>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-neutral-400">Bathrooms</span>
                      <p className="text-lg font-black text-white mt-1">6 Bathrooms</p>
                      <p className="text-xs text-neutral-400">Custom tapware &amp; frameless glass</p>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-neutral-400">Pool &amp; Wellness</span>
                      <p className="text-lg font-black text-white mt-1">Dual-Tier Pool</p>
                      <p className="text-xs text-neutral-400">Lap pool + heated spa &amp; water wall</p>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-neutral-400">Vehicles</span>
                      <p className="text-lg font-black text-white mt-1">4-Car Garage</p>
                      <p className="text-xs text-neutral-400">Subterranean with EV fast chargers</p>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-neutral-400">Estate Grounds</span>
                      <p className="text-lg font-black text-white mt-1">740 m² Land</p>
                      <p className="text-xs text-neutral-400">Manicured coastal subtropical gardens</p>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-neutral-400">Outdoor Living</span>
                      <p className="text-lg font-black text-white mt-1">Teak Terraces</p>
                      <p className="text-xs text-neutral-400">Seamless indoor/outdoor flow</p>
                    </div>
                  </div>
                </div>

                {/* Right Inquiry Card */}
                <div className="lg:col-span-4">
                  <div className="bg-neutral-900 border border-white/15 rounded-2xl p-6 space-y-6 sticky top-28 shadow-2xl">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Price Guide</span>
                      <div className="text-3xl font-black text-white mt-1">$6,850,000 AUD</div>
                      <span className="text-xs text-neutral-400">Private inspection by appointment</span>
                    </div>

                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setIsAppraisalOpen(true)}
                        className="w-full py-3 bg-[#FFD200] hover:bg-[#e6bd00] text-neutral-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <CalendarCheck className="w-4 h-4" />
                        <span>Schedule Private Viewing</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChatOpen(true)}
                        className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl border border-neutral-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 text-amber-400" />
                        <span>Inquire with Prestige Agent</span>
                      </button>
                    </div>

                    <div className="pt-4 border-t border-white/10 text-xs text-neutral-400 space-y-2">
                      <p className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Ray White Accredited Prestige Listing</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Architectural Excellence Award 2025</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: VIDEO STORAGE VAULT FOR LANDED PROPERTY & HOUSES */}
        {currentView === 'videos' && (
          <PropertyVideoStorage
            onSelectProperty={(p) => setSelectedProperty(p)}
            onOpenAppraisal={() => setIsAppraisalOpen(true)}
          />
        )}

        {/* VIEW: SELL */}
        {currentView === 'sell' && (
          <SellView
            onOpenAppraisal={() => setIsAppraisalOpen(true)}
            onOpenAgents={() => handleNavigate('agents')}
          />
        )}

        {/* VIEW: AGENTS */}
        {currentView === 'agents' && (
          <AgentDirectory
            onSelectProperty={(p) => setSelectedProperty(p)}
            onOpenAppraisal={() => setIsAppraisalOpen(true)}
          />
        )}

        {/* VIEW: CONTACT */}
        {currentView === 'contact' && <ContactView />}

        {/* VIEW: ADMIN PORTAL (PROTECTED BY PASSCODE 000333999) */}
        {currentView === 'admin' && (
          isAdminAuthenticated ? (
            <AdminPortal
              onBackToSite={() => handleNavigate('home')}
              onNavigateToMediaUpload={() => handleNavigate('videos')}
              onNavigateToProperty={(propId) => {
                const prop = PROPERTIES.find((p) => p.id === propId);
                if (prop) {
                  setSelectedProperty(prop);
                }
              }}
            />
          ) : (
            <AdminPasswordGate
              onSuccess={() => setCurrentView('admin')}
              onBackToSite={() => handleNavigate('home')}
            />
          )
        )}
      </main>

      {/* Virtual Rolling Camera Walkthrough Modal */}
      <RollingCameraTourModal
        property={activeTourProperty}
        onClose={() => setTourProperty(null)}
        onOpenAppraisal={() => setIsAppraisalOpen(true)}
        onOpenAgentContact={(agentId) => handleNavigate('agents')}
      />

      {/* 5. Property Detail Modal / View */}
      <PropertyDetailModal
        property={activeSelectedProperty}
        onClose={() => setSelectedProperty(null)}
        onTourInside={(p) => setTourProperty(p)}
        onOpenVideoStorage={() => handleNavigate('videos')}
        isSaved={activeSelectedProperty ? savedPropertyIds.includes(activeSelectedProperty.id) : false}
        onToggleSave={toggleSaveProperty}
        isCompared={activeSelectedProperty ? comparedPropertyIds.includes(activeSelectedProperty.id) : false}
        onToggleCompare={toggleCompareProperty}
      />

      {/* Book Appraisal Modal */}
      <AppraisalModal
        isOpen={isAppraisalOpen}
        onClose={() => setIsAppraisalOpen(false)}
      />

      {/* Saved Properties Drawer */}
      <SavedDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedProperties={savedPropertiesList}
        onRemove={toggleSaveProperty}
        onSelectProperty={(p) => setSelectedProperty(p)}
        onClearAll={handleClearSaved}
        comparedIds={comparedPropertyIds}
        onToggleCompare={toggleCompareProperty}
        onOpenCompare={() => setIsCompareModalOpen(true)}
      />

      {/* Side-by-Side Property Comparison Modal */}
      <PropertyCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        comparedProperties={comparedPropertiesList}
        onRemoveProperty={handleRemoveCompare}
        onAddProperty={handleAddCompare}
        onSelectProperty={(p) => setSelectedProperty(p)}
        onClearAll={handleClearAllCompare}
      />

      {/* Floating Compare Bar */}
      <CompareFloatingBar
        comparedProperties={comparedPropertiesList}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
        onRemoveProperty={handleRemoveCompare}
        onClearAll={handleClearAllCompare}
      />

      {/* 3. Interactive Chatbot Agent ("Ray White Concierge") */}
      <Chatbot
        onSelectProperty={(prop) => setSelectedProperty(prop)}
        onTourInside={(prop) => setTourProperty(prop)}
        onOpenAppraisal={() => setIsAppraisalOpen(true)}
        onOpenAgentDirectory={() => handleNavigate('agents')}
        isOpenExternal={isChatOpen}
        onCloseExternal={() => setIsChatOpen(false)}
      />

      {/* Admin Passcode Modal (Password: 000333999) */}
      <AdminPasswordModal
        isOpen={isAdminPasswordModalOpen}
        onClose={() => setIsAdminPasswordModalOpen(false)}
        onSuccess={() => {
          setIsAdminPasswordModalOpen(false);
          setCurrentView('admin');
        }}
      />

      {/* Footer (hidden in dedicated Admin Portal view) */}
      {currentView !== 'admin' && (
        <Footer
          onNavigate={handleNavigate}
          onOpenAppraisal={() => setIsAppraisalOpen(true)}
        />
      )}
    </div>
  );
}
