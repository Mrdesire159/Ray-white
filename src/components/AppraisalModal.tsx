import React, { useState } from 'react';
import { X, CheckCircle, Home, Calculator, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { PropertyType } from '../types/property';
import { PROPERTY_TYPES, SUBURBS } from '../data/properties';
import { useRequests } from '../context/RequestContext';

interface AppraisalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppraisalModal: React.FC<AppraisalModalProps> = ({ isOpen, onClose }) => {
  const { addRequest } = useRequests();
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2>(1);
  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState(SUBURBS[0]);
  const [propertyType, setPropertyType] = useState<PropertyType>('House');
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [carSpaces, setCarSpaces] = useState(1);
  const [appraisalType, setAppraisalType] = useState<'digital' | 'in_person'>('in_person');

  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Dynamic estimate generator based on inputs
  const calculateEstimatedValue = () => {
    let base = 1200000;
    if (suburb === 'Point Piper' || suburb === 'Double Bay') base = 3500000;
    else if (suburb === 'Sydney CBD' || suburb === 'Mosman' || suburb === 'Bronte') base = 2800000;
    else if (suburb === 'Paddington' || suburb === 'Surry Hills') base = 2200000;
    else base = 1750000;

    const bedAdd = bedrooms * 280000;
    const bathAdd = bathrooms * 120000;
    const carAdd = carSpaces * 90000;

    const median = base + bedAdd + bathAdd + carAdd;
    const low = Math.round((median * 0.94) / 10000) * 10000;
    const high = Math.round((median * 1.07) / 10000) * 10000;

    return { low, high, median };
  };

  const estimates = calculateEstimatedValue();

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName || !ownerEmail || !ownerPhone) return;

    addRequest({
      type: 'appraisal',
      priority: 'high',
      client: {
        name: ownerName,
        email: ownerEmail,
        phone: ownerPhone,
        preferredContact: 'phone',
      },
      propertyAddress: address,
      propertySuburb: suburb,
      propertyState: 'NSW',
      details: {
        propertyType,
        bedrooms,
        bathrooms,
        carSpaces,
        appraisalMode: appraisalType,
        estimatedValueRange: estimates,
        preferredOffice: `Ray White ${suburb}`,
      },
    });

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-[#FFD200] text-neutral-950 font-bold text-xs flex items-center justify-center">
              RW
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Book a Property Appraisal</h2>
              <p className="text-xs text-neutral-400">Ray White Benchmark Market Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close appraisal modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Appraisal Request Confirmed</h3>
              <p className="text-sm text-neutral-600 max-w-md mx-auto">
                Thank you, <strong>{ownerName}</strong>. Your request for{' '}
                <strong>{address}, {suburb}</strong> has been assigned to our local Ray White Principal.
              </p>

              {/* Instant Market Estimate Card */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-left space-y-2 mt-4">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Preliminary Automated Estimate
                </div>
                <div className="text-2xl font-extrabold text-neutral-900 tabular-nums">
                  ${estimates.low.toLocaleString()} – ${estimates.high.toLocaleString()}
                </div>
                <p className="text-xs text-neutral-500">
                  Our specialist agent will review recent off-market comps, zoning, and interior condition to prepare your verified comprehensive report.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-neutral-900 text-white font-bold text-xs rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="text-xs text-neutral-600">
                Step 1 of 2: Property Specifications
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 24 Oceanview Crescent"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Suburb *
                  </label>
                  <select
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  >
                    {SUBURBS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  >
                    {PROPERTY_TYPES.filter((t) => t !== 'All Types').map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specs Counters */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">Bedrooms</label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} Bed
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">Bathrooms</label>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-sm"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} Bath
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">Parking</label>
                  <select
                    value={carSpaces}
                    onChange={(e) => setCarSpaces(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-sm"
                  >
                    {[0, 1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num} Cars
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Appraisal Preference */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-neutral-700 mb-2">
                  Preferred Appraisal Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setAppraisalType('in_person')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                      appraisalType === 'in_person'
                        ? 'border-[#FFD200] bg-amber-50/50 ring-1 ring-[#FFD200]'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <UserCheck className="w-5 h-5 text-neutral-900 mb-1" />
                    <div className="text-xs font-bold text-neutral-900">In-Person Appraisal</div>
                    <div className="text-[11px] text-neutral-500 leading-snug">
                      Local agent inspects in person for maximum precision.
                    </div>
                  </div>

                  <div
                    onClick={() => setAppraisalType('digital')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                      appraisalType === 'digital'
                        ? 'border-[#FFD200] bg-amber-50/50 ring-1 ring-[#FFD200]'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <Calculator className="w-5 h-5 text-neutral-900 mb-1" />
                    <div className="text-xs font-bold text-neutral-900">Digital CMA Report</div>
                    <div className="text-[11px] text-neutral-500 leading-snug">
                      Instant algorithmic data pack delivered to email.
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#FFD200] hover:bg-[#E5BC00] active:scale-[0.98] text-neutral-950 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Continue to Owner Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-xs text-neutral-600 flex items-center justify-between">
                <span>Step 2 of 2: Contact Information</span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-neutral-500 underline"
                >
                  Back to Property
                </button>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg text-xs text-neutral-700 border border-neutral-200">
                <span className="font-bold">Target Property:</span> {address}, {suburb} (
                {bedrooms} bed, {bathrooms} bath)
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. David Sterling"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="david@example.com"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Mobile Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="0412 345 678"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#FFD200] hover:bg-[#E5BC00] active:scale-[0.98] text-neutral-950 font-bold text-sm rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  Confirm &amp; Request Appraisal
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-neutral-500 justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero obligation · 100% confidential appraisal</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
