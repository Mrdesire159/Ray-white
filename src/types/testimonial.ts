export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';

export type ClientType = 'buyer' | 'vendor' | 'airbnb' | 'landlord' | 'investor';

export interface Testimonial {
  id: string;
  clientName: string;
  clientRole?: string;
  avatar: string;
  suburb: string;
  city: string;
  state: AustralianState;
  propertyType: string;
  propertyAddress?: string;
  clientType: ClientType;
  rating: number; // 1-5
  date: string;
  headline: string;
  story: string;
  agentId?: string;
  agentName?: string;
  verified: boolean;
  featured?: boolean;
  tags: string[];
}
