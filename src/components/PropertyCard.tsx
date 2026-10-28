import React, { useState } from 'react';
import { Bed, Bath, Car, Maximize2, Heart, Calendar, ChevronLeft, ChevronRight, Eye, Scale, Check, Camera, Sparkles } from 'lucide-react';
import { Property } from '../types/property';
import { ClimateComfortBadge } from './ClimateComfortBadge';

interface MetricTooltipProps {
  title: string;
  subtitle: string;
  description: string;
  highlight?: string;
  icon: React.ReactNode;
  position?: 'left' | 'center' | 'right';
}

const MetricTooltip: React.FC<MetricTooltipProps> = ({
  title,
  subtitle,
  description,
  highlight,
  icon,
  position = 'center',
}) => {
  const positionClasses = {
    left: 'left-0 sm:left-1/2 sm:-translate-x-1/4',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0 sm:right-auto sm:left-1/2 sm:-translate-x-3/4',
  }[position];

  const arrowClasses = {
    left: 'left-5 sm:left-1/4',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-5 sm:left-3/4 sm:-translate-x-1/2',
  }[position];

  return (
    <div
      role="tooltip"
      className={`absolute bottom-full mb-2.5 ${positionClasses} w-64 p-3 bg-neutral-900/95 text-white rounded-xl shadow-2xl border border-neutral-700/80 backdrop-blur-md opacity-0 invisible group-hover/metric:opacity-100 group-hover/metric:visible -translate-y-1 group-hover/metric:translate-y-0 transition-all duration-200 z-30 pointer-events-none text-left`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 pb-1.5 mb-1.5 border-b border-neutral-800">
        <div className="p-1 rounded-lg bg-neutral-800 text-amber-400 shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-black tracking-tight text-white flex items-center gap-1.5 truncate">
            {title}
          </div>
          <div className="text-[10px] text-neutral-400 font-medium truncate">
            {subtitle}
          </div>
        </div>
      </div>

      {/* Contextual Description */}
      <p className="text-[11px] leading-relaxed text-neutral-300 font-normal">
        {description}
      </p>

      {/* Listing Specific Highlight Pill */}
      {highlight && (
        <div className="mt-2 pt-1.5 border-t border-neutral-800/80 flex items-center gap-1 text-[10px] font-semibold text-amber-300">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate">{highlight}</span>
        </div>
      )}

      {/* Arrow Caret */}
      <div
        className={`absolute top-full ${arrowClasses} w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-neutral-900/95`}
      />
    </div>
  );
};

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onTourInside?: (property: Property) => void;
  isSaved?: boolean;
  onToggleSave?: (propertyId: string) => void;
  isCompared?: boolean;
  onToggleCompare?: (propertyId: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  onTourInside,
  isSaved = false,
  onToggleSave,
  isCompared = false,
  onToggleCompare,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'];

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(property.id);
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCompare) {
      onToggleCompare(property.id);
    }
  };

  const isSale = property.status === 'sale';

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'penthouse':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'house':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'apartment':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'villa':
      case 'townhouse':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Contextual explanations for property card metrics
  const bedroomInfo = (() => {
    const beds = property.bedrooms;
    let description = '';
    if (beds === 1) {
      description = `1 dedicated bedroom suite with built-in storage. Ideal for singles, executive professionals, or high-yield investment in this ${property.type}.`;
    } else if (beds === 2) {
      description = `2 private bedrooms. Perfect for dual occupancy, accommodating guests, or a dedicated executive home office / creative studio.`;
    } else if (beds === 3) {
      description = `3 spacious bedrooms with wardrobe storage. Well-proportioned for family living, children's rooms, and private master quarters.`;
    } else if (beds === 4) {
      description = `4 expansive bedrooms including master retreat. Optimal for growing families seeking distinct, peaceful sleeping quarters.`;
    } else {
      description = `${beds} luxury bedrooms. Multi-generational living scale with dedicated master quarters and executive guest accommodations.`;
    }

    const featureHighlights = property.features.filter((f) =>
      /bed|robe|wardrobe|master|suite|ensuite|balcony/i.test(f)
    );

    return {
      title: `${beds} ${beds === 1 ? 'Bedroom' : 'Bedrooms'}`,
      subtitle: `${property.type} Sleeping Quarters`,
      description,
      highlight: featureHighlights.length > 0
        ? featureHighlights.slice(0, 2).join(' • ')
        : `${property.type} • Up to ${beds * 2} residents`,
    };
  })();

  const bathroomInfo = (() => {
    const baths = property.bathrooms;
    let description = '';
    if (baths === 1) {
      description = `1 full central bathroom with premium vanity basin, enclosed shower, and integrated toilet facilities.`;
    } else if (baths === 2) {
      description = `2 complete bathrooms, featuring a private master ensuite plus a separate main family bathroom with shower/tub.`;
    } else {
      description = `${baths} designer bathrooms. Eliminates morning wait times with multiple private ensuites, family bath, and guest powder rooms.`;
    }

    const featureHighlights = property.features.filter((f) =>
      /bath|ensuite|spa|powder|vanity/i.test(f)
    );

    return {
      title: `${baths} ${baths === 1 ? 'Bathroom' : 'Bathrooms'}`,
      subtitle: 'Washroom & Sanitary Amenities',
      description,
      highlight: featureHighlights.length > 0
        ? featureHighlights.slice(0, 2).join(' • ')
        : (baths > 1 ? 'Includes master ensuite' : 'Central full family bathroom'),
    };
  })();

  const carSpaceInfo = (() => {
    const cars = property.carSpaces;
    let description = '';
    if (cars === 1) {
      description = `1 secure vehicle accommodation. Single dedicated lock-up garage or allocated undercover basement parking bay.`;
    } else if (cars === 2) {
      description = `2 secure vehicle spaces. Double lock-up garage or reserved side-by-side undercover parking with internal residence access.`;
    } else {
      description = `${cars} vehicle parking bays. Generous multi-vehicle capacity across garage, carport, and private driveway bays.`;
    }

    const featureHighlights = property.features.filter((f) =>
      /garage|car|parking|carport|ev/i.test(f)
    );

    return {
      title: `${cars} ${cars === 1 ? 'Car Space' : 'Car Spaces'}`,
      subtitle: 'Vehicle Parking & Storage',
      description,
      highlight: featureHighlights.length > 0
        ? featureHighlights.slice(0, 2).join(' • ')
        : (property.type === 'Apartment' || property.type === 'Penthouse' ? 'Secure basement bay' : 'Lock-up garage / off-street parking'),
    };
  })();

  const sizeInfo = (() => {
    if (property.landSizeM2 && property.landSizeM2 > 0) {
      return {
        title: `${property.landSizeM2}m² Land Area`,
        subtitle: 'Registered Allotment Footprint',
        description: `Total surveyed allotment area, comprising residence envelope, private garden grounds, alfresco deck, and landscaping.`,
        highlight: `Surveyed Site • ${property.suburb}`,
      };
    }
    if (property.buildingSizeM2 && property.buildingSizeM2 > 0) {
      return {
        title: `${property.buildingSizeM2}m² Living Space`,
        subtitle: 'Internal Floor Plan Footprint',
        description: `Total usable under-roof interior floor plan across open living rooms, bedrooms, kitchen, and entertainment spaces.`,
        highlight: `Usable Interior Footprint`,
      };
    }
    return null;
  })();

  return (
    <div
      onClick={() => onSelect(property)}
      className={`group bg-white rounded-2xl overflow-visible border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer ${
        isCompared
          ? 'border-amber-400 ring-2 ring-amber-400/80 shadow-md'
          : 'border-slate-200/80 hover:border-blue-400/60'
      }`}
    >
      {/* Property Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-neutral-100">
        {!imageError ? (
          <img
            src={images[currentImageIndex]}
            alt={property.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          /* Styled Fallback container complying with zero-broken-image policy */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-300 p-6 text-center">
            <span className="text-3xl mb-2">🏡</span>
            <span className="text-sm font-semibold text-white">{property.suburb} Residence</span>
            <span className="text-xs text-neutral-400 mt-1">{property.type}</span>
          </div>
        )}

        {/* Badges: For Sale (Green) or For Rent (Blue) as specified */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {isSale ? (
            <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs tracking-wide">
              For Sale
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs tracking-wide">
              For Rent
            </span>
          )}

          {property.auctionDate && (
            <span className="px-2 py-1 text-[11px] font-bold rounded-lg bg-neutral-950/90 text-amber-400 backdrop-blur-xs flex items-center gap-1 border border-white/10">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>Auction</span>
            </span>
          )}

          {property.isPetFriendly && (
            <span className="px-2 py-1 text-[11px] font-bold rounded-lg bg-white/95 text-neutral-800 backdrop-blur-xs shadow-2xs">
              Pet Friendly
            </span>
          )}
        </div>

        {/* Save / Wishlist Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          aria-label={isSaved ? 'Remove from saved' : 'Save property'}
          title={isSaved ? 'In Saved Properties' : 'Save Property'}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-neutral-700 hover:text-rose-600 backdrop-blur-xs transition-colors shadow-xs z-10 cursor-pointer"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Compare Toggle Button on Image */}
        <button
          type="button"
          onClick={handleCompareClick}
          aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
          title={isCompared ? 'Remove from Compare' : 'Add to Compare (max 3)'}
          className={`absolute top-3 right-12 p-2 rounded-full backdrop-blur-xs transition-all shadow-xs z-10 cursor-pointer ${
            isCompared
              ? 'bg-[#FFD200] text-neutral-950 font-bold scale-105'
              : 'bg-white/90 hover:bg-white text-neutral-700 hover:text-neutral-950'
          }`}
        >
          <Scale className="w-4 h-4" />
        </button>

        {/* Image Carousel Controls on hover */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-neutral-950/60 hover:bg-neutral-950/80 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-neutral-950/60 hover:bg-neutral-950/80 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Property Information Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Type Tag */}
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight tabular-nums">
                {property.priceDisplay}
              </h3>
              {property.priceReduced && property.originalPriceDisplay && (
                <span className="text-xs text-neutral-400 line-through font-semibold tabular-nums">
                  {property.originalPriceDisplay}
                </span>
              )}
              {property.priceReduced && property.savingsAmount && property.savingsAmount > 0 && (
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Save ${property.savingsAmount.toLocaleString()}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTypeBadge(property.type)}`}>
              {property.type}
            </span>
          </div>

          {/* Available or Auction date kicker */}
          {property.availableDate && (
            <div className="text-xs text-blue-600 font-bold mt-0.5 flex items-center gap-1">
              <span>{property.availableDate}</span>
            </div>
          )}

          {/* Address & Suburb */}
          <div className="mt-2.5">
            <div className="text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {property.address}
            </div>
            <div className="text-xs text-neutral-500 font-semibold mt-0.5">
              {property.suburb}, {property.state} {property.postcode}
            </div>
          </div>

          {/* Climate Comfort Badge (Sunshine hours & Temperature range for this suburb) */}
          <div className="mt-2.5 flex items-center">
            <ClimateComfortBadge
              suburb={property.suburb}
              state={property.state}
              variant="compact"
            />
          </div>

          {/* Key Specs: Beds, Baths, Car Spaces, Size with Informative Hover Tooltips */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-3 sm:gap-4 text-xs font-bold text-neutral-700">
            {/* Bedrooms Metric */}
            {property.bedrooms > 0 && (
              <div
                className="group/metric relative flex items-center gap-1.5 px-1.5 py-1 -mx-1 -my-1 rounded-lg hover:bg-indigo-50/90 transition-colors cursor-help focus:outline-none focus:ring-1 focus:ring-indigo-400"
                tabIndex={0}
                aria-label={`${bedroomInfo.title}: ${bedroomInfo.description}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Bed className="w-4 h-4 text-indigo-500 group-hover/metric:scale-110 transition-transform shrink-0" />
                <span className="tabular-nums underline decoration-dotted decoration-indigo-300 underline-offset-2">
                  {property.bedrooms}
                </span>
                <MetricTooltip
                  title={bedroomInfo.title}
                  subtitle={bedroomInfo.subtitle}
                  description={bedroomInfo.description}
                  highlight={bedroomInfo.highlight}
                  icon={<Bed className="w-3.5 h-3.5 text-indigo-400" />}
                  position="left"
                />
              </div>
            )}

            {/* Bathrooms Metric */}
            {property.bathrooms > 0 && (
              <div
                className="group/metric relative flex items-center gap-1.5 px-1.5 py-1 -mx-1 -my-1 rounded-lg hover:bg-cyan-50/90 transition-colors cursor-help focus:outline-none focus:ring-1 focus:ring-cyan-400"
                tabIndex={0}
                aria-label={`${bathroomInfo.title}: ${bathroomInfo.description}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Bath className="w-4 h-4 text-cyan-500 group-hover/metric:scale-110 transition-transform shrink-0" />
                <span className="tabular-nums underline decoration-dotted decoration-cyan-300 underline-offset-2">
                  {property.bathrooms}
                </span>
                <MetricTooltip
                  title={bathroomInfo.title}
                  subtitle={bathroomInfo.subtitle}
                  description={bathroomInfo.description}
                  highlight={bathroomInfo.highlight}
                  icon={<Bath className="w-3.5 h-3.5 text-cyan-400" />}
                  position="center"
                />
              </div>
            )}

            {/* Car Spaces Metric */}
            {property.carSpaces > 0 && (
              <div
                className="group/metric relative flex items-center gap-1.5 px-1.5 py-1 -mx-1 -my-1 rounded-lg hover:bg-amber-50/90 transition-colors cursor-help focus:outline-none focus:ring-1 focus:ring-amber-400"
                tabIndex={0}
                aria-label={`${carSpaceInfo.title}: ${carSpaceInfo.description}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Car className="w-4 h-4 text-amber-500 group-hover/metric:scale-110 transition-transform shrink-0" />
                <span className="tabular-nums underline decoration-dotted decoration-amber-300 underline-offset-2">
                  {property.carSpaces}
                </span>
                <MetricTooltip
                  title={carSpaceInfo.title}
                  subtitle={carSpaceInfo.subtitle}
                  description={carSpaceInfo.description}
                  highlight={carSpaceInfo.highlight}
                  icon={<Car className="w-3.5 h-3.5 text-amber-400" />}
                  position="center"
                />
              </div>
            )}

            {/* Land or Floor Size Metric */}
            {sizeInfo && (
              <div
                className="group/metric relative flex items-center gap-1 text-emerald-600 font-bold ml-auto px-1.5 py-1 -mx-1 -my-1 rounded-lg hover:bg-emerald-50/90 transition-colors cursor-help focus:outline-none focus:ring-1 focus:ring-emerald-400"
                tabIndex={0}
                aria-label={`${sizeInfo.title}: ${sizeInfo.description}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Maximize2 className="w-3.5 h-3.5 text-emerald-500 group-hover/metric:scale-110 transition-transform shrink-0" />
                <span className="tabular-nums underline decoration-dotted decoration-emerald-300 underline-offset-2">
                  {property.landSizeM2 ? `${property.landSizeM2}m²` : `${property.buildingSizeM2}m²`}
                </span>
                <MetricTooltip
                  title={sizeInfo.title}
                  subtitle={sizeInfo.subtitle}
                  description={sizeInfo.description}
                  highlight={sizeInfo.highlight}
                  icon={<Maximize2 className="w-3.5 h-3.5 text-emerald-400" />}
                  position="right"
                />
              </div>
            )}
          </div>
        </div>

        {/* View Details, Tour Inside & Compare Action Buttons */}
        <div className="mt-4 pt-3 flex items-center justify-between gap-1.5 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleCompareClick}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 cursor-pointer ${
              isCompared
                ? 'bg-amber-400 text-neutral-950 border-amber-400 font-black shadow-xs'
                : 'bg-white text-neutral-700 border-neutral-200 hover:border-amber-300 hover:bg-amber-50/50'
            }`}
            title="Add up to 3 properties for side-by-side spec comparison"
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isCompared ? 'Comparing' : 'Compare'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            {onTourInside && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTourInside(property);
                }}
                className="px-3 py-1.5 text-xs font-black text-neutral-950 bg-gradient-to-r from-amber-400 via-[#FFD200] to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-xl transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
                title="Tour Inside (Rolling Camera)"
              >
                <Camera className="w-3.5 h-3.5 text-neutral-950" />
                <span>Tour</span>
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(property);
              }}
              className="px-3 py-1.5 text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
