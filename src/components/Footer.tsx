import React, { useState, useEffect } from 'react';
import {
  Mail,
  Bell,
  Sparkles,
  CheckCircle2,
  Send,
  ShieldCheck,
  Check,
  AlertCircle,
  ArrowRight,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, tab?: 'sale' | 'rent') => void;
  onOpenAppraisal: () => void;
}

interface SubscriberProfile {
  email: string;
  name?: string;
  region: string;
  frequency: 'instant' | 'weekly';
  categories: string[];
  subscribedAt: string;
}

const STORAGE_KEY = 'rw_newsletter_subscribers';

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAppraisal }) => {
  // Newsletter Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('All Australasia (National)');
  const [frequency, setFrequency] = useState<'instant' | 'weekly'>('instant');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Houses For Sale',
    'Prestige Waterfronts',
  ]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<SubscriberProfile | null>(null);

  // Load existing subscription from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const list: SubscriberProfile[] = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) {
          setActiveSubscription(list[list.length - 1]);
        }
      }
    } catch {
      // ignore in strict sandbox
    }
  }, []);

  const availableCategories = [
    { id: 'Houses For Sale', label: '🏡 Houses For Sale' },
    { id: 'Luxury Rentals', label: '🔑 Luxury Rentals' },
    { id: 'Country & Acreage', label: '🌳 Country & Acreage' },
    { id: 'Prestige Waterfronts', label: '⛵ Prestige Waterfronts' },
    { id: 'Real-Time Price Drops', label: '📉 Price Drop Alerts' },
    { id: 'Upcoming Auctions', label: '🔨 Auction Results' },
  ];

  const regionsList = [
    'All Australasia (National)',
    'Sydney & Eastern Suburbs (NSW)',
    'Melbourne & Bayside (VIC)',
    'Brisbane & Gold Coast (QLD)',
    'Bowral & Southern Highlands (NSW)',
    'Perth & Coastal Western Australia (WA)',
    'Adelaide & Hills (SA)',
  ];

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId)
        ? prev.length > 1
          ? prev.filter((c) => c !== catId)
          : prev // keep at least 1
        : [...prev, catId]
    );
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setErrorMessage('Please enter your email address to receive property alerts.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setErrorMessage('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    setIsSubmitting(true);

    // Simulate instant secure network registration
    setTimeout(() => {
      const newSubscriber: SubscriberProfile = {
        email: emailTrimmed,
        name: name.trim() || undefined,
        region,
        frequency,
        categories: selectedCategories,
        subscribedAt: new Date().toLocaleDateString('en-AU', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      };

      try {
        const existing = localStorage.getItem(STORAGE_KEY);
        const list: SubscriberProfile[] = existing ? JSON.parse(existing) : [];
        const filtered = list.filter((s) => s.email.toLowerCase() !== emailTrimmed.toLowerCase());
        filtered.push(newSubscriber);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      } catch {
        // ignore
      }

      setActiveSubscription(newSubscriber);
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 700);
  };

  const handleResetForAnother = () => {
    setSubmitSuccess(false);
    setEmail('');
    setName('');
    setErrorMessage(null);
  };

  return (
    <footer className="bg-neutral-950 text-neutral-400 text-xs border-t border-neutral-900 pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ========================================================= */}
        {/* 1. NEWSLETTER & VIP PROPERTY ALERTS SUBSCRIPTION SECTION   */}
        {/* ========================================================= */}
        <div className="relative rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-900/90 to-neutral-950 p-6 sm:p-10 lg:p-12 border border-neutral-800 shadow-2xl overflow-hidden">
          {/* Subtle gold glow & decorative background accents */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD200]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Headline & Perks (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD200]/15 text-[#FFD200] border border-[#FFD200]/30 text-xs font-black uppercase tracking-wider shadow-xs">
                <Bell className="w-3.5 h-3.5 text-[#FFD200] animate-bounce" />
                <span>Ray White VIP Property Alerts</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Be First to Know When Prestige Properties Hit the Market.
              </h3>

              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                Receive curated property alerts tailored to your exact search criteria: confidential off-market opportunities, instant price reduction notifications, and weekly clearance results across Australasia.
              </p>

              {/* VIP Perks List */}
              <div className="pt-2 space-y-2.5 text-xs text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span><strong>Real-Time Price Drop Alerts:</strong> Automated equalized price updates.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span><strong>Off-Market Previews:</strong> 48 hours before public portal syndication.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span><strong>4K Video &amp; Drone Surveys:</strong> Topographic and architectural flyovers.</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-neutral-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Zero spam guarantee. 1-click instant unsubscribe anytime.</span>
              </div>
            </div>

            {/* Right Interactive Newsletter Form / Success Card (7 cols) */}
            <div className="lg:col-span-7">
              {submitSuccess ? (
                <div className="bg-neutral-950/80 rounded-2xl p-6 sm:p-8 border border-emerald-500/30 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30 shadow-lg">
                    <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 tracking-wider">
                      Subscription Active
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-white">
                      You&apos;re Subscribed to Ray White Alerts!
                    </h4>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto">
                      We have registered <strong className="text-white font-mono">{activeSubscription?.email}</strong> for{' '}
                      <span className="text-[#FFD200] font-semibold">{activeSubscription?.frequency === 'instant' ? 'Instant Real-Time' : 'Weekly Digest'}</span> property alerts in <span className="text-white font-semibold">{activeSubscription?.region}</span>.
                    </p>
                  </div>

                  {/* Summary of Active Tags */}
                  {activeSubscription?.categories && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                      {activeSubscription.categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 text-[11px] font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetForAnother}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer border border-emerald-500 active:scale-95"
                    >
                      Update Preferences / Subscribe Another
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('buy')}
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 border border-red-500 shadow-red-600/20"
                    >
                      <span>Explore Current Listings</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="bg-neutral-950/80 rounded-2xl p-5 sm:p-7 border border-neutral-800 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-neutral-800 text-xs font-bold text-neutral-300">
                    <span className="flex items-center gap-2 text-white">
                      <Mail className="w-4 h-4 text-[#FFD200]" />
                      <span>Property Alert Subscription Form</span>
                    </span>
                    <span className="text-[11px] font-mono text-[#FFD200]">
                      VIP Membership Free
                    </span>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Email & Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Eleanor Vance"
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFD200] focus:ring-1 focus:ring-[#FFD200] transition-all"
                      />
                    </div>

                    <div className="sm:col-span-7">
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          placeholder="name@example.com"
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFD200] focus:ring-1 focus:ring-[#FFD200] transition-all"
                        />
                        <Mail className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Property Alert Categories Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                      Select Property Types to Follow
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableCategories.map((cat, idx) => {
                        const isSelected = selectedCategories.includes(cat.id);
                        // Distinct theme color when selected
                        const selectedStyles = [
                          'bg-blue-600 text-white font-bold shadow-xs border-blue-500 scale-102',
                          'bg-emerald-600 text-white font-bold shadow-xs border-emerald-500 scale-102',
                          'bg-red-600 text-white font-bold shadow-xs border-red-500 scale-102',
                          'bg-sky-600 text-white font-bold shadow-xs border-sky-500 scale-102',
                          'bg-teal-600 text-white font-bold shadow-xs border-teal-500 scale-102',
                          'bg-rose-600 text-white font-bold shadow-xs border-rose-500 scale-102',
                        ];
                        const activeCls = selectedStyles[idx % selectedStyles.length];

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                              isSelected
                                ? activeCls
                                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                            }`}
                          >
                            <span>{cat.label}</span>
                            {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Advanced Filters Toggle */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="text-[11px] font-semibold text-neutral-400 hover:text-blue-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>{showAdvancedOptions ? 'Hide Regional & Frequency Preferences' : 'Customize Region & Frequency'}</span>
                    </button>
                  </div>

                  {/* Region & Frequency Strip (Collapsible) */}
                  {showAdvancedOptions && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs animate-in fade-in duration-200">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                          Preferred Region / Suburb
                        </label>
                        <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          {regionsList.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                          Dispatch Frequency
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setFrequency('instant')}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer ${
                              frequency === 'instant'
                                ? 'bg-blue-600 text-white font-black shadow-xs'
                                : 'bg-neutral-800 text-neutral-300 hover:text-white'
                            }`}
                          >
                            ⚡ Instant Alerts
                          </button>
                          <button
                            type="button"
                            onClick={() => setFrequency('weekly')}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer ${
                              frequency === 'weekly'
                                ? 'bg-emerald-600 text-white font-black shadow-xs'
                                : 'bg-neutral-800 text-neutral-300 hover:text-white'
                            }`}
                          >
                            📅 Weekly Digest
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit CTA - Oceanic Royal Blue Theme */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-60 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-500"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Registering Your VIP Alert Subscription...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-white" />
                          <span>Subscribe for Property Alerts</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] text-neutral-500 text-center leading-relaxed">
                    By subscribing, you agree to receive prestige property alerts, auction results, and market updates from Ray White. You may withdraw consent at any time.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. MAIN FOOTER SITEMAP & CORPORATE LINKS                  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-neutral-900">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#FFD200] flex items-center justify-center font-bold text-neutral-950 text-lg tracking-tighter rounded-sm">
                RW
              </div>
              <div className="ml-2.5">
                <span className="text-xl font-extrabold tracking-tight text-white leading-none">
                  Ray White<span className="text-[#FFD200]">.</span>
                </span>
              </div>
            </div>
            <p className="text-neutral-400 text-xs max-w-sm leading-relaxed">
              Founded in 1902 in Crows Nest, Queensland, Ray White has grown into Australasia’s largest real estate family with more than 1,000 franchised offices across Australia, New Zealand, and internationally.
            </p>
            <div className="pt-2 text-neutral-500 text-[11px] space-y-1">
              <div>Head Office: Level 26, 111 Eagle Street, Brisbane QLD 4000</div>
              <div className="flex items-center gap-1.5 text-neutral-400">
                <span>Official Inquiries:</span>
                <span className="text-[#FFD200] font-mono font-semibold">contact@raywhiterealestate.com</span>
              </div>
            </div>
          </div>

          {/* Buy & Rent Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">Residential</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('buy', 'sale')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Properties For Sale
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('rent', 'rent')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Properties For Rent
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('buy', 'sale')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Upcoming Auctions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('buy', 'sale')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Prestige Waterfronts
                </button>
              </li>
            </ul>
          </div>

          {/* Vendors & Landlords */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">Services</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenAppraisal}
                  className="hover:text-[#FFD200] transition-colors cursor-pointer text-left"
                >
                  Book Free Appraisal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('sell')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Selling with Ray White
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('agents')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Find an Agent
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Our Office Network
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('replyportal')}
                  className="hover:text-[#FFD200] text-neutral-300 font-semibold transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#FFD200]" />
                  <span>Reply &amp; Message Portal</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. BOTTOM LEGAL BAR                                       */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} Ray White Real Estate. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="hover:text-neutral-300 cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-neutral-300 cursor-pointer">Terms of Use</span>
            <span>·</span>
            <span className="hover:text-neutral-300 cursor-pointer">Property Alert Conditions</span>
            <span>·</span>
            <span className="hover:text-neutral-300 cursor-pointer">Fair Housing Notice</span>
            <span>·</span>
            <span className="hover:text-neutral-300 cursor-pointer">Financial Services Guide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
