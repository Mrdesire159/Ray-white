import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Heart,
  Share2,
  Calendar,
  Users,
  ShieldCheck,
  Check,
  Sparkles,
  Wifi,
  Coffee,
  Waves,
  Car,
  Award,
  Clock,
  Send,
  ExternalLink
} from 'lucide-react';
import { AirbnbStay } from '../../types/airbnb';
import { useRequests } from '../../context/RequestContext';

interface AirbnbStayModalProps {
  stay: AirbnbStay | null;
  onClose: () => void;
  onOpenInbox?: () => void;
}

export const AirbnbStayModal: React.FC<AirbnbStayModalProps> = ({
  stay,
  onClose,
  onOpenInbox,
}) => {
  const { addRequest, targetCustomEmail } = useRequests();

  // Booking Calculator State
  const [nights, setNights] = useState<number>(3);
  const [guestCount, setGuestCount] = useState<number>(2);
  const [checkInDate, setCheckInDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 17);
    return d.toISOString().split('T')[0];
  });

  // Inquiry Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNote, setClientNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!stay) return null;

  const basePrice = stay.pricePerNight * nights;
  const totalPrice = basePrice + stay.cleaningFee + stay.serviceFee;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const messageDetails = `Airbnb Reservation Inquiry for ${stay.title} (${stay.destination})
Dates: ${checkInDate} to ${checkOutDate} (${nights} nights)
Guests: ${guestCount} guests
Nightly Rate: $${stay.pricePerNight} AUD/night
Estimated Total: $${totalPrice.toLocaleString()} AUD
Client Notes: ${clientNote.trim() || 'No special requests.'}`;

    // Add to shared requests pipeline routed to contact@raywhiterealestate.com
    const requestId = await addRequest({
      type: 'contact',
      priority: 'high',
      propertyTitle: stay.title,
      propertyAddress: stay.destination,
      propertySuburb: stay.suburb,
      propertyState: stay.state,
      propertyPrice: `$${stay.pricePerNight} AUD / night (Total: $${totalPrice.toLocaleString()})`,
      propertyImage: stay.images[0],
      client: {
        name: clientName.trim(),
        email: clientEmail.trim(),
        phone: clientPhone.trim() || 'Not specified',
        preferredContact: 'email',
      },
      details: {
        subject: `Airbnb Booking Request: ${stay.title} (${stay.destination})`,
        message: messageDetails,
        requestedDate: checkInDate,
        requestedTime: `${nights} Nights (${guestCount} Guests)`,
        offerAmount: totalPrice,
      },
    });
    if (!requestId)  { setIsSubmitting(false); return; }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-neutral-200 max-h-[92vh] flex flex-col relative my-auto">
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-neutral-950/70 hover:bg-neutral-950 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1">
          {/* Photo Gallery Banner */}
          <div className="relative bg-neutral-950 aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
            <img
              src={stay.images[activePhotoIdx] || stay.images[0]}
              alt={stay.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />

            {/* Badge overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-white">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FFD200] text-neutral-950 font-black text-xs shadow-md">
                  {stay.highlightBadge}
                </span>
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-xs border border-white/20">
                  {stay.propertyType}
                </span>
              </div>

              {/* Thumbnails switcher */}
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/20">
                {stay.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx ? 'border-[#FFD200] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Main Content Container */}
          <div className="p-5 sm:p-7 space-y-6">
            {/* Title & Location Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-neutral-200">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>{stay.destination}, Australia</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-tight">
                  {stay.title}
                </h2>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {stay.tagline}
                </p>

                {/* Specs row */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-neutral-700">
                  <span>{stay.guests} guests</span>
                  <span>•</span>
                  <span>{stay.bedrooms} bedrooms</span>
                  <span>•</span>
                  <span>{stay.beds} beds</span>
                  <span>•</span>
                  <span>{stay.bathrooms} baths</span>
                  <span>•</span>
                  <span className="text-blue-700 font-bold">{stay.distanceToAttraction}</span>
                </div>
              </div>

              {/* Rating & Superhost Pill */}
              <div className="flex flex-col items-start sm:items-end shrink-0 bg-neutral-50 border border-neutral-200 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-base font-black text-neutral-900">
                  <Star className="w-4 h-4 fill-[#FFD200] text-[#FFD200]" />
                  <span>{stay.rating}</span>
                  <span className="text-xs font-normal text-neutral-500">
                    ({stay.reviewCount} reviews)
                  </span>
                </div>
                {stay.isSuperhost && (
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-700">
                    <Award className="w-3.5 h-3.5 text-[#FFD200]" />
                    <span>Superhost</span>
                  </div>
                )}
                <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Ray White Verified Stay
                </div>
              </div>
            </div>

            {/* 2-Column Split: Stay Details Left + Reservation Card Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (7 cols): Description, Host, Amenities */}
              <div className="lg:col-span-7 space-y-6">
                {/* Host Profile */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/90">
                  <img
                    src={stay.host.avatar}
                    alt={stay.host.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#FFD200] shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-neutral-900 truncate">
                        Hosted by {stay.host.name}
                      </h4>
                      {stay.host.isSuperhost && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Superhost
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {stay.host.yearsHosting} years hosting • Response rate: {stay.host.responseRate} ({stay.host.responseTime})
                    </p>
                  </div>
                </div>

                {/* About This Stay */}
                <div className="space-y-2">
                  <h3 className="text-base font-black text-neutral-900">About this space</h3>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                    {stay.description}
                  </p>
                </div>

                {/* What This Place Offers (Amenities Grid) */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-base font-black text-neutral-900">What this place offers</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {stay.amenities.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-neutral-200 text-xs font-semibold text-neutral-800"
                      >
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* House Rules */}
                <div className="pt-2">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-2">
                    House Rules &amp; Access
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-neutral-600">
                    {stay.houseRules.map((rule, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column (5 cols): Live Booking Calculator & Form */}
              <div className="lg:col-span-5 bg-neutral-50 rounded-2xl border border-neutral-200 p-5 shadow-lg space-y-4 sticky top-6">
                {/* Price Tag Header */}
                <div className="flex items-baseline justify-between pb-3 border-b border-neutral-200">
                  <div>
                    <span className="text-2xl font-black text-neutral-900 font-mono">
                      ${stay.pricePerNight} AUD
                    </span>
                    <span className="text-xs text-neutral-500 ml-1">/ night</span>
                  </div>
                  {stay.originalPricePerNight && (
                    <span className="text-xs text-neutral-400 line-through">
                      ${stay.originalPricePerNight} AUD
                    </span>
                  )}
                </div>

                {isSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h4 className="text-base font-black text-emerald-950">
                      Inquiry Dispatched Successfully!
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Your reservation request has been directed to{' '}
                      <strong className="font-mono">{targetCustomEmail}</strong>. You will receive an immediate in-site notification in your <strong>Inbox</strong> once replied.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenInbox) onOpenInbox();
                      }}
                      className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      View in Inbox &amp; Messages
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-3">
                    {/* Date Pickers */}
                    <div className="grid grid-cols-2 gap-2 bg-white rounded-xl border border-neutral-300 p-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-500">
                          Check-in
                        </label>
                        <input
                          type="date"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          className="w-full font-bold text-neutral-900 bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="border-l border-neutral-200 pl-2">
                        <label className="block text-[10px] font-bold uppercase text-neutral-500">
                          Check-out
                        </label>
                        <input
                          type="date"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          className="w-full font-bold text-neutral-900 bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Guests & Nights Counters */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-600 mb-1">
                          Nights ({nights} nights)
                        </label>
                        <div className="flex items-center justify-between bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5">
                          <button
                            type="button"
                            onClick={() => setNights(Math.max(1, nights - 1))}
                            className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold text-neutral-900">{nights}</span>
                          <button
                            type="button"
                            onClick={() => setNights(nights + 1)}
                            className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-neutral-600 mb-1">
                          Guests (Max {stay.guests})
                        </label>
                        <div className="flex items-center justify-between bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5">
                          <button
                            type="button"
                            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                            className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold text-neutral-900">{guestCount}</span>
                          <button
                            type="button"
                            onClick={() => setGuestCount(Math.min(stay.guests, guestCount + 1))}
                            className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-3 text-xs space-y-1.5 font-medium text-neutral-600">
                      <div className="flex justify-between">
                        <span>${stay.pricePerNight} x {nights} nights</span>
                        <span className="font-mono text-neutral-900">${basePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cleaning fee</span>
                        <span className="font-mono text-neutral-900">${stay.cleaningFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ray White Service fee</span>
                        <span className="font-mono text-neutral-900">${stay.serviceFee}</span>
                      </div>
                      <div className="pt-2 border-t border-neutral-200 flex justify-between text-sm font-black text-neutral-950">
                        <span>Total (AUD)</span>
                        <span className="font-mono text-blue-700">${totalPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Guest Contact Inputs */}
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Your Full Name *"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="Your Email Address *"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Phone Number (Optional)"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        rows={2}
                        value={clientNote}
                        onChange={(e) => setClientNote(e.target.value)}
                        placeholder="Special requests or trip details..."
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-[#FFD200] hover:bg-[#E5BC00] active:scale-[0.98] text-neutral-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-400 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 fill-neutral-950" />
                      <span>{isSubmitting ? 'Routing to Concierge...' : 'Reserve & Inquire via Concierge'}</span>
                    </button>

                    <div className="text-[10px] text-neutral-500 text-center flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Directly routes to {targetCustomEmail}</span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
