export type PropertyStatus = 'sale' | 'rent';

export type PropertyType = 'House' | 'Apartment' | 'Townhouse' | 'Land' | 'Penthouse' | 'Villa';

export interface InspectionTime {
  date: string;
  time: string;
  formattedDateTime: string;
}

export interface AgentRecentSale {
  address: string;
  suburb: string;
  price: string;
  soldDate: string;
  type: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  avatar: string;
  licenseNumber: string;
  soldCount: number;
  rating: number;
  office: string;
  bio: string;
  isTopPerformer?: boolean;
  topPerformerTitle?: string;
  recentSalesCount?: number;
  recentSalesVolume?: string;
  clearanceRate?: string;
  avgDaysOnMarket?: number;
  recentSales?: AgentRecentSale[];
}

export interface TourHotspot {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  title: string;
  description: string;
}

export interface TourRoom {
  id: string;
  name: string;
  subtitle?: string;
  image: string;
  dimensions?: string;
  architecturalNote: string;
  hotspots?: TourHotspot[];
}

export interface Property {
  id: string;
  title: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  status: PropertyStatus;
  type: PropertyType;
  price: number; // Primary display price
  priceDisplay: string; // e.g. "$1,850,000", "$950 / week", "Auction Sat 24 Oct", "Contact Agent"
  sellingPrice?: number; // Total purchase/selling valuation in AUD
  rentagePricePerWeek?: number; // Weekly rental tariff in AUD
  rentagePricePerMonth?: number; // Monthly rental tariff in AUD
  grossYield?: string; // Estimated gross rental yield e.g. "3.8%"
  originalPrice?: number;
  originalPriceDisplay?: string;
  priceReduced?: boolean;
  savingsAmount?: number;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  landSizeM2?: number;
  buildingSizeM2?: number;
  images: string[];
  featured: boolean;
  description: string;
  features: string[];
  inspections: InspectionTime[];
  agentId: string;
  auctionDate?: string;
  availableDate?: string; // For rent
  bondAmount?: number; // For rent
  isPetFriendly?: boolean; // For rent
  councilRatesPerQuarter?: number;
  strataPerQuarter?: number;
  yearBuilt?: number;
  coords: {
    lat: number;
    lng: number;
  };
  tourRooms?: TourRoom[];
}

export interface FilterState {
  status: PropertyStatus;
  location: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string; // 'all' | '1' | '2' | '3' | '4' | '5+'
  bathrooms: string; // 'all' | '1' | '2' | '3+'
  carSpaces: string; // 'all' | '1' | '2+'
  features: string[];
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'beds-desc' | 'newest';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  propertySuggestions?: Property[];
  actionType?: 'connect_agent' | 'book_inspection' | 'book_appraisal' | 'filter_results';
  actionData?: any;
}

export interface AppraisalFormData {
  propertyAddress: string;
  suburb: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  appraisalType: 'digital' | 'in_person';
  comments?: string;
}
