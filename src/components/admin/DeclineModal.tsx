import React, { useState } from 'react';
import { X, AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { AdminRequest } from '../../types/request';

interface DeclineModalProps {
  request: AdminRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDecline: (id: string, reason: string, note?: string) => void;
}

const COMMON_REASONS = [
  'Offer significantly below vendor reserve price',
  'Requested inspection time slot fully booked',
  'Property is currently under deposit or contract exchanged',
  'Property location outside Ray White Australasia licensed operational territory',
  'Incomplete client contact credentials / unverified phone number',
  'Vendor declined private walkthrough prior to public scheduled auction',
  'Custom reason',
];

export const DeclineModal: React.FC<DeclineModalProps> = ({
  request,
  isOpen,
  onClose,
  onConfirmDecline,
}) => {
  if (!isOpen || !request) return null;

  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [internalNote, setInternalNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Custom reason' ? customReason : selectedReason;
    if (!finalReason.trim()) return;
    onConfirmDecline(request.id, finalReason, internalNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-700 to-red-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Decline Request</h3>
              <p className="text-xs text-rose-100 font-medium">{request.id} • {request.client.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-neutral-600 leading-relaxed">
            Declining this request will transition status to <strong className="text-rose-700">Declined</strong>, append the rationale to the chronological audit log, and update team records.
          </p>

          {/* Reason Select */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
              Select Primary Decline Reason
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full p-2.5 text-xs font-bold rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              {COMMON_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Reason if selected */}
          {selectedReason === 'Custom reason' && (
            <div>
              <label className="block text-xs font-black text-neutral-700 mb-1">
                Custom Specific Reason
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="State specific reason..."
                className="w-full p-2.5 text-xs font-medium rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
          )}

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-black text-neutral-700 mb-1">
              Internal Executive Note (Optional)
            </label>
            <textarea
              rows={3}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="e.g. Advised client of upcoming auctions; added to reserve price watchlist."
              className="w-full p-3 text-xs text-neutral-800 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Confirm Decline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
