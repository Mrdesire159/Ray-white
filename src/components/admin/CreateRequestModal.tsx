import React, { useState } from 'react';
import { X, PlusCircle, Building, User, Phone, Mail, DollarSign, Calendar, MapPin, Sparkles } from 'lucide-react';
import { RequestPriority, RequestType } from '../../types/request';
import { PROPERTIES } from '../../data/properties';
import { AGENTS } from '../../data/agents';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (requestData: {
    type: RequestType;
    priority: RequestPriority;
    client: {
      name: string;
      email: string;
      phone: string;
      preferredContact: 'email' | 'phone' | 'any';
    };
    propertyId?: string;
    propertyTitle?: string;
    propertyAddress?: string;
    propertySuburb?: string;
    propertyPrice?: string;
    propertyImage?: string;
    details: {
      propertyType?: string;
      bedrooms?: number;
      bathrooms?: number;
      carSpaces?: number;
      offerAmount?: number;
      requestedDate?: string;
      requestedTime?: string;
      message?: string;
      preferredOffice?: string;
    };
    assignedAgentId?: string;
  }) => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<RequestType>('appraisal');
  const [priority, setPriority] = useState<RequestPriority>('normal');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<'email' | 'phone' | 'any'>('phone');

  // Property Selection
  const [propertySelectionMode, setPropertySelectionMode] = useState<'existing' | 'custom'>('existing');
  const [selectedPropertyId, setSelectedPropertyId] = useState(PROPERTIES[0].id);
  const [customAddress, setCustomAddress] = useState('');
  const [customSuburb, setCustomSuburb] = useState('Point Piper');
  const [customType, setCustomType] = useState('House');

  // Specifics
  const [offerAmount, setOfferAmount] = useState<number>(4500000);
  const [requestedDate, setRequestedDate] = useState('2026-10-26');
  const [requestedTime, setRequestedTime] = useState('11:00 AM');
  const [message, setMessage] = useState('');
  const [assignedAgentId, setAssignedAgentId] = useState(AGENTS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) return;

    let propertyData = {};
    if (propertySelectionMode === 'existing') {
      const prop = PROPERTIES.find((p) => p.id === selectedPropertyId);
      if (prop) {
        propertyData = {
          propertyId: prop.id,
          propertyTitle: prop.title,
          propertyAddress: prop.address,
          propertySuburb: prop.suburb,
          propertyPrice: prop.priceDisplay,
          propertyImage: prop.images[0],
        };
      }
    } else {
      propertyData = {
        propertyAddress: customAddress,
        propertySuburb: customSuburb,
      };
    }

    onCreate({
      type,
      priority,
      client: {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        preferredContact,
      },
      ...propertyData,
      details: {
        propertyType: customType,
        offerAmount: type === 'offer' ? offerAmount : undefined,
        requestedDate: type === 'inspection' ? requestedDate : undefined,
        requestedTime: type === 'inspection' ? requestedTime : undefined,
        message,
        preferredOffice: 'Ray White Double Bay',
      },
      assignedAgentId,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFD200] text-neutral-950 font-black text-xs flex items-center justify-center">
              RW
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Create Manual Intake Request</h3>
              <p className="text-xs text-neutral-400">Log client telephone inquiry, VIP walk-in, or private referral</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Request Type Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-2">
              Request Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'appraisal', label: 'Appraisal', color: 'border-emerald-500 text-emerald-800 bg-emerald-50' },
                  { id: 'inspection', label: 'VIP Inspection', color: 'border-purple-500 text-purple-800 bg-purple-50' },
                  { id: 'offer', label: 'Buyer Offer', color: 'border-amber-500 text-amber-900 bg-amber-50' },
                  { id: 'contact', label: 'Consultation', color: 'border-blue-500 text-blue-800 bg-blue-50' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setType(tab.id)}
                  className={`p-2.5 rounded-xl border text-xs font-black text-center transition-all cursor-pointer ${
                    type === tab.id
                      ? `${tab.color} ring-2 ring-neutral-900/10 shadow-xs font-black`
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['urgent', 'high', 'normal'] as RequestPriority[]).map((pri) => (
                <button
                  key={pri}
                  type="button"
                  onClick={() => setPriority(pri)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    priority === pri
                      ? pri === 'urgent'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : pri === 'high'
                        ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-xs'
                        : 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {pri}
                </button>
              ))}
            </div>
          </div>

          {/* Client Details Section */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-neutral-600" />
              <span>Client Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Client Full Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Lady Genevieve Sterling"
                  className="w-full p-2.5 text-xs font-bold rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="g.sterling@familyoffice.com"
                  className="w-full p-2.5 text-xs font-bold rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+61 412 000 111"
                  className="w-full p-2.5 text-xs font-bold rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Preferred Channel</label>
                <select
                  value={preferredContact}
                  onChange={(e) => setPreferredContact(e.target.value as any)}
                  className="w-full p-2.5 text-xs font-bold rounded-xl border border-neutral-300 bg-white"
                >
                  <option value="phone">Telephone Call</option>
                  <option value="email">Email</option>
                  <option value="any">Any / SMS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Property Association */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-neutral-600" />
                <span>Associated Residence</span>
              </span>
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setPropertySelectionMode('existing')}
                  className={`px-2 py-0.5 rounded-md ${
                    propertySelectionMode === 'existing'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  From Portfolio
                </button>
                <button
                  type="button"
                  onClick={() => setPropertySelectionMode('custom')}
                  className={`px-2 py-0.5 rounded-md ${
                    propertySelectionMode === 'custom'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Custom Address
                </button>
              </div>
            </div>

            {propertySelectionMode === 'existing' ? (
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-bold bg-white"
              >
                {PROPERTIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.address}, {p.suburb} — {p.priceDisplay} ({p.type})
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="Street Address (e.g. 24 Ocean Street)"
                  className="w-full p-2.5 text-xs font-bold rounded-xl border border-neutral-300 bg-white"
                  required
                />
                <input
                  type="text"
                  value={customSuburb}
                  onChange={(e) => setCustomSuburb(e.target.value)}
                  placeholder="Suburb (e.g. Double Bay)"
                  className="w-full p-2.5 text-xs font-bold rounded-xl border border-neutral-300 bg-white"
                  required
                />
              </div>
            )}
          </div>

          {/* Type Specific Fields */}
          {type === 'offer' && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <label className="block text-xs font-black text-amber-950 uppercase tracking-wider">
                Offer Amount (AUD)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
                <input
                  type="number"
                  step="50000"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-sm font-black rounded-xl border border-amber-300 bg-white"
                  required
                />
              </div>
            </div>
          )}

          {type === 'inspection' && (
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-purple-950 mb-1">Date</label>
                <input
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="w-full p-2 text-xs font-bold rounded-xl border border-purple-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-purple-950 mb-1">Preferred Time</label>
                <input
                  type="text"
                  value={requestedTime}
                  onChange={(e) => setRequestedTime(e.target.value)}
                  placeholder="e.g. 2:00 PM"
                  className="w-full p-2 text-xs font-bold rounded-xl border border-purple-300 bg-white"
                />
              </div>
            </div>
          )}

          {/* Assigned Agent */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
              Pre-Assign Responsible Agent
            </label>
            <select
              value={assignedAgentId}
              onChange={(e) => setAssignedAgentId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-bold bg-white"
            >
              {AGENTS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.role.split('&')[0]} ({a.office})
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-black text-neutral-700 mb-1">
              Intake Notes &amp; Client Instructions
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Record caller notes, urgency, background details..."
              className="w-full p-3 text-xs rounded-xl border border-neutral-300 font-medium"
            />
          </div>

          {/* Footer */}
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
              className="px-5 py-2.5 text-xs font-black text-neutral-950 bg-gradient-to-r from-amber-400 via-[#FFD200] to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
