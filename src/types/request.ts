export type RequestType = 'appraisal' | 'inspection' | 'offer' | 'contact' | 'valuation';

export type RequestStatus = 'pending' | 'approved' | 'declined' | 'completed';

export type RequestPriority = 'urgent' | 'high' | 'normal';

export interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  preferredContact?: 'email' | 'phone' | 'any';
}

export interface RequestDetails {
  // Appraisal / Valuation details
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  carSpaces?: number;
  appraisalMode?: 'digital' | 'in_person';
  estimatedValueRange?: {
    low: number;
    high: number;
    median: number;
  };
  
  // Inspection / Tour details
  requestedDate?: string;
  requestedTime?: string;
  attendeesCount?: number;
  inspectionType?: 'private_vip' | 'general_open' | 'virtual_tour';

  // Buyer Offer details
  offerAmount?: number;
  financeApproved?: boolean;
  settlementDays?: number;
  depositPercentage?: number;

  // Contact & Inquiries
  subject?: string;
  message?: string;
  preferredOffice?: string;
}

export interface RequestNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface AuditLogEntry {
  action: string;
  timestamp: string;
  actor: string;
  details?: string;
}

export interface AdminRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  priority: RequestPriority;
  createdAt: string;
  updatedAt: string;
  client: ClientInfo;

  // Associated property (if applicable)
  propertyId?: string;
  propertyTitle?: string;
  propertyAddress?: string;
  propertySuburb?: string;
  propertyState?: string;
  propertyPrice?: string;
  propertyImage?: string;

  details: RequestDetails;

  // Assignment
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAgentEmail?: string;
  assignedAgentAvatar?: string;

  // Approval / Rejection details
  approvalDetails?: {
    approvedAt: string;
    approvedBy: string;
    scheduledDateTime?: string;
    meetingLocation?: string;
    decisionNote?: string;
  };

  rejectionDetails?: {
    rejectedAt: string;
    rejectedBy: string;
    reason: string;
    rejectionNote?: string;
  };

  notes: RequestNote[];
  auditLog: AuditLogEntry[];
}
