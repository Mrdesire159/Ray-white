import React from 'react';
import { Award, TrendingUp, Users, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

interface SellViewProps {
  onOpenAppraisal: () => void;
  onOpenAgents: () => void;
}

export const SellView: React.FC<SellViewProps> = ({ onOpenAppraisal, onOpenAgents }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero Section for Sell */}
      <div className="bg-neutral-900 rounded-2xl text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFD200]/20 text-[#FFD200] rounded-full text-xs font-bold border border-[#FFD200]/30">
            <span>Selling with Confidence</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Maximum Value for Your Most Valuable Asset
          </h1>
          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
            With more than 1,000 offices and an active database of qualified buyers, Ray White creates competition to secure the highest benchmark prices.
          </p>

          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={onOpenAppraisal}
              className="px-6 py-3 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-bold text-sm rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Book Free Property Appraisal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAgents}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-lg transition-all cursor-pointer"
            >
              Meet Local Agents
            </button>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-15 pointer-events-none hidden lg:block bg-gradient-to-l from-white/20 to-transparent" />
      </div>

      {/* 3 Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-3">
          <div className="w-10 h-10 bg-[#FFD200]/30 rounded-lg flex items-center justify-center text-neutral-950">
            <TrendingUp className="w-5 h-5 text-neutral-950" />
          </div>
          <h3 className="font-bold text-lg text-neutral-900">Proven Auction Strategy</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Our structured auction campaigns generate transparent, competitive bidding environments that consistently outperform private treaty averages by 8.4%.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-3">
          <div className="w-10 h-10 bg-[#FFD200]/30 rounded-lg flex items-center justify-center text-neutral-950">
            <Users className="w-5 h-5 text-neutral-950" />
          </div>
          <h3 className="font-bold text-lg text-neutral-900">Cross-Network Buyer Pool</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Every listing gains access to our interconnected national buyer ledger, alerting thousands of verified pre-approved purchasers the day your campaign launches.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-3">
          <div className="w-10 h-10 bg-[#FFD200]/30 rounded-lg flex items-center justify-center text-neutral-950">
            <Award className="w-5 h-5 text-neutral-950" />
          </div>
          <h3 className="font-bold text-lg text-neutral-900">120 Years of Market Authority</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            A household brand trusted by generations of Australian families, ensuring serious buyers inspect your home with complete confidence.
          </p>
        </div>
      </div>

      {/* Process Steps */}
      <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200 space-y-6">
        <h2 className="text-2xl font-bold text-neutral-900">The 4-Step Ray White Selling Journey</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="text-xs font-bold text-neutral-400">Step 1</div>
            <h4 className="font-bold text-sm text-neutral-900">Market Appraisal &amp; Strategy</h4>
            <p className="text-xs text-neutral-600">
              In-depth comparative market analysis of recent neighborhood comps, target buyer profiles, and customized sales timeline.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-bold text-neutral-400">Step 2</div>
            <h4 className="font-bold text-sm text-neutral-900">Styling &amp; High-Impact Media</h4>
            <p className="text-xs text-neutral-600">
              Architectural photography, immersive video tours, twilight shoots, and professional staging to captivate emotional buyers.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-bold text-neutral-400">Step 3</div>
            <h4 className="font-bold text-sm text-neutral-900">Targeted Multi-Channel Campaign</h4>
            <p className="text-xs text-neutral-600">
              Digital display, premier portal positioning, social retargeting, and direct buyer match outreach across the Ray White ecosystem.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-bold text-neutral-400">Step 4</div>
            <h4 className="font-bold text-sm text-neutral-900">Negotiation &amp; Settlement</h4>
            <p className="text-xs text-neutral-600">
              Skilled negotiation to extract the maximum reserve, followed by dedicated post-exchange legal tracking through to settlement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
