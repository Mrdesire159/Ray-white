import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, ShieldCheck } from 'lucide-react';
import { useRequests } from '../context/RequestContext';

export const ContactView: React.FC = () => {
  const { addRequest } = useRequests();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [office, setOffice] = useState('Double Bay (Head Office)');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const offices = [
    {
      name: 'Ray White Double Bay (Flagship)',
      address: 'Shop 1, 350 New South Head Road, Double Bay NSW 2028',
      phone: '+61 (02) 9363 1100',
      email: 'doublebay.nsw@raywhite.com',
      hours: 'Mon – Fri: 8:30 AM – 5:30 PM | Sat: 9:00 AM – 4:00 PM',
    },
    {
      name: 'Ray White Sydney City Fringe',
      address: '228 Crown Street, Surry Hills NSW 2010',
      phone: '+61 (02) 9363 1144',
      email: 'surryhills.nsw@raywhite.com',
      hours: 'Mon – Fri: 9:00 AM – 5:30 PM | Sat: 9:00 AM – 3:00 PM',
    },
    {
      name: 'Ray White Lower North Shore',
      address: '102 Glover Street, Mosman NSW 2088',
      phone: '+61 (02) 9363 1188',
      email: 'mosman.nsw@raywhite.com',
      hours: 'Mon – Fri: 8:30 AM – 5:30 PM | Sat: 9:00 AM – 4:00 PM',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addRequest({
      type: 'contact',
      priority: 'normal',
      client: {
        name,
        email,
        phone: phone || '+61 400 000 000',
        preferredContact: 'email',
      },
      details: {
        subject: `Inquiry directed to ${office}`,
        message,
        preferredOffice: office,
      },
    });

    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="max-w-3xl mb-12">
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
          Connect with Us
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
          Ray White Office Network &amp; Enquiries
        </h1>
        <p className="mt-3 text-neutral-600 text-sm sm:text-base leading-relaxed">
          Whether you are looking to buy, lease, or request an appraisal on your home, our team of property specialists is here to guide every step.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left 7 Cols: Office Locations */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-xl font-bold text-neutral-900">Key Office Locations</h2>

          <div className="space-y-4">
            {offices.map((off, idx) => (
              <div
                key={idx}
                className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs hover:border-neutral-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-neutral-900">{off.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-neutral-700 bg-[#FFD200]/40 px-2 py-0.5 rounded">
                    Open
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#E5BC00] shrink-0 mt-0.5" />
                    <span>{off.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                    <a
                      href={`tel:${off.phone.replace(/[^0-9+]/g, '')}`}
                      className="hover:text-neutral-900 font-medium"
                    >
                      {off.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                    <a href={`mailto:${off.email}`} className="hover:text-neutral-900">
                      {off.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500 pt-1">
                    <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>{off.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Contact Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-7 shadow-xs sticky top-24">
            <h2 className="text-xl font-bold text-neutral-900 mb-1">Send a Message</h2>
            <p className="text-xs text-neutral-500 mb-5">
              Fill out this enquiry form and our concierge will route your request directly to the nearest office.
            </p>

            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-base text-neutral-900">Message Received</h3>
                <p className="text-xs text-neutral-600">
                  Thank you, {name}. A Ray White representative from {office} will be in touch within 2 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg mt-3"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0412 345 678"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Select Nearest Office
                  </label>
                  <select
                    value={office}
                    onChange={(e) => setOffice(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  >
                    <option value="Double Bay (Head Office)">Ray White Double Bay</option>
                    <option value="Sydney City Fringe">Ray White Sydney City Fringe</option>
                    <option value="Lower North Shore">Ray White Lower North Shore</option>
                    <option value="Northern Beaches">Ray White Northern Beaches</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can our local team assist you?"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#FFD200] hover:bg-[#E5BC00] active:scale-[0.98] text-neutral-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Enquiry</span>
                </button>
              </form>
            )}

            <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center gap-2 text-[11px] text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Ray White Privacy Policy &amp; Security Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
