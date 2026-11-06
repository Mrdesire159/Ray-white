export interface AirbnbHost {
  name: string;
  avatar: string;
  isSuperhost: boolean;
  responseRate: string;
  responseTime: string;
  yearsHosting: number;
}

export interface AirbnbStay {
  id: string;
  title: string;
  tagline: string;
  destination: string;
  suburb: string;
  state: 'NSW' | 'VIC' | 'QLD' | 'WA' | 'TAS' | 'SA' | 'NT';
  regionCategory: 'Sydney & NSW Coast' | 'Byron & Gold Coast' | 'Tropical Queensland & Whitsundays' | 'Melbourne & Victoria' | 'Western Australia' | 'Tasmania' | 'South Australia Wine Country';
  propertyType: 'Entire Luxury Villa' | 'Oceanfront Beach House' | 'Harbour Penthouse' | 'Vineyard Estate' | 'Eco Rainforest Lodge' | 'Coastal Wilderness Cabin';
  pricePerNight: number; // in AUD
  originalPricePerNight?: number;
  cleaningFee: number;
  serviceFee: number;
  rating: number; // e.g. 4.98
  reviewCount: number;
  isGuestFavorite: boolean;
  isSuperhost: boolean;
  highlightBadge: string; // e.g. "Top 1% of homes", "Rare Beachfront Find", "Vineyard Oasis"
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
  distanceToAttraction: string;
  description: string;
  houseRules: string[];
  host: AirbnbHost;
  coordinates: {
    lat: number;
    lng: number;
    mapXPercent: number; // for SVG / visual Australia map rendering (0-100)
    mapYPercent: number; // for SVG / visual Australia map rendering (0-100)
  };
}

export interface AirbnbFilterState {
  destination: string;
  region: string;
  minPrice: number;
  maxPrice: number;
  guests: number;
  propertyType: string;
  onlySuperhost: boolean;
  onlyGuestFavorite: boolean;
  amenities: string[];
  sortBy: 'recommended' | 'price-asc' | 'price-desc' | 'rating-desc';
}
