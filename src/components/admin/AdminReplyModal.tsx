import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Mail,
  User,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
  Building,
  Check,
  MessageSquare,
  ShieldCheck,
  FileText,
  AlertCircle
} from 'lucide-react';
import { AdminRequest } from '../../types/request';
import { AGENTS } from '../../data/agents';

interface AdminReplyModalProps {
  request: AdminRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSendReply: (
    id: string,
    message: string,
    options?: { senderName?: string; senderEmail?: string; subject?: string }
  ) => Promise<boolean>;
  targetCustomEmail?: string;
}

export const AdminReplyModal: React.FC<AdminReplyModalProps> = ({
  request,
  isOpen,
  onClose,
  onSendReply,
  targetCustomEmail = 'contact@raywhiterealestate.com',
}) => {
  const [replyText, setReplyText] = useState('');
  const [subject, setSubject] = useState('');
  const [senderName, setSenderName] = useState(
    AGENTS[0]?.name ? `${AGENTS[0].name} | Principal` : 'Ray White Executive Team'
  );
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (request && isOpen) {
      setReplyText('');
      setSendSuccess(false);
      setSubject(
        `Re: ${request.details.subject || request.propertyAddress || 'Inquiry regarding ' + request.type}`
      );
      if (request.assignedAgentName) {
        setSenderName(`${request.assignedAgentName} | Ray White`);
      } else {
        setSenderName(`${AGENTS[0].name} | Principal`);
      }
      setTimeout(() => {
        textareaRef.current?.focus();
        threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [request, isOpen]);

  if (!isOpen || !request) return null;

  const cannedTemplates = [
    {
      title: '📅 Confirm Inspection',
      text: `Dear ${request.client.name},\n\nThank you for reaching out to Ray White. We are delighted to confirm your private walkthrough inspection for ${request.propertyAddress || 'the property'}. Our team will meet you at the premises and provide complete architectural dossiers.\n\nShould you need to adjust the scheduled time, please feel free to message back directly.\n\nWarm regards,\n${senderName}\n${targetCustomEmail}`,
    },
    {
      title: '🏡 Appraisal Consultation',
      text: `Dear ${request.client.name},\n\nWe have received your appraisal booking for ${request.propertyAddress || 'your property'}. We are compiling current benchmark sales and market intelligence for your suburb.\n\nOne of our executive partners will be in touch shortly to present a comprehensive comparative market assessment.\n\nBest regards,\n${senderName}\n${targetCustomEmail}`,
    },
    {
      title: '📝 Offer Acknowledgment',
      text: `Dear ${request.client.name},\n\nWe acknowledge receipt of your formal purchase offer on ${request.propertyAddress || 'the property'}. The contract terms and details have been transmitted directly to our vendors for immediate review.\n\nWe will update you with vendor instructions without delay.\n\nSincerely,\n${senderName}\n${targetCustomEmail}`,
    },
    {
      title: '💬 Direct General Reply',
      text: `Dear ${request.client.name},\n\nThank you for contacting Ray White. We have received your inquiry regarding ${request.details.subject || request.propertyAddress || 'our property listings'} and are assisting you directly through our central inbox.\n\nPlease let us know if you require additional floorplans, contracts for sale, or private inspection slots.\n\nKind regards,\n${senderName}\n${targetCustomEmail}`,
    },
  ];

  const handleApplyTemplate = (text: string) => {
    setReplyText(text);
    textareaRef.current?.focus();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || sending) return;

    setSending(true);
    try {
      const ok = await onSendReply(request.id, replyText.trim(), {
        senderName,
        senderEmail: targetCustomEmail,
        subject: subject.trim(),
      });
      if (ok) {
        setSendSuccess(true);
        setReplyText('');
        setTimeout(() => {
          threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } finally {
      setSending(false);
    }
  };

  const replies = request.replies || [];

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FFD200] text-neutral-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              RW
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Reply to {request.client.name}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-[#FFD200]">
                  {request.id}
                </span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {request.type}
                </span>
              </div>
              <p className="text-xs text-neutral-400 truncate mt-0.5">
                Official Inbound Dispatch: <strong className="text-white font-mono">{targetCustomEmail}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer shrink-0 ml-3"
            aria-label="Close reply modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client & Context Strip */}
        <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-neutral-700">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <strong className="text-neutral-900">{request.client.name}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-600">
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              <span>{request.client.email}</span>
            </div>
            {request.client.phone && (
              <div className="flex items-center gap-1.5 text-neutral-600">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                <span>{request.client.phone}</span>
              </div>
            )}
          </div>
          {request.propertyAddress && (
            <div className="text-[11px] font-bold text-neutral-500 truncate max-w-xs">
              📍 {request.propertyAddress}
            </div>
          )}
        </div>

        {/* Scrollable Thread & Messages Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-neutral-50/50">
          {/* Initial Client Submission Bubble */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-neutral-100">
              <span className="font-extrabold text-neutral-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Original Client Submission ({request.type.toUpperCase()})</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">
                {new Date(request.createdAt).toLocaleString('en-AU', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>

            {request.details.subject && (
              <div className="text-xs font-bold text-neutral-800">
                Subject: {request.details.subject}
              </div>
            )}

            <p className="text-xs text-neutral-700 leading-relaxed font-normal whitespace-pre-wrap">
              {request.details.message || `Client submitted inquiry regarding ${request.propertyAddress || request.type}.`}
            </p>

            {/* Quick summary chips */}
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-neutral-500">
              {request.details.offerAmount && (
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-bold border border-amber-200">
                  Offer: ${request.details.offerAmount.toLocaleString()} AUD
                </span>
              )}
              {request.details.requestedDate && (
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 font-bold border border-purple-200">
                  Requested Date: {request.details.requestedDate} @ {request.details.requestedTime}
                </span>
              )}
              {request.details.estimatedValueRange && (
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
                  Valuation Guide: ${(request.details.estimatedValueRange.median / 1000000).toFixed(2)}M
                </span>
              )}
            </div>
          </div>

          {/* Conversation Replies History */}
          {replies.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 text-center">
                Conversation History ({replies.length} message{replies.length === 1 ? '' : 's'})
              </div>

              {replies.map((reply) => {
                const isStaff = reply.direction === 'staff';
                return (
                  <div
                    key={reply.id}
                    className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-1.5 shadow-2xs ${
                        isStaff
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white text-neutral-900 border border-neutral-200 rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[11px] pb-1 border-b border-white/20">
                        <span className={`font-black ${isStaff ? 'text-[#FFD200]' : 'text-neutral-900'}`}>
                          {reply.senderName}
                        </span>
                        <span className={`text-[10px] ${isStaff ? 'text-blue-100' : 'text-neutral-400'}`}>
                          {new Date(reply.sentAt).toLocaleString('en-AU', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {reply.subject && (
                        <div className={`text-[11px] font-bold ${isStaff ? 'text-blue-100' : 'text-neutral-600'}`}>
                          {reply.subject}
                        </div>
                      )}

                      <p className="text-xs leading-relaxed whitespace-pre-wrap">
                        {reply.message}
                      </p>

                      <div className={`text-[9px] font-mono pt-1 text-right ${isStaff ? 'text-blue-200' : 'text-neutral-400'}`}>
                        via {reply.senderEmail}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {sendSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Reply dispatched successfully!</strong> A real-time toast notification was delivered to the visitor in-site.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSendSuccess(false)}
                className="text-emerald-700 font-bold hover:underline shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* Quick Canned Template Chips */}
        <div className="px-5 py-2.5 bg-neutral-100/80 border-t border-neutral-200 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FFD200]" />
            <span>Fast Templates:</span>
          </span>
          {cannedTemplates.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyTemplate(t.text)}
              className="px-2.5 py-1 bg-white hover:bg-neutral-200/80 border border-neutral-200 rounded-lg text-neutral-700 hover:text-neutral-950 font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
            >
              {t.title}
            </button>
          ))}
        </div>

        {/* Reply Compose Form */}
        <form onSubmit={handleSend} className="p-5 bg-white border-t border-neutral-200 space-y-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Dispatch As (Staff Identity)
              </label>
              <select
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
              >
                <option value={`${AGENTS[0]?.name || 'Julian Henderson'} | Principal`}>
                  {AGENTS[0]?.name || 'Julian Henderson'} (Principal)
                </option>
                <option value={`${AGENTS[1]?.name || 'Sophie Montgomery'} | Senior Auctioneer`}>
                  {AGENTS[1]?.name || 'Sophie Montgomery'} (Senior Auctioneer)
                </option>
                <option value="Ray White Executive Team">Ray White Executive Team</option>
                <option value="Ray White Client Care">Ray White Client Care</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject of reply..."
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Your Message Response
            </label>
            <textarea
              ref={textareaRef}
              rows={4}
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your official response to the client... (Click a fast template above for 1-click drafting)"
              className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200] resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Transmitted via <strong className="text-neutral-800 font-mono">{targetCustomEmail}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-blue-500"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>{sending ? 'Dispatching Reply...' : 'Send Reply Now'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
