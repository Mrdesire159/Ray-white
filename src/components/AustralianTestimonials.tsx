import React, { useState, useMemo } from 'react';
import {
  Star,
  Quote,
  MapPin,
  CheckCircle2,
  Filter,
  Search,
  MessageSquare,
  Award,
  Sparkles,
  TrendingUp,
  Building,
  Heart,
  Calendar,
  User,
  PlusCircle,
  X,
  Send,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AUSTRALIAN_TESTIMONIALS } from '../data/testimonialsData';
import { AustralianState, ClientType, Testimonial } from '../types/testimonial';
import { useRequests } from '../context/RequestContext';

interface AustralianTestimonialsProps {
  onOpenAppraisal?: () => void;
  onNavigateToAgents?: () => void;
  onNavigateToStays?: () => void;
  isCompactSection?: boolean;
}

export const AustralianTestimonials: React.FC<AustralianTestimonialsProps> = ({
  onOpenAppraisal,
  onNavigateToAgents,
  onNavigateToStays,
  isCompactSection = false,
}) => {
  const { addRequest, targetCustomEmail } = useRequests();

  // Filters & Search
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');

  // Submit Review Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newState, setNewState] = useState<AustralianState>('NSW');
  const [newSuburb, setNewSuburb] = useState('');
  const [newType, setNewType] = useState<ClientType>('buyer');
  const [newRating, setNewRating] = useState<number>(5);
  const [newHeadline, setNewHeadline] = useState('');
  const [newStory, setNewStory] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States count
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = { all: AUSTRALIAN_TESTIMONIALS.length };
    AUSTRALIAN_TESTIMONIALS.forEach((t) => {
      counts[t.state] = (counts[t.state] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered & Sorted Testimonials
  const filteredTestimonials = useMemo(() => {
    return AUSTRALIAN_TESTIMONIALS.filter((item) => {
      // 1. State filter
      if (selectedState !== 'all' && item.state !== selectedState) {
        return false;
      }
      // 2. Type filter
      if (selectedType !== 'all' && item.clientType !== selectedType) {
        return false;
      }
      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = item.clientName.toLowerCase().includes(query);
        const matchesSuburb = item.suburb.toLowerCase().includes(query);
        const matchesCity = item.city.toLowerCase().includes(query);
        const matchesState = item.state.toLowerCase().includes(query);
        const matchesHeadline = item.headline.toLowerCase().includes(query);
        const matchesStory = item.story.toLowerCase().includes(query);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(query));
        const matchesAgent = item.agentName?.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesSuburb &&
          !matchesCity &&
          !matchesState &&
          !matchesHeadline &&
          !matchesStory &&
          !matchesTags &&
          !matchesAgent
        ) {
          return false;
        }
      }
      return true;
    });
  }, [selectedState, selectedType, searchQuery]);

  // Featured Testimonial
  const featuredTestimonial = useMemo(() => {
    return AUSTRALIAN_TESTIMONIALS.find((t) => t.featured) || AUSTRALIAN_TESTIMONIALS[0];
  }, []);

  // Handle client review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newEmail || !newHeadline || !newStory) return;

    setIsSubmitting(true);
    try {
      await addRequest({
        type: 'contact',
        priority: 'normal',
        targetEmail: targetCustomEmail,
        client: {
          name: newClientName,
          email: newEmail,
          phone: '+61 400 000 000',
          preferredContact: 'email',
        },
        details: {
          subject: `Client Testimonial Submitted: ${newHeadline} (${newSuburb}, ${newState})`,
          message: `RATING: ${newRating}/5 Stars\nSTATE: ${newState}\nSUBURB: ${newSuburb}\nROLE: ${newType}\n\nHEADLINE:\n"${newHeadline}"\n\nTESTIMONIAL:\n${newStory}`,
        },
      });

      setSubmittedSuccess(true);
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setSubmittedSuccess(false);
        setNewClientName('');
        setNewEmail('');
        setNewSuburb('');
        setNewHeadline('');
        setNewStory('');
      }, 2500);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getClientTypeLabel = (type: ClientType) => {
    switch (type) {
      case 'buyer':
        return 'Verified Buyer';
      case 'vendor':
        return 'Verified Vendor';
      case 'airbnb':
        return 'Airbnb Stay Guest';
      case 'landlord':
        return 'Property Landlord';
      case 'investor':
        return 'Acreage Investor';
    }
  };

  const getStateFullName = (st: string) => {
    switch (st) {
      case 'NSW':
        return 'New South Wales';
      case 'VIC':
        return 'Victoria';
      case 'QLD':
        return 'Queensland';
      case 'WA':
        return 'Western Australia';
      case 'SA':
        return 'South Australia';
      case 'TAS':
        return 'Tasmania';
      case 'ACT':
        return 'Australian Capital Territory';
      case 'NT':
        return 'Northern Territory';
      default:
        return st;
    }
  };

  return (
    <section className={`bg-neutral-50 ${isCompactSection ? 'py-12 border-b border-neutral-200' : 'py-16'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD200]/25 text-neutral-950 text-xs font-black border border-amber-400/50 mb-3 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
              <span>Voices of Trust Across Australia</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Client Testimonials Across Australia
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2 max-w-2xl leading-relaxed">
              Read authentic feedback from buyers, sellers, and holiday stay guests across Sydney, Melbourne, Brisbane, Perth, Adelaide, Hobart, Canberra, and Darwin.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-[#FFD200] font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-neutral-800"
            >
              <PlusCircle className="w-4 h-4 text-[#FFD200]" />
              <span>Submit Your Review</span>
            </button>
            {onOpenAppraisal && (
              <button
                type="button"
                onClick={onOpenAppraisal}
                className="px-4 py-2.5 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Request Free Appraisal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* National Stats Strip */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-500 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              4.98 <span className="text-sm text-neutral-500 font-semibold">/ 5.0</span>
            </div>
            <div className="text-[11px] text-neutral-500 font-medium mt-0.5">
              Over 3,420+ Verified Australian Reviews
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs text-center sm:text-left">
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center justify-center sm:justify-start gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Clearance &amp; Trust
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              99.4%
            </div>
            <div className="text-[11px] text-neutral-500 font-medium mt-0.5">
              Auction Satisfaction &amp; Recommendation Rate
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs text-center sm:text-left">
            <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1 flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Nationwide Presence
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              8 States &amp; Territories
            </div>
            <div className="text-[11px] text-neutral-500 font-medium mt-0.5">
              NSW, VIC, QLD, WA, SA, TAS, ACT, NT
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs text-center sm:text-left">
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center justify-center sm:justify-start gap-1">
              <Building className="w-3.5 h-3.5 text-amber-500" />
              Heritage Founded
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              1902 <span className="text-xs text-neutral-500 font-semibold font-mono">120+ YRS</span>
            </div>
            <div className="text-[11px] text-neutral-500 font-medium mt-0.5">
              Australasia’s Most Trusted Real Estate Brand
            </div>
          </div>
        </div>

        {/* Featured Spotlight Card */}
        {featuredTestimonial && (
          <div className="mt-8 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD200]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FFD200] text-neutral-950 flex items-center gap-1 shadow-xs">
                    <Award className="w-3.5 h-3.5" />
                    <span>Featured Australian Testimonial</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-neutral-300 border border-white/15">
                    {featuredTestimonial.suburb}, {featuredTestimonial.state} ({getStateFullName(featuredTestimonial.state)})
                  </span>
                  <span className="text-xs text-neutral-400">
                    {featuredTestimonial.date}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(featuredTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-snug">
                  “{featuredTestimonial.headline}”
                </h3>

                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed italic">
                  {featuredTestimonial.story}
                </p>

                <div className="flex items-center gap-4 pt-2">
                  <img
                    src={featuredTestimonial.avatar}
                    alt={featuredTestimonial.clientName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#FFD200] shadow-md"
                  />
                  <div>
                    <div className="text-base font-black text-white flex items-center gap-1.5">
                      <span>{featuredTestimonial.clientName}</span>
                      <span title="Verified Transaction">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 font-medium">
                      {featuredTestimonial.clientRole} · {featuredTestimonial.propertyType}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button for Spotlight */}
              <div className="shrink-0 flex flex-col gap-2.5 w-full sm:w-auto">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                  <div className="text-[10px] uppercase font-bold text-[#FFD200] tracking-wider">
                    Assisting Partner
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {featuredTestimonial.agentName || 'Ray White Prestige Team'}
                  </div>
                  <div className="text-xs text-neutral-400">
                    Licensed Real Estate Specialist
                  </div>
                </div>
                {onNavigateToAgents && (
                  <button
                    type="button"
                    onClick={onNavigateToAgents}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Connect with our Agents</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="mt-10 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by suburb, state, agent, or keyword (e.g., Vaucluse, Toorak, Noosa, auction)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-neutral-50 rounded-xl border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD200] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-neutral-500 whitespace-nowrap">Role:</span>
              {[
                { id: 'all', label: 'All Roles' },
                { id: 'vendor', label: 'Vendors & Sellers' },
                { id: 'buyer', label: 'Buyers' },
                { id: 'airbnb', label: 'Airbnb Guests' },
                { id: 'landlord', label: 'Landlords' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedType(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedType === t.id
                      ? 'bg-neutral-950 text-[#FFD200] shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* State Filter Buttons */}
          <div className="pt-2 border-t border-neutral-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-neutral-500 whitespace-nowrap shrink-0 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>Location:</span>
            </span>
            {[
              { id: 'all', label: 'All Australia', count: stateCounts.all },
              { id: 'NSW', label: 'NSW (Sydney & Coast)', count: stateCounts.NSW || 0 },
              { id: 'VIC', label: 'VIC (Melbourne & Bayside)', count: stateCounts.VIC || 0 },
              { id: 'QLD', label: 'QLD (Brisbane & Noosa)', count: stateCounts.QLD || 0 },
              { id: 'WA', label: 'WA (Perth & Margaret River)', count: stateCounts.WA || 0 },
              { id: 'SA', label: 'SA (Adelaide & Hills)', count: stateCounts.SA || 0 },
              { id: 'TAS', label: 'TAS (Hobart)', count: stateCounts.TAS || 0 },
              { id: 'ACT', label: 'ACT (Canberra)', count: stateCounts.ACT || 0 },
              { id: 'NT', label: 'NT (Darwin)', count: stateCounts.NT || 0 },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedState(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  selectedState === st.id
                    ? 'bg-[#FFD200] text-neutral-950 font-black shadow-xs ring-1 ring-amber-400'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                <span>{st.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedState === st.id ? 'bg-neutral-950 text-[#FFD200]' : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {st.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="mt-6 flex items-center justify-between text-xs text-neutral-600 px-1">
          <div>
            Showing <span className="font-bold text-neutral-900">{filteredTestimonials.length}</span> verified Australian testimonials
            {selectedState !== 'all' && <span> in <strong className="text-neutral-900">{getStateFullName(selectedState)}</strong></span>}
          </div>
          {(selectedState !== 'all' || selectedType !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedState('all');
                setSelectedType('all');
                setSearchQuery('');
              }}
              className="text-neutral-700 hover:text-neutral-950 underline font-bold cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Testimonials Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative"
            >
              <div>
                {/* Top Header Card */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200/60">
                    {item.suburb}, {item.state}
                  </span>
                </div>

                {/* Headline Quote */}
                <h4 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug tracking-tight mb-3 group-hover:text-blue-900 transition-colors">
                  “{item.headline}”
                </h4>

                {/* Detailed Story */}
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal mb-6 line-clamp-5">
                  {item.story}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-5">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 text-neutral-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author & Transaction Footer */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.avatar}
                    alt={item.clientName}
                    className="w-10 h-10 rounded-full object-cover border border-[#FFD200] shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-black text-neutral-900 truncate flex items-center gap-1">
                      <span>{item.clientName}</span>
                      <span title="Verified Customer">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 font-medium truncate">
                      {getClientTypeLabel(item.clientType)} · {item.propertyType}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono text-neutral-400">
                    {item.date}
                  </div>
                  {item.agentName && (
                    <div className="text-[10px] font-bold text-amber-600 mt-0.5 truncate max-w-[120px]">
                      via {item.agentName.split(' ')[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTestimonials.length === 0 && (
          <div className="mt-8 bg-white rounded-2xl p-12 text-center border border-dashed border-neutral-300">
            <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-neutral-900">No testimonials match your criteria</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Try adjusting your state or transaction filters, or clear your search query to see all reviews across Australia.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedState('all');
                setSelectedType('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#FFD200] text-neutral-950 font-bold text-xs rounded-xl shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Bottom Banner - Call to Action */}
        <div className="mt-14 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-3xl p-6 sm:p-10 border border-neutral-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-[#FFD200]">
              Ready for your next Australian property chapter?
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Join thousands of delighted Australian homeowners &amp; investors
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
              Whether selling a waterfront sanctuary in Sydney, buying an architectural haven in Melbourne, or holidaying in Byron Bay, our network delivers excellence.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl border border-neutral-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#FFD200]" />
              <span>Share Your Story</span>
            </button>
            {onOpenAppraisal && (
              <button
                type="button"
                onClick={onOpenAppraisal}
                className="px-5 py-3 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Request Free Property Appraisal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUBMIT TESTIMONIAL MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-900 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {submittedSuccess ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-neutral-900">
                  Thank You for Your Feedback!
                </h3>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                  Your review has been successfully submitted to the Ray White Australasia review team. We appreciate you taking the time to share your property journey.
                </p>
                <div className="text-[11px] text-neutral-400 font-mono">
                  Routed to {targetCustomEmail}
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                    Australian Client Voice
                  </div>
                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight">
                    Share Your Experience
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Help fellow Australians discover how Ray White helped you buy, sell, lease, or holiday.
                  </p>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Star Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Your Overall Rating *
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= newRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-neutral-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-neutral-700 ml-2">
                        {newRating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        placeholder="e.g. Marcus Vance"
                        className="w-full px-3 py-2.5 text-xs bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="e.g. name@example.com"
                        className="w-full px-3 py-2.5 text-xs bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                      />
                    </div>
                  </div>

                  {/* Location (State & Suburb) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        State / Territory *
                      </label>
                      <select
                        value={newState}
                        onChange={(e) => setNewState(e.target.value as AustralianState)}
                        className="w-full px-3 py-2.5 text-xs bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                      >
                        <option value="NSW">NSW (New South Wales)</option>
                        <option value="VIC">VIC (Victoria)</option>
                        <option value="QLD">QLD (Queensland)</option>
                        <option value="WA">WA (Western Australia)</option>
                        <option value="SA">SA (South Australia)</option>
                        <option value="TAS">TAS (Tasmania)</option>
                        <option value="ACT">ACT (Canberra)</option>
                        <option value="NT">NT (Northern Territory)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Suburb or City *
                      </label>
                      <input
                        type="text"
                        required
                        value={newSuburb}
                        onChange={(e) => setNewSuburb(e.target.value)}
                        placeholder="e.g. Vaucluse, Toorak, Noosa"
                        className="w-full px-3 py-2.5 text-xs bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                      />
                    </div>
                  </div>

                  {/* Transaction Type */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Your Property Journey *
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as ClientType)}
                      className="w-full px-3 py-2.5 text-xs bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                    >
                      <option value="buyer">I bought a property</option>
                      <option value="vendor">I sold a property (Auction / Private Treaty)</option>
                      <option value="airbnb">I stayed in an Airbnb / Holiday Retreat</option>
                      <option value="landlord">I am a landlord / Property Investor</option>
                    </select>
                  </div>

                  {/* Headline */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Headline Summary *
                    </label>
                    <input
                      type="text"
                      required
                      value={newHeadline}
                      onChange={(e) => setNewHeadline(e.target.value)}
                      placeholder="e.g. Achieved a record result above our reserve"
                      className="w-full px-3 py-2.5 text-xs bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                    />
                  </div>

                  {/* Detailed Story */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Detailed Review / Story *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={newStory}
                      onChange={(e) => setNewStory(e.target.value)}
                      placeholder="Describe your experience with Ray White, how the campaign or purchase was handled, and what stood out to you..."
                      className="w-full px-3 py-2 text-xs bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD200] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Submitting Review...' : 'Publish Testimonial'}</span>
                  </button>
                  <div className="text-[10px] text-neutral-400 text-center font-mono">
                    All reviews are verified and routed to {targetCustomEmail}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
