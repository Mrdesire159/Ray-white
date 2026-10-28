import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, MapPin, User, Mail, Send, Sparkles, ShieldCheck } from 'lucide-react';
import { AdminRequest } from '../../types/request';
import { AGENTS } from '../../data/agents';

interface ApproveModalProps {
  request: AdminRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmApprove: (id: string, payload: {
    decisionNote?: string;
    assignedAgentId?: string;
    scheduledDateTime?: string;
    meetingLocation?: string;
  }) => void;
}

export const ApproveModal: React.FC<ApproveModalProps> = ({
  request,
  isOpen,
  onClose,
  onConfirmApprove,
}) => {
  if (!isOpen || !request) return null;

  const [assignedAgentId, setAssignedAgentId] = useState(
    request.assignedAgentId || AGENTS[0].id
  );
  const [scheduledDateTime, setScheduledDateTime] = useState(
    request.details.requestedDate && request.details.requestedTime
      ? `${request.details.requestedDate} at ${request.details.requestedTime}`
      : 'Saturday 24 Oct, 11:30 AM'
  );
  const [meetingLocation, setMeetingLocation] = useState(
    request.propertyAddress
      ? `${request.propertyAddress}, ${request.propertySuburb}`
      : 'Ray White Flagship Office, Double Bay'
  );
  const [decisionNote, setDecisionNote] = useState(
    request.type === 'appraisal'
      ? 'Appraisal booking confirmed. Assigned agent will conduct an in-person comparative market analysis and present vendor sales campaign recommendations.'
      : request.type === 'offer'
      ? 'Formal offer accepted for review and vendor contract presentation. Prepared for 66W exchange.'
      : 'VIP private inspection approved. Access credentials and escort agent confirmed.'
  );
  const [sendNotification, setSendNotification] = useState(true);

  const selectedAgent = AGENTS.find((a) => a.id === assignedAgentId) || AGENTS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmApprove(request.id, {
      assignedAgentId,
      scheduledDateTime,
      meetingLocation,
      decisionNote,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Approve Request</h3>
              <p className="text-xs text-emerald-100 font-medium">{request.id} • {request.client.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="uppercase tracking-wider text-[10px] text-emerald-800 font-black">
                {request.type.toUpperCase()} REQUEST
              </span>
              <span className="text-emerald-700">{request.propertySuburb || 'General'}</span>
            </div>
            <div className="text-sm font-extrabold text-neutral-900">
              {request.propertyAddress ? `${request.propertyAddress}, ${request.propertySuburb}` : request.details.subject || 'Client Inquiry'}
            </div>
            {request.details.offerAmount && (
              <div className="text-xs font-black text-emerald-700">
                Offer Amount: ${request.details.offerAmount.toLocaleString()} AUD
              </div>
            )}
            {request.details.estimatedValueRange && (
              <div className="text-xs font-semibold text-neutral-700">
                Estimated Valuation: ${request.details.estimatedValueRange.low.toLocaleString()} - ${request.details.estimatedValueRange.high.toLocaleString()}
              </div>
            )}
          </div>

          {/* Assigned Agent Picker */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-2">
              Assign Responsible Ray White Executive
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AGENTS.map((agent) => (
                <button
                  type="button"
                  key={agent.id}
                  onClick={() => setAssignedAgentId(agent.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    assignedAgentId === agent.id
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-neutral-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-neutral-900 truncate">{agent.name}</div>
                    <div className="text-[10px] text-neutral-500 truncate">{agent.role.split('&')[0]}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scheduled Date & Time (if tour or appraisal) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-neutral-700 mb-1">
                Scheduled Appointment
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  placeholder="e.g. Saturday 24 Oct, 11:30 AM"
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-neutral-700 mb-1">
                Meeting / Showing Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  placeholder="Address or Office location"
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Decision Note / Message to Client */}
          <div>
            <label className="block text-xs font-black text-neutral-700 mb-1">
              Official Approval Note &amp; Instructions
            </label>
            <textarea
              rows={3}
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              className="w-full p-3 text-xs text-neutral-800 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              placeholder="Provide confirmation details..."
              required
            />
          </div>

          {/* Send Email Notification Toggle */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-xs font-bold text-neutral-900 block">Dispatch Client Notification</span>
                <span className="text-[10px] text-neutral-500 block">Sends branded approval email to {request.client.email}</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm &amp; Approve Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
