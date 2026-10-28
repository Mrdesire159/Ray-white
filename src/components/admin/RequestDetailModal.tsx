import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Home,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  MessageSquare,
  ShieldCheck,
  Building,
  Sparkles,
  Bed,
  Bath,
  Car,
  Trash2,
  Tag,
} from 'lucide-react';
import { AdminRequest, RequestPriority, RequestStatus } from '../../types/request';
import { AGENTS } from '../../data/agents';

interface RequestDetailModalProps {
  request: AdminRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenApprove: (request: AdminRequest) => void;
  onOpenDecline: (request: AdminRequest) => void;
  onComplete: (id: string, note?: string) => void;
  onAssignAgent: (requestId: string, agentId: string) => void;
  onUpdatePriority: (requestId: string, priority: RequestPriority) => void;
  onAddNote: (requestId: string, noteText: string) => void;
  onDelete: (id: string) => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  isOpen,
  onClose,
  onOpenApprove,
  onOpenDecline,
  onComplete,
  onAssignAgent,
  onUpdatePriority,
  onAddNote,
  onDelete,
}) => {
  if (!isOpen || !request) return null;

  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'audit'>('details');
  const [newNoteText, setNewNoteText] = useState('');

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(request.id, newNoteText);
    setNewNoteText('');
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-900 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Declined
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-neutral-100 text-neutral-800 border border-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
            Completed
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: RequestPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'normal':
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-5 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFD200] text-neutral-950 font-black text-xs flex items-center justify-center shadow-xs">
              RW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">{request.id}</span>
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-[#FFD200]">
                  {request.type}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPriorityBadge(request.priority)}`}>
                  {request.priority}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Submitted {new Date(request.createdAt).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(request.status)}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-6 border-b border-neutral-200 bg-neutral-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3.5 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'border-neutral-950 text-neutral-950 font-black bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Request Overview &amp; Specs
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3.5 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-neutral-950 text-neutral-950 font-black bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Agent Notes</span>
            <span className="w-4.5 h-4.5 rounded-full bg-neutral-200 text-neutral-800 text-[10px] flex items-center justify-center font-bold">
              {request.notes.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3.5 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-neutral-950 text-neutral-950 font-black bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Audit Trail &amp; History</span>
            <span className="w-4.5 h-4.5 rounded-full bg-neutral-200 text-neutral-800 text-[10px] flex items-center justify-center font-bold">
              {request.auditLog.length}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 cols: Client & Request Payload */}
              <div className="lg:col-span-7 space-y-6">
                {/* Client Profile Box */}
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Client Credentials</span>
                  </h4>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-extrabold text-neutral-950">{request.client.name}</div>
                      <div className="text-xs text-neutral-500 font-medium">Preferred Contact: {request.client.preferredContact || 'Any'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200 text-xs">
                    <a
                      href={`mailto:${request.client.email}`}
                      className="p-2.5 rounded-xl bg-white border border-neutral-200 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-2 font-bold"
                    >
                      <Mail className="w-4 h-4 text-neutral-400" />
                      <span className="truncate">{request.client.email}</span>
                    </a>
                    <a
                      href={`tel:${request.client.phone}`}
                      className="p-2.5 rounded-xl bg-white border border-neutral-200 hover:border-emerald-400 hover:text-emerald-700 transition-all flex items-center gap-2 font-bold"
                    >
                      <Phone className="w-4 h-4 text-neutral-400" />
                      <span>{request.client.phone}</span>
                    </a>
                  </div>
                </div>

                {/* Specific Payload Details */}
                <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Request Details</span>
                  </h4>

                  {/* Valuation / Appraisal Estimates */}
                  {request.details.estimatedValueRange && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                      <div className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                        Real-Time Estimated Valuation Bracket
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-emerald-950 tabular-nums">
                          ${request.details.estimatedValueRange.median.toLocaleString()} AUD
                        </span>
                        <span className="text-xs font-bold text-emerald-700">
                          Range: ${request.details.estimatedValueRange.low.toLocaleString()} - ${request.details.estimatedValueRange.high.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-800 font-medium">
                        Mode: {request.details.appraisalMode === 'in_person' ? 'In-Person Comprehensive CMA' : 'Digital Appraisal Report'}
                      </div>
                    </div>
                  )}

                  {/* Buyer Offer Terms */}
                  {request.details.offerAmount && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                      <div className="text-xs font-black text-amber-900 uppercase tracking-wider">
                        Purchase Offer Terms
                      </div>
                      <div className="text-2xl font-black text-amber-950 tabular-nums">
                        ${request.details.offerAmount.toLocaleString()} AUD
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px] text-amber-900 font-bold pt-1 border-t border-amber-200/60">
                        <div>Finance: {request.details.financeApproved ? 'Pre-Approved' : 'Unconfirmed'}</div>
                        <div>Deposit: {request.details.depositPercentage || 10}%</div>
                        <div>Settlement: {request.details.settlementDays || 42} Days</div>
                      </div>
                    </div>
                  )}

                  {/* Inspection / Walkthrough Schedule */}
                  {(request.details.requestedDate || request.details.requestedTime) && (
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                      <div className="text-xs font-black text-blue-900 uppercase tracking-wider">
                        Requested Inspection Slot
                      </div>
                      <div className="text-sm font-black text-blue-950">
                        {request.details.requestedDate} at {request.details.requestedTime}
                      </div>
                      <div className="text-[11px] text-blue-800 font-medium">
                        Attendees: {request.details.attendeesCount || 2} Persons • Type: {request.details.inspectionType || 'Private VIP'}
                      </div>
                    </div>
                  )}

                  {/* Specs Pill Bar */}
                  {(request.details.bedrooms || request.details.propertyType) && (
                    <div className="flex items-center gap-3 text-xs font-bold text-neutral-700 py-2 border-y border-neutral-100">
                      <span className="font-extrabold text-neutral-900">{request.details.propertyType}</span>
                      {request.details.bedrooms && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-indigo-500" />
                          {request.details.bedrooms} Beds
                        </span>
                      )}
                      {request.details.bathrooms && (
                        <span className="flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-cyan-500" />
                          {request.details.bathrooms} Baths
                        </span>
                      )}
                      {request.details.carSpaces && (
                        <span className="flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-amber-500" />
                          {request.details.carSpaces} Cars
                        </span>
                      )}
                    </div>
                  )}

                  {/* Client Message */}
                  {request.details.message && (
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-neutral-500">Client Statement / Special Notes</div>
                      <p className="text-xs font-medium text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-200 leading-relaxed italic">
                        "{request.details.message}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Approved Decision Card (if approved) */}
                {request.approvalDetails && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-emerald-900">
                      <span>APPROVAL CONFIRMATION</span>
                      <span className="text-emerald-700">{new Date(request.approvalDetails.approvedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-neutral-800">
                      <strong>Approved By:</strong> {request.approvalDetails.approvedBy}
                    </div>
                    {request.approvalDetails.scheduledDateTime && (
                      <div className="text-xs text-neutral-800">
                        <strong>Scheduled:</strong> {request.approvalDetails.scheduledDateTime}
                      </div>
                    )}
                    {request.approvalDetails.meetingLocation && (
                      <div className="text-xs text-neutral-800">
                        <strong>Location:</strong> {request.approvalDetails.meetingLocation}
                      </div>
                    )}
                    {request.approvalDetails.decisionNote && (
                      <p className="text-xs text-emerald-950 font-medium italic mt-1 bg-white/70 p-2.5 rounded-lg border border-emerald-200">
                        "{request.approvalDetails.decisionNote}"
                      </p>
                    )}
                  </div>
                )}

                {/* Declined Record (if declined) */}
                {request.rejectionDetails && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-rose-900">
                      <span>DECLINE RECORD</span>
                      <span className="text-rose-700">{new Date(request.rejectionDetails.rejectedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs font-bold text-rose-950">
                      Reason: {request.rejectionDetails.reason}
                    </div>
                    {request.rejectionDetails.rejectionNote && (
                      <p className="text-xs text-rose-900 font-medium italic mt-1 bg-white/70 p-2.5 rounded-lg border border-rose-200">
                        "{request.rejectionDetails.rejectionNote}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Right 5 cols: Associated Property & Agent Assignment */}
              <div className="lg:col-span-5 space-y-6">
                {/* Associated Property Card */}
                {request.propertyAddress && (
                  <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
                    <div className="relative aspect-video w-full bg-neutral-100">
                      {request.propertyImage ? (
                        <img
                          src={request.propertyImage}
                          alt={request.propertyAddress}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-white font-bold text-xs">
                          Ray White Verified Property
                        </div>
                      )}
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-neutral-950/80 backdrop-blur-md text-white text-[10px] font-black">
                        {request.propertySuburb}
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <div className="text-sm font-extrabold text-neutral-900 leading-tight">
                        {request.propertyAddress}
                      </div>
                      <div className="text-xs text-neutral-500 font-semibold">
                        {request.propertySuburb}, {request.propertyState || 'NSW'}
                      </div>
                      {request.propertyPrice && (
                        <div className="text-base font-black text-neutral-950 pt-1">
                          {request.propertyPrice}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Priority Selector */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-500">
                    Priority Rating
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['urgent', 'high', 'normal'] as RequestPriority[]).map((pri) => (
                      <button
                        key={pri}
                        type="button"
                        onClick={() => onUpdatePriority(request.id, pri)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                          request.priority === pri
                            ? pri === 'urgent'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                              : pri === 'high'
                              ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-xs'
                              : 'bg-neutral-800 text-white border-neutral-800'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {pri}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assigned Agent Card */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-500">
                      Assigned Executive
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400">Reassign:</span>
                  </div>

                  <select
                    value={request.assignedAgentId || ''}
                    onChange={(e) => onAssignAgent(request.id, e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    <option value="" disabled>Select Ray White Agent...</option>
                    {AGENTS.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} — {agent.office}
                      </option>
                    ))}
                  </select>

                  {request.assignedAgentId && (
                    <div className="p-3 bg-white rounded-xl border border-neutral-200 flex items-center gap-3">
                      <img
                        src={request.assignedAgentAvatar || AGENTS[0].avatar}
                        alt={request.assignedAgentName}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-neutral-200"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-neutral-900 truncate">
                          {request.assignedAgentName}
                        </div>
                        <div className="text-[10px] text-neutral-500 truncate">
                          {request.assignedAgentEmail}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-5">
              {/* Add Note Form */}
              <form onSubmit={handleAddNoteSubmit} className="space-y-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                <label className="block text-xs font-black text-neutral-800">
                  Add Executive Agent Note
                </label>
                <textarea
                  rows={2}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record call summary, vendor feedback, or action items..."
                  className="w-full p-3 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>

              {/* Notes Thread */}
              <div className="space-y-3">
                {request.notes.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-400 font-medium">
                    No internal notes attached to this request yet.
                  </div>
                ) : (
                  request.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-xl bg-white border border-neutral-200 space-y-1.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-neutral-900">{note.author}</span>
                        <span className="text-[10px] text-neutral-400">
                          {new Date(note.createdAt).toLocaleString('en-AU', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                        {note.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-neutral-500 mb-2">Chronological Activity &amp; Audit Log</div>
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                {request.auditLog.map((log, index) => (
                  <div key={index} className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-neutral-900 ring-4 ring-white" />
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-neutral-900">
                        <span>{log.action}</span>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          {new Date(log.timestamp).toLocaleString('en-AU', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-600">
                        Actor: <span className="font-semibold">{log.actor}</span>
                      </div>
                      {log.details && (
                        <div className="text-[11px] text-neutral-700 font-medium pt-1 border-t border-neutral-200/70">
                          {log.details}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="px-6 py-4 bg-white border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Delete this request from database?')) {
                onDelete(request.id);
                onClose();
              }
            }}
            className="text-xs font-bold text-neutral-400 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove</span>
          </button>

          <div className="flex items-center gap-2.5">
            {request.status !== 'completed' && (
              <button
                type="button"
                onClick={() => {
                  onComplete(request.id, 'Marked completed by admin.');
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors cursor-pointer"
              >
                Mark Completed
              </button>
            )}

            {request.status !== 'declined' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDecline(request);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
              >
                Decline
              </button>
            )}

            {request.status !== 'approved' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenApprove(request);
                }}
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Request</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
