export type PropertyVideoCategory = 'landed' | 'house' | 'acreage' | 'villa' | 'drone';

export interface PropertyVideo {
  id: string;
  title: string;
  category: PropertyVideoCategory;
  categoryLabel: string;
  propertyAddress: string;
  suburb: string;
  state: string;
  propertyPrice?: string;
  landSize?: string;
  buildingSize?: string;
  bedrooms?: number;
  bathrooms?: number;
  carSpaces?: number;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  resolution: string;
  droneAerial: boolean;
  boundarySurveyOverlay?: boolean;
  description: string;
  dateAdded: string;
  fileSizeBytes: number;
  agentName?: string;
  agentPhone?: string;
  propertyId?: string;
  isUserUploaded?: boolean;
  mediaType?: 'video' | 'photo';
  photoUrl?: string;
  uploadedByAdmin?: boolean;
  adminTitle?: string;
  cloudStorageProvider?: string;
  cloudBucket?: string;
  cloudKey?: string;
  cloudEtag?: string;
  cloudCdnUrl?: string;
}

