import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  QrCode,
  Smartphone,
  Download,
  Copy,
  Check,
  UserCheck,
  ExternalLink,
  MapPin,
  Building,
  Phone,
  Mail,
  Share2,
  Sparkles,
  Info
} from 'lucide-react';
import QRCode from 'qrcode';
import { Property, Agent } from '../types/property';
import { getAgentById } from '../data/agents';

interface PropertyQRCodeModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const PropertyQRCodeModal: React.FC<PropertyQRCodeModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const [qrType, setQrType] = useState<'vcard' | 'url'>('vcard');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const agent: Agent = getAgentById(property.agentId);

  // Construct current listing direct link
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://raywhite.com.au';
  const listingUrl = `${origin}/#property-${property.id}`;

  // Construct RFC 2426 vCard format payload recognized by iOS/Android camera scanners
  const buildVCardPayload = (): string => {
    const cleanPhone = agent.phone.replace(/\s+/g, '');
    const cleanAddress = property.address.replace(/,/g, '');
    const cleanSuburb = property.suburb.replace(/,/g, '');
    const cleanState = property.state.replace(/,/g, '');

    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${property.address} (${agent.name})`,
      `N:${agent.name.split(' ').slice(1).join(' ') || agent.name};${agent.name.split(' ')[0]};;;`,
      `ORG:Ray White Prestige;${cleanSuburb} Office`,
      `TITLE:${property.bedrooms} Bed, ${property.bathrooms} Bath Residence`,
      `TEL;TYPE=CELL,VOICE:${cleanPhone}`,
      `EMAIL;TYPE=WORK,INTERNET:${agent.email}`,
      `ADR;TYPE=WORK:;;${cleanAddress};${cleanSuburb};${cleanState};;Australia`,
      `URL:${listingUrl}`,
      `NOTE:${property.title} | Price Guide: ${property.priceDisplay} | Bed: ${property.bedrooms}, Bath: ${property.bathrooms}, Cars: ${property.carSpaces}. Listed by Ray White.`,
      'END:VCARD',
    ].join('\n');
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    const payload = qrType === 'vcard' ? buildVCardPayload() : listingUrl;

    QRCode.toDataURL(payload, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#171717',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, qrType, property.id]);

  if (!isOpen) return null;

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR-${property.suburb}-${property.address.replace(/\s+/g, '-')}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleDownloadVCard = () => {
    const vcardContent = buildVCardPayload();
    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${property.address.replace(/\s+/g, '_')}_Agent_Contact.vcf`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(listingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-60 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[94vh]">
        {/* Header - Oceanic Blue & Emerald Accent Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-blue-800 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-300">
                  Instant Mobile Pass
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white">
                  iOS &amp; Android
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold leading-tight truncate max-w-sm sm:max-w-md">
                Scan &amp; Save: {property.address}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close QR Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs - Red & Green Accents */}
        <div className="px-6 pt-4 pb-2 border-b border-neutral-200 bg-neutral-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-neutral-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setQrType('vcard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                qrType === 'vcard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-700 hover:text-neutral-950'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Save Contact &amp; Property (vCard)</span>
            </button>
            <button
              type="button"
              onClick={() => setQrType('url')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                qrType === 'url'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-700 hover:text-neutral-950'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Direct Listing Link</span>
            </button>
          </div>

          <div className="text-[11px] font-bold text-neutral-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Auto-detects phone camera</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: QR Display Card */}
            <div className="md:col-span-6 flex flex-col items-center">
              <div className="relative p-3 bg-white rounded-2xl shadow-md border-2 border-neutral-200 group">
                {/* QR Target Viewport */}
                <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center bg-neutral-50 rounded-xl overflow-hidden relative">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-2 text-neutral-400">
                      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-medium">Generating QR...</span>
                    </div>
                  ) : qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR code for ${property.address}`}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-xs text-neutral-400">QR code unavailable</span>
                  )}
                </div>

                {/* Subtitle pill */}
                <div className="mt-2.5 text-center">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-neutral-100 text-neutral-700">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Point camera to scan instantly</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Encoded Card Summary */}
            <div className="md:col-span-6 space-y-4">
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {qrType === 'vcard' ? 'Saved to Your Phone Contact' : 'Direct Link Destination'}
                </div>

                {/* Property snapshot */}
                <div className="flex items-start gap-3">
                  <img
                    src={property.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'}
                    alt={property.title}
                    className="w-16 h-16 rounded-lg object-cover shrink-0 border border-neutral-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-neutral-900 leading-tight">
                      {property.address}
                    </h4>
                    <p className="text-xs text-neutral-500 font-medium">
                      {property.suburb}, {property.state}
                    </p>
                    <p className="text-xs font-black text-blue-700 mt-1">
                      {property.priceDisplay}
                    </p>
                  </div>
                </div>

                {/* Agent & specs breakdown */}
                <div className="pt-2 border-t border-neutral-200/80 space-y-1.5 text-xs text-neutral-700">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="font-medium truncate">
                      {property.bedrooms} Beds · {property.bathrooms} Baths · {property.carSpaces} Cars
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="font-medium truncate">
                      {agent.name} ({agent.phone})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="font-medium truncate">{agent.email}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900 text-[11px] flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    {qrType === 'vcard'
                      ? 'Scanning prompts your phone to create a new Contact card with agent phone number, direct listing link, and property specs.'
                      : 'Scanning directly launches your mobile browser to this property listing with all photos and mortgage tools.'}
                  </span>
                </div>
              </div>

              {/* Action buttons with distinct color styling (Blue, Green, Red) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Download VCard button - Fresh Mint / Emerald Green */}
                <button
                  type="button"
                  onClick={handleDownloadVCard}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-emerald-600/20 cursor-pointer border border-emerald-500"
                  title="Download vCard file (.vcf) directly"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Download .vcf Card</span>
                </button>

                {/* Save QR Image - Oceanic Blue */}
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-blue-600/20 cursor-pointer border border-blue-500"
                  title="Download QR code image for print or sharing"
                >
                  <QrCode className="w-3.5 h-3.5 text-white" />
                  <span>Save QR Image</span>
                </button>

                {/* Copy Link - Crimson Red Accent */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="sm:col-span-2 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-800 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-rose-300"
                  title="Copy direct web link to clipboard"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-rose-600" />
                      <span>Copied Property Link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-rose-600" />
                      <span>Copy Direct Mobile Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-neutral-100 border-t border-neutral-200 text-xs text-neutral-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ready to scan with camera or QR reader</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
