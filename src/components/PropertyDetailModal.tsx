import React, { useState } from 'react';
import {
  X,
  Bed,
  Bath,
  Car,
  Maximize2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Check,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  CalendarCheck,
  Calculator,
  ShieldCheck,
  Sparkles,
  School,
  Train,
  Coffee,
  Scale,
  Camera,
  TrendingUp,
  Award,
  Film,
} from 'lucide-react';
import { Property, Agent } from '../types/property';
import { getAgentById } from '../data/agents';
import { LoanRepaymentCalculator } from './LoanRepaymentCalculator';
import { LoanComparisonTool } from './LoanComparisonTool';
import { ClimateComfortBadge } from './ClimateComfortBadge';
import { useRequests } from '../context/RequestContext';
import { usePrice } from '../context/PriceContext';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onTourInside?: (property: Property) => void;
  onOpenVideoStorage?: (propertyId?: string) => void;
  isSaved?: boolean;
  onToggleSave?: (propertyId: string) => void;
  isCompared?: boolean;
  onToggleCompare?: (propertyId: string) => void;
  onBookInspectionRequested?: (property: Property, inspectionTime?: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onTourInside,
  onOpenVideoStorage,
  isSaved = false,
  onToggleSave,
  isCompared = false,
  onToggleCompare,
}) => {
  const { addRequest } = useRequests();
  if (!property) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState(
    `Hi, I am interested in ${property.address}, ${property.suburb} and would like to arrange an inspection.`
  );
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [registeredInspection, setRegisteredInspection] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMortgageCalcModalOpen, setIsMortgageCalcModalOpen] = useState(false);
  const [loanViewMode, setLoanViewMode] = useState<'calculator' | 'compare'>('calculator');

  const { getSyncedProperty } = usePrice();
  const activeProp = getSyncedProperty(property);

  const isSale = activeProp.status === 'sale';
  const effectivePrice =
    activeProp.status === 'sale'
      ? activeProp.price
      : activeProp.sellingPrice || 1250000;

  const scrollToCalculator = () => {
    const el = document.getElementById('mortgage-calculator-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setIsMortgageCalcModalOpen(true);
    }
  };

  const agent: Agent = getAgentById(property.agentId);

  const images = property.images && property.images.length > 0 ? property.images : [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  ];

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim()) return;

    addRequest({
      type: 'contact',
      priority: 'high',
      client: {
        name: inquiryName,
        email: inquiryEmail,
        phone: inquiryPhone || '+61 400 123 456',
        preferredContact: 'phone',
      },
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: property.address,
      propertySuburb: property.suburb,
      propertyState: property.state,
      propertyPrice: property.priceDisplay,
      propertyImage: property.images[0],
      details: {
        propertyType: property.type,
        message: inquiryMessage,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        carSpaces: property.carSpaces,
        preferredOffice: agent.office,
      },
      assignedAgentId: property.agentId,
    });

    setInquirySubmitted(true);
  };

  const handleRegisterInspection = (formattedTime: string) => {
    setRegisteredInspection(formattedTime);

    addRequest({
      type: 'inspection',
      priority: 'urgent',
      client: {
        name: inquiryName || 'Prospective VIP Buyer',
        email: inquiryEmail || 'vip.buyer@residences.com.au',
        phone: inquiryPhone || '+61 412 889 000',
        preferredContact: 'phone',
      },
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: property.address,
      propertySuburb: property.suburb,
      propertyState: property.state,
      propertyPrice: property.priceDisplay,
      propertyImage: property.images[0],
      details: {
        requestedDate: formattedTime.split('•')[0]?.trim() || formattedTime,
        requestedTime: formattedTime.split('•')[1]?.trim() || '11:00 AM',
        inspectionType: 'private_vip',
        message: `Registered attendance for scheduled inspection: ${formattedTime}`,
        preferredOffice: agent.office,
      },
      assignedAgentId: property.agentId,
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/75 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Sticky Top Bar within Modal */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-neutral-200 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {property.suburb} · {property.type}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 truncate">
              {property.address}, {property.suburb}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onTourInside && (
              <button
                type="button"
                onClick={() => onTourInside(property)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 shadow-2xs"
                title="Tour Inside with 3D Rolling Camera"
              >
                <Camera className="w-4 h-4 text-neutral-950" />
                <span>Tour Inside</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMortgageCalcModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
              title="Open Loan Repayment Calculator"
            >
              <Calculator className="w-4 h-4 text-[#E5BC00]" />
              <span className="hidden sm:inline">Loan Calculator</span>
            </button>

            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(property.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isCompared
                    ? 'bg-[#FFD200] text-neutral-950 font-bold'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                }`}
                title={isCompared ? 'Remove from Compare' : 'Add to side-by-side comparison (max 3)'}
              >
                <Scale className="w-4 h-4" />
                <span>{isCompared ? 'Compared' : 'Compare'}</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer relative"
              title="Share listing"
            >
              <Share2 className="w-5 h-5" />
              {copiedLink && (
                <span className="absolute -bottom-7 right-0 text-[10px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>
            <button
              onClick={() => onToggleSave && onToggleSave(property.id)}
              className="p-2 rounded-lg text-neutral-600 hover:text-rose-600 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Save property"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'text-rose-500 fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* 1. Large Image Carousel */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-neutral-900 rounded-xl overflow-hidden group">
              <img
                src={images[activeImageIndex]}
                alt={`${property.title} - photo ${activeImageIndex + 1}`}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />

              {/* Status Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                {isSale ? (
                  <span className="px-3 py-1 text-xs font-bold rounded-md bg-emerald-600 text-white shadow-xs">
                    For Sale
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-bold rounded-md bg-blue-600 text-white shadow-xs">
                    For Rent
                  </span>
                )}
                {property.auctionDate && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-md bg-neutral-900/90 text-[#FFD200] backdrop-blur-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Auction</span>
                  </span>
                )}
              </div>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 right-4 bg-black/70 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-semibold">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                </>
              )}

              {/* Tour Inside & 4K Video floating buttons on image */}
              <div className="absolute bottom-3 left-4 flex flex-wrap items-center gap-2 z-10">
                {onTourInside && (
                  <button
                    type="button"
                    onClick={() => onTourInside(property)}
                    className="px-3.5 py-1.5 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-neutral-950" />
                    <span>Tour Inside</span>
                  </button>
                )}
                {onOpenVideoStorage && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenVideoStorage(property.id);
                    }}
                    className="px-3.5 py-1.5 bg-neutral-900/90 hover:bg-neutral-900 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-white/20 backdrop-blur-xs"
                  >
                    <Film className="w-3.5 h-3.5 text-[#FFD200]" />
                    <span>Watch 4K Video &amp; Drone</span>
                  </button>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 sm:w-24 aspect-[4/3] rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      idx === activeImageIndex
                        ? 'border-[#FFD200] ring-1 ring-[#FFD200]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Main Content Split: Left (Info, specs, map) & Right (Sticky Agent Sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Cols */}
            <div className="lg:col-span-8 space-y-8">
              {/* Price & Primary Headline */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tabular-nums">
                      {activeProp.priceDisplay}
                    </span>
                    {activeProp.priceReduced && activeProp.originalPriceDisplay && (
                      <span className="text-lg text-neutral-400 line-through font-bold tabular-nums">
                        {activeProp.originalPriceDisplay}
                      </span>
                    )}
                    {activeProp.priceReduced && activeProp.savingsAmount && activeProp.savingsAmount > 0 && (
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                        Price Reduced by ${activeProp.savingsAmount.toLocaleString()}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setLoanViewMode('calculator');
                        scrollToCalculator();
                      }}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-[#FFD200]/25 text-neutral-900 border border-amber-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-[#FFD200]"
                      title="Calculate monthly mortgage repayments for this property"
                    >
                      <Calculator className="w-3.5 h-3.5 text-neutral-900" />
                      <span>Estimate Mortgage</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoanViewMode('compare');
                        scrollToCalculator();
                      }}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-[#FFD200] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:ring-1 hover:ring-[#FFD200]"
                      title="Compare variable vs fixed loan products for this property"
                    >
                      <Scale className="w-3.5 h-3.5 text-[#FFD200]" />
                      <span>Compare Loans</span>
                    </button>
                  </div>
                  {property.bondAmount && (
                    <div className="text-sm font-semibold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-md">
                      Bond: ${property.bondAmount.toLocaleString()}
                    </div>
                  )}
                </div>

                <h1 className="mt-2 text-xl sm:text-2xl font-bold text-neutral-900">
                  {property.title}
                </h1>
                <p className="text-sm text-neutral-600 flex items-center gap-1.5 mt-1 font-medium">
                  <MapPin className="w-4 h-4 text-[#E5BC00]" />
                  <span>
                    {property.address}, {property.suburb} {property.state} {property.postcode}
                  </span>
                </p>
              </div>

              {/* Key Specs Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-lg text-neutral-700 shadow-2xs">
                    <Bed className="w-5 h-5 text-neutral-800" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 font-medium">Bedrooms</div>
                    <div className="text-base font-bold text-neutral-900 tabular-nums">
                      {property.bedrooms || '—'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-lg text-neutral-700 shadow-2xs">
                    <Bath className="w-5 h-5 text-neutral-800" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 font-medium">Bathrooms</div>
                    <div className="text-base font-bold text-neutral-900 tabular-nums">
                      {property.bathrooms || '—'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-lg text-neutral-700 shadow-2xs">
                    <Car className="w-5 h-5 text-neutral-800" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 font-medium">Car Parking</div>
                    <div className="text-base font-bold text-neutral-900 tabular-nums">
                      {property.carSpaces || '—'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-lg text-neutral-700 shadow-2xs">
                    <Maximize2 className="w-5 h-5 text-neutral-800" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 font-medium">
                      {property.landSizeM2 ? 'Land Area' : 'Internal Area'}
                    </div>
                    <div className="text-base font-bold text-neutral-900 tabular-nums">
                      {property.landSizeM2
                        ? `${property.landSizeM2}m²`
                        : property.buildingSizeM2
                        ? `${property.buildingSizeM2}m²`
                        : 'Contact'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Climate Comfort & Microclimate Analysis */}
              <ClimateComfortBadge
                suburb={property.suburb}
                state={property.state}
                variant="detailed"
              />

              {/* Inspection Times Section */}
              <div className="p-5 bg-neutral-900 text-white rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-[#FFD200]" />
                    <h3 className="font-bold text-base text-white">Upcoming Open Inspections</h3>
                  </div>
                  <span className="text-xs text-neutral-400">Ray White On-Site Host</span>
                </div>

                {property.inspections.length > 0 ? (
                  <div className="space-y-2.5 mt-3">
                    {property.inspections.map((insp, index) => {
                      const isRegistered = registeredInspection === insp.formattedDateTime;
                      return (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-neutral-800/90 rounded-lg border border-neutral-700"
                        >
                          <div>
                            <div className="font-bold text-sm text-white">{insp.date}</div>
                            <div className="text-xs text-[#FFD200] font-medium">{insp.time}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isRegistered ? (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-md text-xs font-bold">
                                <Check className="w-3.5 h-3.5" />
                                <span>You are registered</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRegisterInspection(insp.formattedDateTime)}
                                className="px-3.5 py-1.5 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-bold text-xs rounded-md transition-colors cursor-pointer"
                              >
                                Register for Inspection
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-300">
                    No open house scheduled. Please contact the listing agent to arrange a private viewing.
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Property Description</h3>
                <p className="text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Property Features Checklist */}
              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-3">Property Features</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {property.features.map((feat) => (
                    <div
                      key={feat}
                      className="flex items-center gap-2 text-xs font-semibold text-neutral-800 p-2.5 bg-neutral-50 rounded-lg border border-neutral-200"
                    >
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Map & Neighbourhood */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-neutral-900">Location &amp; Lifestyle</h3>
                  <span className="text-xs font-semibold text-neutral-500">Walk Score: 92/100</span>
                </div>

                {/* Styled Map Container */}
                <div className="relative h-64 w-full rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
                  {/* Stylized Map Canvas */}
                  <div className="absolute inset-0 bg-[#E8EAE6] flex items-center justify-center">
                    <div className="w-full h-full opacity-80 relative overflow-hidden bg-[radial-gradient(#c8d0c8_1px,transparent_1px)] [background-size:16px_16px]">
                      {/* Stylized road grid representation */}
                      <div className="absolute top-1/2 left-0 right-0 h-3 bg-white border-y border-neutral-300 transform -rotate-3" />
                      <div className="absolute left-1/3 top-0 bottom-0 w-3 bg-white border-x border-neutral-300 transform rotate-12" />
                      <div className="absolute left-2/3 top-0 bottom-0 w-2.5 bg-amber-100 border-x border-amber-300" />
                      
                      {/* Property Pin */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="bg-[#FFD200] border-2 border-neutral-950 p-2 rounded-full shadow-lg animate-bounce">
                          <MapPin className="w-5 h-5 text-neutral-950" />
                        </div>
                        <div className="mt-1 bg-neutral-950 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                          {property.address}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-700">
                    <div className="flex items-center gap-1.5">
                      <Train className="w-4 h-4 text-neutral-500" />
                      <span>550m to Train &amp; Metro</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <School className="w-4 h-4 text-neutral-500" />
                      <span>In Catchment for Top Grammar Schools</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Coffee className="w-4 h-4 text-neutral-500" />
                      <span>Village Cafes 200m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mortgage & Loan Repayment / Comparison Section - Directly integrated for listings */}
              <div id="mortgage-calculator-section" className="scroll-mt-6 pt-2">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                        Ray White Finance
                      </span>
                      <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                        {loanViewMode === 'calculator' ? (
                          <>
                            <Calculator className="w-5 h-5 text-neutral-900" />
                            <span>Loan Repayment Calculator</span>
                          </>
                        ) : (
                          <>
                            <Scale className="w-5 h-5 text-neutral-900" />
                            <span>Loan Comparison Tool (Variable vs Fixed)</span>
                          </>
                        )}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {loanViewMode === 'calculator'
                        ? `Calculate periodic repayments with interactive principal vs. interest amortization breakdown for ${property.address}.`
                        : `Compare monthly repayments, total lifetime interest, and feature differences across Variable and Fixed rate products.`}
                    </p>
                  </div>

                  {/* Toggle between Calculator & Comparison Tool */}
                  <div className="flex items-center p-1 bg-neutral-100 rounded-lg border border-neutral-200 shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setLoanViewMode('calculator')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        loanViewMode === 'calculator'
                          ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Repayment Calculator</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoanViewMode('compare')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        loanViewMode === 'compare'
                          ? 'bg-[#FFD200] text-neutral-950 shadow-xs font-black'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Compare Products</span>
                      <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full text-[9px] bg-neutral-900 text-[#FFD200]">
                        New
                      </span>
                    </button>
                  </div>
                </div>

                {loanViewMode === 'calculator' ? (
                  <LoanRepaymentCalculator
                    propertyPrice={effectivePrice}
                    propertyTitle={property.title}
                    propertyAddress={`${property.address}, ${property.suburb} ${property.state}`}
                    inline={true}
                  />
                ) : (
                  <LoanComparisonTool
                    propertyPrice={effectivePrice}
                    propertyAddress={`${property.address}, ${property.suburb} ${property.state}`}
                    inline={true}
                  />
                )}
              </div>
            </div>

            {/* Right 4 Cols: Sticky Agent Sidebar */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-5">
                {/* Agent Card Header */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-neutral-200">
                  <div className="relative shrink-0">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#FFD200]"
                      referrerPolicy="no-referrer"
                    />
                    {agent.isTopPerformer && (
                      <div
                        className="absolute -top-1 -right-1 bg-[#FFD200] text-neutral-950 p-1 rounded-full shadow border border-neutral-900"
                        title="Top Performer"
                      >
                        <Sparkles className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-neutral-900 text-base">{agent.name}</h4>
                      {agent.isTopPerformer && (
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded text-[9px] font-extrabold flex items-center gap-0.5">
                          <Award className="w-2.5 h-2.5 text-amber-600" />
                          <span>Top Performer</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 leading-snug">{agent.role}</p>
                    <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{agent.office}</p>
                    {agent.recentSalesCount && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span>{agent.recentSalesCount} recent sales ({agent.recentSalesVolume || 'Active'})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Agent Contact Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${agent.phone.replace(/[^0-9+]/g, '')}`}
                    className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-neutral-700" />
                    <span>Call Agent</span>
                  </a>
                  <a
                    href={`mailto:${agent.email}?subject=Inquiry on ${property.address}`}
                    className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-neutral-700" />
                    <span>Email Agent</span>
                  </a>
                </div>

                {/* Quick Mortgage Repayment Action */}
                <button
                  type="button"
                  onClick={scrollToCalculator}
                  className="w-full py-2.5 px-3 bg-amber-50 hover:bg-[#FFD200]/20 border border-amber-300/80 text-neutral-900 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <Calculator className="w-3.5 h-3.5 text-neutral-900" />
                  <span>Estimate Mortgage Payments</span>
                </button>

                {/* Contact / Inquiry Form */}
                <div className="pt-2">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-neutral-600 mb-3">
                    Enquire on this property
                  </h5>

                  {inquirySubmitted ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Enquiry Sent to {agent.name}!</span>
                      </div>
                      <p>
                        Thank you for your interest. {agent.name} will contact you shortly with full documentation and contract details.
                      </p>
                      <button
                        type="button"
                        onClick={() => setInquirySubmitted(false)}
                        className="text-emerald-700 underline font-semibold mt-1"
                      >
                        Send another note
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-3">
                      <div>
                        <input
                          type="text"
                          required
                          value={inquiryName}
                          onChange={(e) => setInquiryName(e.target.value)}
                          placeholder="Your Full Name *"
                          className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-lg px-3 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          required
                          value={inquiryEmail}
                          onChange={(e) => setInquiryEmail(e.target.value)}
                          placeholder="Email Address *"
                          className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-lg px-3 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          value={inquiryPhone}
                          onChange={(e) => setInquiryPhone(e.target.value)}
                          placeholder="Phone Number (e.g. 0412 345 678)"
                          className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-lg px-3 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                        />
                      </div>
                      <div>
                        <textarea
                          rows={3}
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200] resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 bg-[#FFD200] hover:bg-[#E5BC00] active:scale-[0.98] text-neutral-950 font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer"
                      >
                        Send Enquiry
                      </button>
                    </form>
                  )}
                </div>

                {/* Trust badge */}
                <div className="pt-3 border-t border-neutral-100 flex items-center gap-2 text-[11px] text-neutral-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Licensed Real Estate Agent · Ray White Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Dedicated Loan Repayment Calculator Modal when clicked from top header or price area */}
      {isMortgageCalcModalOpen && (
        <LoanRepaymentCalculator
          propertyPrice={effectivePrice}
          propertyTitle={property.title}
          propertyAddress={`${property.address}, ${property.suburb} ${property.state}`}
          isOpenModal={isMortgageCalcModalOpen}
          onCloseModal={() => setIsMortgageCalcModalOpen(false)}
        />
      )}
    </div>
  );
};
