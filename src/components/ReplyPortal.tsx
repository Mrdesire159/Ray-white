import React, { useState, useMemo, useEffect } from 'react';
import {
  Mail,
  Inbox,
  Bell,
  Send,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Home,
  Sparkles,
  ArrowLeft,
  PlusCircle,
  X,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Check,
  AlertCircle
} from 'lucide-react';
import { useRequests } from '../context/RequestContext';
import { AdminRequest, RequestReply } from '../types/request';

interface ReplyPortalProps {
  onBackToSite: () => void;
  onNavigateToProperty?: (propertyId: string) => void;
}

export const ReplyPortal: React.FC<ReplyPortalProps> = ({
  onBackToSite,
  onNavigateToProperty,
}) => {
  const {
    requests,
    targetCustomEmail,
    sendReply,
    sendDirectMessage,
    unrepliedCount,
    visitorUnreadReplyCount,
    readReplyIds,
    markReplyAsRead,
    markAllRepliesAsRead,
  } = useRequests();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'needs_reply' | 'replied' | 'contact' | 'property' | 'appraisal'>('all');
  const [selectedRequestId, setSelectedRequestId] = useState<string>(() => {
    return requests[0]?.id || '';
  });

  // Reply Composer State
  const [replyText, setReplyText] = useState('');
  const [replySuccessToast, setReplySuccessToast] = useState<string | null>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // New Direct Outbound Message Modal
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [composeName, setComposeName] = useState('');
  const [composeEmail, setComposeEmail] = useState('');
  const [composePhone, setComposePhone] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeMessage, setComposeMessage] = useState('');

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchClient =
          req.client.name.toLowerCase().includes(q) ||
          req.client.email.toLowerCase().includes(q) ||
          req.client.phone.includes(q);
        const matchMessage = req.details.message?.toLowerCase().includes(q);
        const matchSubject = req.details.subject?.toLowerCase().includes(q);
        const matchAddress = req.propertyAddress?.toLowerCase().includes(q);
        if (!matchClient && !matchMessage && !matchSubject && !matchAddress) return false;
      }

      // Filter tabs
      const hasReplies = req.replies && req.replies.length > 0;
      if (filterTab === 'needs_reply') return !hasReplies;
      if (filterTab === 'replied') return hasReplies;
      if (filterTab === 'contact') return req.type === 'contact';
      if (filterTab === 'property') return !!req.propertyAddress;
      if (filterTab === 'appraisal') return req.type === 'appraisal' || req.type === 'valuation';

      return true;
    });
  }, [requests, searchQuery, filterTab]);

  const selectedRequest = useMemo(() => {
    return requests.find((r) => r.id === selectedRequestId) || filteredRequests[0] || null;
  }, [requests, selectedRequestId, filteredRequests]);

  // Mark replies of currently viewed message as read by visitor
  useEffect(() => {
    if (selectedRequest?.replies && selectedRequest.replies.length > 0) {
      selectedRequest.replies.forEach((rep) => {
        if (!readReplyIds.includes(rep.id)) {
          markReplyAsRead(rep.id);
        }
      });
    }
  }, [selectedRequest, readReplyIds, markReplyAsRead]);

  const handleSendReplySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedRequest || !replyText.trim() || isSendingReply) return;

    setIsSendingReply(true);

    setTimeout(() => {
      sendReply(selectedRequest.id, replyText.trim(), {
        senderEmail: targetCustomEmail,
        senderName: 'Ray White Executive Team',
        subject: `Re: ${selectedRequest.details.subject || selectedRequest.propertyTitle || 'Your Ray White Inquiry'}`,
      });

      const sentTo = selectedRequest.client.email;
      setReplyText('');
      setIsSendingReply(false);
      setReplySuccessToast(`Reply successfully sent to ${sentTo} from ${targetCustomEmail}`);
      setTimeout(() => setReplySuccessToast(null), 4500);
    }, 400);
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeName.trim() || !composeEmail.trim() || !composeMessage.trim()) return;

    const newId = sendDirectMessage({
      recipientName: composeName.trim(),
      recipientEmail: composeEmail.trim(),
      recipientPhone: composePhone.trim(),
      subject: composeSubject.trim() || 'Communication from Ray White Real Estate',
      message: composeMessage.trim(),
    });

    setIsComposeModalOpen(false);
    setComposeName('');
    setComposeEmail('');
    setComposePhone('');
    setComposeSubject('');
    setComposeMessage('');
    setSelectedRequestId(newId);
    setReplySuccessToast(`Outbound message initiated from ${targetCustomEmail} to ${composeEmail}`);
    setTimeout(() => setReplySuccessToast(null), 4500);
  };

  const quickReplyTemplates = [
    {
      title: 'Viewing Confirmation',
      text: `Hello ${selectedRequest?.client.name || 'there'},\n\nThank you for reaching out to Ray White. We have registered your request for an inspection and one of our premier area specialists will contact you shortly to confirm the access time.\n\nWarm regards,\nRay White Concierge (${targetCustomEmail})`,
    },
    {
      title: 'Appraisal Report',
      text: `Hello ${selectedRequest?.client.name || 'there'},\n\nThank you for requesting an appraisal. We have pulled recent comparative sales figures and local clearance trends for your area. We look forward to presenting your customized valuation report.\n\nWarm regards,\nRay White Advisory Team (${targetCustomEmail})`,
    },
    {
      title: 'Direct Callback',
      text: `Hello ${selectedRequest?.client.name || 'there'},\n\nThank you for your message. An accredited Ray White Principal has been assigned to your file and will phone you directly today to discuss your property requirements.\n\nWarm regards,\nRay White Team (${targetCustomEmail})`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-neutral-900 flex flex-col font-sans">
      {/* Top Global Command Bar */}
      <header className="bg-neutral-950 text-white border-b border-neutral-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSite}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Site</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FFD200] text-neutral-950 font-black text-xs flex items-center justify-center shadow-xs">
                RW
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-none flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-blue-400" />
                    <span>Ray White Inbox &amp; Messages</span>
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Visitor Notifications
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                  <span>Custom Inbound Channel:</span>
                  <span className="text-[#FFD200] font-mono font-bold">{targetCustomEmail}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Visitor Unread Replies Pill */}
            {visitorUnreadReplyCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 animate-pulse">
                <Bell className="w-3.5 h-3.5 text-red-400" />
                <span>Unread Replies:</span>
                <span className="px-1.5 py-0.2 rounded-full font-black text-[11px] bg-red-600 text-white">
                  {visitorUnreadReplyCount}
                </span>
              </div>
            )}

            {/* Quick Stat Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
              <Mail className="w-3.5 h-3.5 text-[#FFD200]" />
              <span>Pending Replies:</span>
              <span className="px-1.5 py-0.2 rounded-full font-black text-[11px] bg-amber-400 text-neutral-950">
                {unrepliedCount}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsComposeModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-blue-500 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Compose Message</span>
            </button>
          </div>
        </div>
      </header>

      {/* Reply Success Toast */}
      {replySuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 border border-emerald-500/40 animate-in fade-in slide-in-from-top-3">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>{replySuccessToast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Sub-header Banner: Routing Details */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/90 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Direct Communications Hub
              </div>
              <div className="text-sm sm:text-base font-extrabold text-neutral-900 flex items-center gap-2 flex-wrap">
                <span>All website enquiries, chats &amp; appraisal bookings route to:</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 font-mono font-bold border border-blue-200 text-xs">
                  {targetCustomEmail}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>In-site persistent storage · Instant replies dispatched directly from this portal</span>
          </div>
        </div>

        {/* 2-Column Split: Message Inbound List (Left) & Active Chat / Reply Box (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          {/* Left Column (5 cols): Inbound Messages Feed */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col h-[750px] max-h-[85vh]">
            {/* List Controls: Search & Filter Tabs */}
            <div className="p-3.5 border-b border-neutral-200 space-y-3 bg-neutral-50/70">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by client, email, message..."
                  className="w-full bg-white border border-neutral-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                    filterTab === 'all'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
                  }`}
                >
                  All ({requests.length})
                </button>
                <button
                  onClick={() => setFilterTab('needs_reply')}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                    filterTab === 'needs_reply'
                      ? 'bg-amber-500 text-neutral-950 font-black'
                      : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span>Needs Reply ({unrepliedCount})</span>
                </button>
                <button
                  onClick={() => setFilterTab('replied')}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                    filterTab === 'replied'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                  }`}
                >
                  Replied
                </button>
                <button
                  onClick={() => setFilterTab('contact')}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                    filterTab === 'contact'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
                  }`}
                >
                  Contact Form
                </button>
              </div>
            </div>

            {/* Inbound Message List Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 p-2 space-y-1.5">
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center space-y-2 text-neutral-400">
                  <Mail className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs font-semibold">No messages match your search or filter.</p>
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedRequest?.id === req.id;
                  const hasReplies = req.replies && req.replies.length > 0;

                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequestId(req.id)}
                      className={`p-3 rounded-xl transition-all cursor-pointer border text-left space-y-2 ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-400 shadow-xs ring-1 ring-blue-400/20'
                          : 'bg-white border-neutral-200/70 hover:bg-neutral-50 hover:border-neutral-300'
                      }`}
                    >
                      {/* Top: Client Name & Status Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {req.client.name.charAt(0)}
                          </div>
                          <span className="font-bold text-xs text-neutral-900 truncate">
                            {req.client.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {hasReplies ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Replied ({req.replies?.length})</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Needs Reply</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Client Email & Property Sub-text */}
                      <div className="text-[11px] text-neutral-500 flex items-center justify-between">
                        <span className="truncate">{req.client.email}</span>
                        <span className="font-mono text-[10px] text-neutral-400">
                          {new Date(req.createdAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Message preview snippet */}
                      <p className="text-xs text-neutral-700 line-clamp-2 leading-relaxed font-normal bg-neutral-50/60 p-1.5 rounded-lg border border-neutral-100">
                        {req.details.message || req.details.subject || 'Client enquiry received through Ray White portal.'}
                      </p>

                      {/* Routing Tag Footer */}
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                        <span className="px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 font-medium">
                          {req.type.toUpperCase()}
                        </span>
                        <span className="text-blue-700 font-mono font-medium truncate max-w-[190px]">
                          → {req.targetEmail || targetCustomEmail}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column (7 cols): Active Conversation & Interactive Reply Composer */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col h-[750px] max-h-[85vh]">
            {selectedRequest ? (
              <>
                {/* Active Message Header */}
                <div className="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-neutral-900">
                        {selectedRequest.client.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-neutral-200 text-neutral-800">
                        {selectedRequest.id}
                      </span>
                      {selectedRequest.replies && selectedRequest.replies.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Replied
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900">
                          Pending Reply
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <a href={`mailto:${selectedRequest.client.email}`} className="text-blue-600 hover:underline">
                          {selectedRequest.client.email}
                        </a>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <a href={`tel:${selectedRequest.client.phone}`} className="hover:text-neutral-900">
                          {selectedRequest.client.phone}
                        </a>
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Direct Inbound Destination
                    </div>
                    <div className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 inline-block mt-0.5">
                      {selectedRequest.targetEmail || targetCustomEmail}
                    </div>
                  </div>
                </div>

                {/* Property Context Banner (if linked to a specific listing) */}
                {selectedRequest.propertyAddress && (
                  <div className="px-4 py-2.5 bg-neutral-100/70 border-b border-neutral-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-neutral-800 font-semibold truncate">
                      <Home className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate">Regarding: {selectedRequest.propertyAddress}, {selectedRequest.propertySuburb}</span>
                      {selectedRequest.propertyPrice && (
                        <span className="text-neutral-500 font-normal">({selectedRequest.propertyPrice})</span>
                      )}
                    </div>
                    {selectedRequest.propertyId && onNavigateToProperty && (
                      <button
                        type="button"
                        onClick={() => onNavigateToProperty(selectedRequest.propertyId!)}
                        className="text-blue-600 hover:underline font-bold text-[11px] shrink-0 flex items-center gap-1"
                      >
                        <span>View Listing</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Conversation History Thread Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FBFBFC]">
                  {/* Client Initial Inbound Message */}
                  <div className="flex flex-col items-start max-w-[92%] sm:max-w-[85%]">
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="font-bold text-xs text-neutral-900">{selectedRequest.client.name}</span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(selectedRequest.createdAt).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    <div className="bg-white border border-neutral-200 p-4 rounded-2xl rounded-tl-xs shadow-2xs space-y-2 text-xs sm:text-sm text-neutral-800 leading-relaxed">
                      {selectedRequest.details.subject && (
                        <div className="font-bold text-neutral-900 pb-1 border-b border-neutral-100">
                          {selectedRequest.details.subject}
                        </div>
                      )}
                      <p className="whitespace-pre-line">
                        {selectedRequest.details.message || 'Client submitted an inquiry through the Ray White portal.'}
                      </p>

                      {/* Extra details if offer or inspection */}
                      {selectedRequest.details.offerAmount && (
                        <div className="mt-2 pt-2 border-t border-neutral-100 text-xs font-bold text-amber-800 bg-amber-50 p-2 rounded-lg">
                          Offer Amount: ${selectedRequest.details.offerAmount.toLocaleString()} AUD
                        </div>
                      )}
                      {selectedRequest.details.requestedDate && (
                        <div className="mt-2 pt-2 border-t border-neutral-100 text-xs font-bold text-blue-800 bg-blue-50 p-2 rounded-lg">
                          Requested Slot: {selectedRequest.details.requestedDate} at {selectedRequest.details.requestedTime || 'Morning'}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-1 px-1 font-mono">
                      Received via direct routing → {selectedRequest.targetEmail || targetCustomEmail}
                    </span>
                  </div>

                  {/* Staff Replies Stream */}
                  {selectedRequest.replies && selectedRequest.replies.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <div className="relative text-center">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-neutral-200" />
                        </div>
                        <span className="relative bg-[#FBFBFC] px-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          Replies from {targetCustomEmail}
                        </span>
                      </div>

                      {selectedRequest.replies.map((reply) => (
                        <div key={reply.id} className="flex flex-col items-end ml-auto max-w-[92%] sm:max-w-[85%]">
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="font-black text-xs text-blue-900 flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full bg-[#FFD200] text-neutral-950 font-black text-[9px] flex items-center justify-center">RW</span>
                              <span>{reply.senderName}</span>
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {new Date(reply.sentAt).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </div>

                          <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-xs shadow-md space-y-1 text-xs sm:text-sm leading-relaxed border border-blue-500">
                            <div className="text-[10px] font-mono text-blue-100 pb-1 border-b border-blue-500 flex items-center justify-between">
                              <span>From: {reply.senderEmail}</span>
                              <span>To: {reply.recipientEmail}</span>
                            </div>
                            <p className="whitespace-pre-line pt-1 text-white">
                              {reply.message}
                            </p>
                          </div>

                          <span className="text-[10px] text-emerald-600 font-bold mt-1 px-1 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Delivered directly from {targetCustomEmail}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interactive Reply Workspace Composer */}
                <div className="p-3.5 sm:p-4 border-t border-neutral-200 bg-white space-y-3">
                  {/* Quick templates pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 shrink-0">
                      Templates:
                    </span>
                    {quickReplyTemplates.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReplyText(tmpl.text)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-100 hover:bg-[#FFD200]/30 hover:border-[#FFD200] text-neutral-700 border border-neutral-200 transition-colors shrink-0 cursor-pointer"
                      >
                        {tmpl.title}
                      </button>
                    ))}
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSendReplySubmit} className="space-y-2">
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Type your reply to ${selectedRequest.client.name}... (will be dispatched from ${targetCustomEmail})`}
                        className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl p-3 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                        <span className="font-semibold text-neutral-700">Dispatching as:</span>
                        <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {targetCustomEmail}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {replyText && (
                          <button
                            type="button"
                            onClick={() => setReplyText('')}
                            className="px-3 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-800 cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={!replyText.trim() || isSendingReply}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-blue-500 active:scale-95"
                        >
                          {isSendingReply ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Dispatching Reply...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Send Reply from {targetCustomEmail}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 space-y-3">
                <MessageSquare className="w-12 h-12 opacity-30" />
                <h3 className="font-bold text-base text-neutral-700">Select a Conversation</h3>
                <p className="text-xs max-w-sm">
                  Choose any incoming message on the left or compose a new direct message to start a conversation thread from {targetCustomEmail}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Outbound New Direct Message Modal */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-4 border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsComposeModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-base text-neutral-900">Compose Outbound Message</h3>
                <p className="text-xs text-neutral-500">
                  Sending from: <span className="font-mono text-blue-700 font-bold">{targetCustomEmail}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleComposeSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={composeName}
                    onChange={(e) => setComposeName(e.target.value)}
                    placeholder="e.g. Sir Arthur Sterling"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Recipient Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={composeEmail}
                    onChange={(e) => setComposeEmail(e.target.value)}
                    placeholder="client@domain.com"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Recipient Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={composePhone}
                  onChange={(e) => setComposePhone(e.target.value)}
                  placeholder="+61 400 000 000"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="e.g. Private Viewing Invitation / Market Update"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Message Body *
                </label>
                <textarea
                  rows={4}
                  required
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  placeholder="Type your message from contact@raywhiterealestate.com..."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposeModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-blue-500"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send as {targetCustomEmail}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
