import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Award,
  Star,
  Building2,
  CheckCircle,
  Search,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ChevronRight,
  X,
  FileCheck2,
  MapPin,
  Clock,
  Check,
  Copy,
  Send,
  MessageSquare
} from 'lucide-react';
import { AGENTS } from '../data/agents';
import { Agent, Property } from '../types/property';
import { PROPERTIES } from '../data/properties';
import { useRequests } from '../context/RequestContext';

interface AgentDirectoryProps {
  onSelectProperty: (property: Property) => void;
  onOpenAppraisal: () => void;
}

type BadgeFilterType = 'all' | 'top_performer' | 'recent_sales';

export const AgentDirectory: React.FC<AgentDirectoryProps> = ({
  onSelectProperty,
  onOpenAppraisal,
}) => {
  const { addRequest, targetCustomEmail } = useRequests();

  const [searchTerm, setSearchTerm] = useState('');
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilterType>('all');
  const [selectedAgentForContact, setSelectedAgentForContact] = useState<Agent | null>(null);
  const [selectedAgentForSalesModal, setSelectedAgentForSalesModal] = useState<Agent | null>(null);
  const [contactSent, setContactSent] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [inquiryType, setInquiryType] = useState('Thinking about selling');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Filter agents based on search & badge category
  const filteredAgents = AGENTS.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.office.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (badgeFilter === 'top_performer') {
      return a.isTopPerformer === true || (a.rating >= 4.9 && a.soldCount >= 100);
    }
    if (badgeFilter === 'recent_sales') {
      return (a.recentSalesCount && a.recentSalesCount > 0) || (a.recentSales && a.recentSales.length > 0);
    }
    return true;
  });

  const topPerformersCount = AGENTS.filter(
    (a) => a.isTopPerformer === true || (a.rating >= 4.9 && a.soldCount >= 100)
  ).length;

  const recentSalesCount = AGENTS.filter(
    (a) => (a.recentSalesCount && a.recentSalesCount > 0) || (a.recentSales && a.recentSales.length > 0)
  ).length;

  const getAgentProperties = (agentId: string) => {
    return PROPERTIES.filter((p) => p.agentId === agentId);
  };

  const handleCopyEmail = (email: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !selectedAgentForContact) return;

    // Direct inquiry dispatched into the site's Reply Portal / RequestContext
    const requestId = await addRequest({
      type: 'contact',
      priority: 'high',
      targetEmail: selectedAgentForContact.email || targetCustomEmail,
      client: {
        name: clientName,
        email: clientEmail || targetCustomEmail,
        phone: clientPhone,
        preferredContact: 'email',
      },
      assignedAgentId: selectedAgentForContact.id,
      propertyAddress: `Direct Agent Inquiry for ${selectedAgentForContact.name}`,
      details: {
        subject: `${inquiryType} — Direct Contact for ${selectedAgentForContact.name}`,
        message: clientMessage || `Client requested direct contact for ${inquiryType} through ${selectedAgentForContact.email}.`,
        preferredOffice: selectedAgentForContact.office,
      },
    });
    if (!requestId) return;

    setContactSent(true);
  };

  const resetContactForm = () => {
    setSelectedAgentForContact(null);
    setContactSent(false);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setClientMessage('');
    setInquiryType('Thinking about selling');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Official Custom Email Dispatch Highlight Banner */}
      <div className="mb-10 p-5 sm:p-6 rounded-3xl bg-neutral-900 border border-neutral-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD200]/20 text-[#FFD200] border border-[#FFD200]/30 flex items-center justify-center shrink-0 shadow-md">
            <Mail className="w-6 h-6 text-[#FFD200]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FFD200]">
                Official Agent Dispatch &amp; Central Inbound
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Direct In-Site Reply
              </span>
            </div>
            <div className="text-lg sm:text-xl font-mono font-black text-white mt-0.5 tracking-tight flex items-center gap-2">
              <span>{targetCustomEmail}</span>
              <button
                type="button"
                onClick={() => handleCopyEmail(targetCustomEmail)}
                className="p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Copy custom email"
              >
                {copiedEmail === targetCustomEmail ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Both premier partners are directly connected to our unified dispatch portal. Enquiries sent to our agents route immediately to <strong className="text-white font-mono">{targetCustomEmail}</strong> for rapid in-site replies and instant visitor notification.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-4xl mb-10">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Executive Partners &amp; Prestige Specialists</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
          Meet Our Premier Ray White Agents
        </h1>
        <p className="mt-3 text-neutral-600 text-sm sm:text-base leading-relaxed">
          Representing Australasia’s benchmark sales, our dedicated executive team combines deep auction intelligence, transparent advisory, and proven clearance rates to guide vendors and buyers through prestige transactions.
        </p>

        {/* Search & Filter Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by agent name, office, or suburb..."
              className="w-full bg-white border border-neutral-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200] shadow-2xs"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Badge Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl border border-neutral-200 self-start sm:self-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setBadgeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                badgeFilter === 'all'
                  ? 'bg-neutral-950 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60'
              }`}
            >
              All Agents ({AGENTS.length})
            </button>
            <button
              type="button"
              onClick={() => setBadgeFilter('top_performer')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                badgeFilter === 'top_performer'
                  ? 'bg-amber-400 text-neutral-950 shadow-2xs font-extrabold'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>Top Performers ({topPerformersCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setBadgeFilter('recent_sales')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                badgeFilter === 'recent_sales'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Recent Sales ({recentSalesCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Agents Grid - Balanced 2-Agent Executive Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {filteredAgents.map((agent) => {
          const agentProps = getAgentProperties(agent.id);
          const isTopPerformer =
            agent.isTopPerformer === true || (agent.rating >= 4.9 && agent.soldCount >= 100);
          const hasRecentSales =
            (agent.recentSalesCount && agent.recentSalesCount > 0) ||
            (agent.recentSales && agent.recentSales.length > 0);

          return (
            <div
              key={agent.id}
              className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Subtle decorative gold corner bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFD200] via-amber-400 to-[#FFD200]" />

              <div>
                {/* Trust Badges Strip (Top Performer & Recent Sales) */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  {isTopPerformer && (
                    <span
                      title="Ray White Verified Top Performer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-950 border border-amber-300 rounded-lg text-xs font-extrabold tracking-tight shadow-2xs"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      <span>Top Performer</span>
                      {agent.topPerformerTitle && (
                        <span className="text-amber-800 font-semibold opacity-90 hidden sm:inline">
                          · {agent.topPerformerTitle}
                        </span>
                      )}
                    </span>
                  )}

                  {hasRecentSales && (
                    <button
                      type="button"
                      onClick={() => setSelectedAgentForSalesModal(agent)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold tracking-tight shadow-2xs transition-colors cursor-pointer group"
                      title="Click to view verified recent sales track record"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{agent.recentSalesCount || agent.recentSales?.length} Verified Sales</span>
                      {agent.recentSalesVolume && (
                        <span className="text-emerald-700 font-extrabold hidden xs:inline">
                          ({agent.recentSalesVolume})
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>

                {/* Agent Profile & Identity */}
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="relative shrink-0">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#FFD200] shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    {isTopPerformer && (
                      <div
                        className="absolute -top-1.5 -right-1.5 bg-[#FFD200] text-neutral-950 p-1.5 rounded-full shadow-md border border-neutral-900"
                        title="Top Performer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-neutral-900 truncate tracking-tight">{agent.name}</h3>
                      <span title="Verified Licensed Real Estate Agent" className="inline-flex">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      </span>
                    </div>
                    <div className="text-xs font-bold text-neutral-700 mt-0.5">{agent.role}</div>
                    <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{agent.office}</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                      {agent.licenseNumber}
                    </div>
                  </div>
                </div>

                {/* Official Custom Email Showcase Box */}
                <div className="mt-4 p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                        Official Custom Email
                      </div>
                      <a
                        href={`mailto:${agent.email}`}
                        className="text-xs font-mono font-bold text-neutral-900 hover:text-blue-700 transition-colors block truncate"
                        title="Click to write an email"
                      >
                        {agent.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(agent.email)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 text-[11px] font-bold text-neutral-700 hover:text-neutral-950 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    >
                      {copiedEmail === agent.email ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-neutral-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Key Performance Metrics Bar */}
                <div className="mt-4 grid grid-cols-4 gap-2 p-3 bg-neutral-50/80 rounded-2xl border border-neutral-200/90 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-xs font-extrabold text-neutral-900">
                      <Star className="w-3.5 h-3.5 fill-[#FFD200] text-[#FFD200]" />
                      <span>{agent.rating.toFixed(1)}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-medium">Rating</div>
                  </div>
                  <div className="border-x border-neutral-200 px-1">
                    <div className="text-xs font-extrabold text-neutral-900">
                      {agent.soldCount}+
                    </div>
                    <div className="text-[10px] text-neutral-500 font-medium">Career Sales</div>
                  </div>
                  <div className="border-r border-neutral-200 px-1">
                    <div className="text-xs font-extrabold text-emerald-700">
                      {agent.clearanceRate || '95%'}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-medium">Clearance</div>
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-neutral-900">
                      {agent.avgDaysOnMarket || 20}d
                    </div>
                    <div className="text-[10px] text-neutral-500 font-medium">Avg On Mkt</div>
                  </div>
                </div>

                {/* Bio */}
                <p className="mt-4 text-xs text-neutral-600 leading-relaxed">
                  {agent.bio}
                </p>

                {/* Verified Recent Sales Highlight Accordion / Button */}
                {agent.recentSales && agent.recentSales.length > 0 && (
                  <div className="mt-4 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div className="text-xs truncate">
                        <span className="font-bold text-emerald-950">Recent Sale: </span>
                        <span className="text-neutral-700 font-medium">
                          {agent.recentSales[0].address} ({agent.recentSales[0].price})
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAgentForSalesModal(agent)}
                      className="text-[11px] font-extrabold text-emerald-800 hover:text-emerald-950 hover:underline shrink-0 cursor-pointer"
                    >
                      View All ({agent.recentSales.length}) →
                    </button>
                  </div>
                )}

                {/* Current Listings by this Agent */}
                {agentProps.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-neutral-100">
                    <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Current Portfolio ({agentProps.length} Properties)</span>
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                      {agentProps.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => onSelectProperty(p)}
                          className="shrink-0 w-36 bg-neutral-50 hover:bg-neutral-100 p-2 rounded-xl border border-neutral-200 cursor-pointer transition-colors shadow-2xs group/card"
                        >
                          <img
                            src={p.images[0]}
                            alt={p.address}
                            className="w-full h-16 object-cover rounded-lg mb-1.5 group-hover/card:scale-102 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-[11px] font-bold text-neutral-900 truncate">
                            {p.address}
                          </div>
                          <div className="text-[10px] text-amber-700 font-bold truncate">{p.priceDisplay}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-5 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href={`tel:${agent.phone.replace(/[^0-9+]/g, '')}`}
                  className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Call Agent</span>
                </a>
                <a
                  href={`mailto:${agent.email}?subject=Inquiry for ${agent.name}`}
                  className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-700" />
                  <span>Email Custom</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAgentForContact(agent);
                    setContactSent(false);
                  }}
                  className="py-2.5 px-3 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-neutral-950" />
                  <span>Direct Message</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verified Recent Sales Modal */}
      {selectedAgentForSalesModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-neutral-200">
            <button
              onClick={() => setSelectedAgentForSalesModal(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-neutral-200">
              <img
                src={selectedAgentForSalesModal.avatar}
                alt={selectedAgentForSalesModal.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FFD200]"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-xl text-neutral-900">
                    {selectedAgentForSalesModal.name}
                  </h3>
                  {selectedAgentForSalesModal.isTopPerformer && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded text-[10px] font-extrabold">
                      Top Performer
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-600">{selectedAgentForSalesModal.role}</p>
                <p className="text-[11px] text-neutral-500 font-mono mt-0.5">{selectedAgentForSalesModal.email}</p>
              </div>
            </div>

            {/* Performance Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                <div className="text-base font-extrabold text-neutral-900">
                  {selectedAgentForSalesModal.recentSalesVolume || '$35M+'}
                </div>
                <div className="text-[11px] text-neutral-500 font-medium">90-Day Volume</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                <div className="text-base font-extrabold text-emerald-700">
                  {selectedAgentForSalesModal.clearanceRate || '95%'}
                </div>
                <div className="text-[11px] text-neutral-500 font-medium">Clearance Rate</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                <div className="text-base font-extrabold text-neutral-900">
                  {selectedAgentForSalesModal.avgDaysOnMarket || 21} Days
                </div>
                <div className="text-[11px] text-neutral-500 font-medium">Avg Days on Mkt</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                <div className="text-base font-extrabold text-neutral-900">
                  {selectedAgentForSalesModal.soldCount}
                </div>
                <div className="text-[11px] text-neutral-500 font-medium">Total Career Sales</div>
              </div>
            </div>

            {/* Verified Recent Sales List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Verified Recent Transactions</span>
                </h4>
                <span className="text-xs font-semibold text-neutral-500">
                  Last 90 Days
                </span>
              </div>

              <div className="space-y-2.5">
                {(selectedAgentForSalesModal.recentSales || []).map((sale, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-neutral-100/70 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-bold text-xs text-neutral-900">
                          {sale.address}, {sale.suburb}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5 ml-5">
                        {sale.type} · Sold {sale.soldDate}
                      </div>
                    </div>
                    <div className="text-left sm:text-right ml-5 sm:ml-0">
                      <span className="text-sm font-extrabold text-emerald-700 tabular-nums">
                        {sale.price}
                      </span>
                      <div className="text-[10px] text-neutral-400 font-medium">Settled Contract</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to action */}
            <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedAgentForSalesModal(null);
                  onOpenAppraisal();
                }}
                className="w-full sm:flex-1 py-3 px-4 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs text-center"
              >
                Request Appraisal From {selectedAgentForSalesModal.name}
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = selectedAgentForSalesModal;
                  setSelectedAgentForSalesModal(null);
                  setSelectedAgentForContact(target);
                  setContactSent(false);
                }}
                className="w-full sm:flex-1 py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Send Direct Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Direct Contact Modal - Unified In-Site Routing */}
      {selectedAgentForContact && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={resetContactForm}
              className="absolute top-5 right-5 p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <img
                src={selectedAgentForContact.avatar}
                alt={selectedAgentForContact.name}
                className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-[#FFD200] shadow-md mb-2.5"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="font-extrabold text-xl text-neutral-900">{selectedAgentForContact.name}</h3>
                {selectedAgentForContact.isTopPerformer && (
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded text-[9px] font-extrabold">
                    Top Performer
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500">{selectedAgentForContact.role} · {selectedAgentForContact.office}</p>
              
              {/* Highlight custom email dispatch notice */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-full text-[11px] font-semibold">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Direct dispatch to: <strong className="font-mono">{selectedAgentForContact.email}</strong></span>
              </div>
            </div>

            {contactSent ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-lg text-neutral-900">Inquiry Delivered Successfully</h4>
                  <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                    Your request has been forwarded to <strong className="text-neutral-900">{selectedAgentForContact.name}</strong> via <strong className="text-neutral-900 font-mono">{selectedAgentForContact.email}</strong>.
                  </p>
                  <p className="text-[11px] text-neutral-500 pt-1">
                    When our team replies, an instant toast notification will appear on your screen and in your in-site Reply Portal.
                  </p>
                </div>
                <button
                  onClick={resetContactForm}
                  className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Your Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="0400 123 456"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Your Email (For in-site reply notifications)
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    How can {selectedAgentForContact.name} assist you?
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200] cursor-pointer"
                  >
                    <option>Thinking about selling</option>
                    <option>Looking to buy a prestige home</option>
                    <option>Request confidential property appraisal</option>
                    <option>Off-market opportunities preview</option>
                    <option>Private VIP inspection request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Your Message / Specific Requirements (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    placeholder="Share any details about your property, target suburbs, or preferred timeline..."
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200] resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-black text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to {selectedAgentForContact.name}</span>
                  </button>
                  <p className="text-[10px] text-neutral-400 text-center mt-2">
                    Inquiries are transmitted directly to {selectedAgentForContact.email} with real-time audit tracking.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
