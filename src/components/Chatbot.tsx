import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  User,
  Bot,
  ExternalLink,
  PhoneCall,
  CalendarCheck,
  Sparkles,
  Bed,
  Bath,
  MapPin,
  ChevronRight,
  RotateCcw,
  Camera,
  Calculator,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Property, ChatMessage, Agent } from '../types/property';
import { PROPERTIES } from '../data/properties';
import { AGENTS } from '../data/agents';

interface ChatbotProps {
  onSelectProperty: (property: Property) => void;
  onTourInside?: (property: Property) => void;
  onOpenAppraisal: () => void;
  onOpenAgentDirectory: () => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  onSelectProperty,
  onTourInside,
  onOpenAppraisal,
  onOpenAgentDirectory,
  isOpenExternal,
  onCloseExternal,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    setInternalIsOpen(open);
    if (!open && onCloseExternal) {
      onCloseExternal();
    }
  };

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentConnectModal, setAgentConnectModal] = useState<Agent | null>(null);
  const [agentRequestSuccess, setAgentRequestSuccess] = useState(false);
  const [userPhoneInput, setUserPhoneInput] = useState('');
  const [hasUnread, setHasUnread] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome-1',
      sender: 'bot',
      text: "G'day! I'm your Ray White Digital Real Estate Concierge. I can help you find homes, calculate mortgage repayments, explore 3D rolling camera walkthroughs, or connect you with premier agents.",
      timestamp: 'Just now',
    },
    {
      id: 'msg-welcome-2',
      sender: 'bot',
      text: 'Ask me anything: e.g. "Can I tour inside a house?", "Show me 4-bedroom houses with pool", "Rentals under $1,500/wk", or "What is my home worth?".',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  // Conversational response resolver
  const generateBotReply = (query: string): {
    replyText: string;
    suggestions?: Property[];
    actionType?: 'connect_agent' | 'book_inspection' | 'book_appraisal' | 'virtual_tour';
    actionData?: any;
  } => {
    const q = query.toLowerCase().trim();

    // 0. Greetings
    if (/^(hi|hello|hey|g'day|good morning|good afternoon|good evening|howdy)\b/i.test(q)) {
      return {
        replyText: "Hello! Welcome to Ray White. Whether you are looking to purchase a signature architectural residence, secure an executive rental, book an inspection, or tour inside properties with our 3D rolling camera view, I'm at your service. What area or style of home are you interested in?",
        suggestions: PROPERTIES.slice(0, 2),
      };
    }

    // 1. Virtual Rolling Camera Tour
    if (q.includes('tour') || q.includes('inside') || q.includes('camera') || q.includes('walkthrough') || q.includes('virtual') || q.includes('rolling')) {
      const featuredForTour = PROPERTIES.filter((p) => p.featured).slice(0, 3);
      return {
        replyText: "Our virtual 3D rolling camera walkthrough lets you glide seamlessly from the exterior facade into the grand foyer, living pavilion, chef's kitchen, master suite, and pool terrace! Click 'Tour Inside' on any of these homes below to launch the experience:",
        suggestions: featuredForTour,
        actionType: 'virtual_tour',
      };
    }

    // 2. Mortgage & Repayment Questions
    if (q.includes('mortgage') || q.includes('repayment') || q.includes('interest rate') || q.includes('loan') || q.includes('stamp duty') || q.includes('deposit')) {
      return {
        replyText: "Our mortgage calculator computes principal and interest repayments, stamp duty, deposit amounts, and loan terms (typically 6.25% p.a. over 30 years). For example, a $2,500,000 home with 20% deposit ($500,000) has monthly repayments of approximately $12,314. Click any property to open our detailed repayment breakdown!",
        suggestions: PROPERTIES.filter((p) => p.status === 'sale').slice(0, 2),
      };
    }

    // 3. Connect to agent or talk to someone
    if (q.includes('agent') || q.includes('talk to someone') || q.includes('human') || q.includes('call me') || q.includes('contact') || q.includes('phone') || q.includes('speak')) {
      return {
        replyText: "I can immediately connect you with one of our accredited Ray White Principals or Senior Leasing Specialists. Julian Henderson and Sophie Montgomery are currently active.",
        actionType: 'connect_agent',
      };
    }

    // 4. Book an inspection
    if (q.includes('inspection') || q.includes('open house') || q.includes('viewing') || q.includes('schedule') || q.includes('visit')) {
      const upcomingWithInspections = PROPERTIES.filter((p) => p.inspections.length > 0).slice(0, 3);
      return {
        replyText: "We have multiple open homes scheduled for this upcoming weekend across Sydney, Southern Highlands, and coastal regions. Click any property to view confirmed inspection times:",
        suggestions: upcomingWithInspections,
        actionType: 'book_inspection',
      };
    }

    // 5. Book appraisal or sell
    if (q.includes('appraisal') || q.includes('valuation') || q.includes('worth') || q.includes('estimate') || q.includes('sell') || q.includes('market value')) {
      return {
        replyText: "Ray White provides complimentary digital and in-person property appraisals backed by comprehensive local sales clearance data. You can book an appraisal online right now:",
        actionType: 'book_appraisal',
      };
    }

    // 5.5 Market Trends, Yields & Econometrics
    if (q.includes('trend') || q.includes('yield') || q.includes('growth') || q.includes('market') || q.includes('clearance') || q.includes('demand') || q.includes('data') || q.includes('forecast')) {
      return {
        replyText: "According to our latest Ray White econometric research: Greater Sydney recorded +9.2% YoY capital growth (median $1,845,000), Brisbane/Gold Coast surged +14.1% YoY with a 78.2% auction clearance rate, and Perth leads gross rental yields at 6.3% on units with just 14 days average on market! You can explore full multi-year price curves and yield comparisons in our Market Trends section.",
        suggestions: PROPERTIES.filter((p) => p.featured).slice(0, 2),
      };
    }

    // 6. Compare feature
    if (q.includes('compare') || q.includes('comparison') || q.includes('side by side')) {
      return {
        replyText: "You can compare up to three properties side-by-side! Click the 'Compare' button on any property card or table row, then access your Comparison Drawer to review prices, specs, gross yield, and land sizes together.",
        suggestions: PROPERTIES.slice(0, 3),
      };
    }

    // 7. Property Search: Rent vs Sale
    const isRentQuery = q.includes('rent') || q.includes('lease') || q.includes('/wk') || q.includes('weekly');
    const isSaleQuery = q.includes('buy') || q.includes('sale') || q.includes('purchase');

    // Bedrooms filter
    let targetBeds: number | null = null;
    const bedMatch = q.match(/(\d+)\s*(?:bed|bedroom)/i);
    if (bedMatch) {
      targetBeds = parseInt(bedMatch[1], 10);
    }

    // Pool / Garden feature search
    const wantsPool = q.includes('pool');
    const wantsGarden = q.includes('garden');
    const wantsGarage = q.includes('garage') || q.includes('parking');

    // Suburb match
    const foundSuburb = PROPERTIES.find((p) =>
      q.includes(p.suburb.toLowerCase()) || q.includes(p.address.toLowerCase())
    );

    // Filter properties based on inferred constraints
    let matches = PROPERTIES.filter((p) => {
      if (isRentQuery && p.status !== 'rent') return false;
      if (isSaleQuery && p.status !== 'sale') return false;
      if (targetBeds !== null && p.bedrooms < targetBeds) return false;
      if (wantsPool && !p.features.includes('Pool')) return false;
      if (wantsGarden && !p.features.includes('Garden')) return false;
      if (wantsGarage && !p.features.includes('Garage')) return false;
      if (foundSuburb && p.suburb.toLowerCase() !== foundSuburb.suburb.toLowerCase()) return false;
      return true;
    });

    if (matches.length > 0) {
      const topMatches = matches.slice(0, 3);
      return {
        replyText: `I found ${matches.length} matching residence${matches.length === 1 ? '' : 's'} matching your preferences. You can click 'Tour Inside' to roll through the interior or view full specifications:`,
        suggestions: topMatches,
      };
    }

    // Fallback if specific search yielded no exact match
    const closest = PROPERTIES.filter((p) => (isRentQuery ? p.status === 'rent' : p.status === 'sale')).slice(0, 3);
    return {
      replyText: "I couldn't find an exact match for those specific parameters, but here are our closest premier residences in Australasia. Feel free to ask about suburbs like Bondi Beach, Bowral, Byron Bay, or Kangaroo Valley!",
      suggestions: closest,
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botResult = generateBotReply(text);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResult.replyText,
        timestamp: 'Just now',
        propertySuggestions: botResult.suggestions,
        actionType: botResult.actionType as any,
        actionData: botResult.actionData,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 400);
  };

  const quickPrompts = [
    'Tour Inside a House 🎥',
    'Market Trends & Yields 📈',
    'Show 3-Bedroom Homes',
    'Rentals under $1,500/wk',
    'Calculate Mortgage',
    'Book Free Appraisal',
    'Connect to Agent'
  ];

  return (
    <>
      {/* Floating Circular Button in Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-14 h-14 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full shadow-2xl border-2 border-[#FFD200] transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Open Ray White Assistant"
          >
            {/* Ray White Brand Emblem Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#FFD200] text-neutral-950 font-extrabold text-sm flex items-center justify-center shadow-xs">
              RW
            </div>

            {/* Unread indicator */}
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFD200] border-2 border-neutral-900 rounded-full" />
            )}

            {/* Hover Tooltip */}
            <span className="absolute right-16 px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-700">
              Chat with Ray White Concierge
            </span>
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[590px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-neutral-950 text-white flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FFD200] text-neutral-950 font-bold text-xs flex items-center justify-center shadow-xs">
                RW
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>Ray White Concierge</span>
                  <span className="text-[10px] bg-[#FFD200]/20 text-[#FFD200] px-1.5 py-0.2 rounded font-bold">Online</span>
                </h3>
                <p className="text-[11px] text-neutral-400">Verified Advisory &amp; 3D Rolling Tours</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'reset-1',
                      sender: 'bot',
                      text: "Conversation reset. What can I help you explore today?",
                      timestamp: 'Just now',
                    },
                  ])
                }
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                title="Restart chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-neutral-900 text-white rounded-br-xs font-medium'
                      : 'bg-white text-neutral-800 border border-neutral-200/90 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {msg.text}

                  {/* If the message has property suggestions, render interactive mini cards */}
                  {msg.propertySuggestions && msg.propertySuggestions.length > 0 && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-neutral-100">
                      {msg.propertySuggestions.map((prop) => (
                        <div
                          key={prop.id}
                          className="bg-neutral-50 hover:bg-white p-2 rounded-xl border border-neutral-200 hover:border-[#FFD200] transition-all text-left flex gap-2.5 group"
                        >
                          <img
                            src={prop.images[0]}
                            alt={prop.title}
                            className="w-16 h-14 object-cover rounded-lg shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-neutral-900 truncate">
                              {prop.address}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-medium">
                              {prop.suburb} · <span className="text-neutral-900 font-bold">{prop.priceDisplay}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {onTourInside && (
                                <button
                                  type="button"
                                  onClick={() => onTourInside(prop)}
                                  className="px-2 py-0.5 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer"
                                >
                                  <Camera className="w-2.5 h-2.5" />
                                  <span>Tour Inside</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onSelectProperty(prop)}
                                className="px-2 py-0.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-[10px] rounded cursor-pointer"
                              >
                                View Specs
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action prompt: Connect to agent */}
                  {msg.actionType === 'connect_agent' && (
                    <div className="mt-3 pt-2.5 border-t border-neutral-100 space-y-2">
                      <div className="text-xs font-bold text-neutral-900">Recommended Agents:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {AGENTS.slice(0, 2).map((agent) => (
                          <button
                            key={agent.id}
                            type="button"
                            onClick={() => setAgentConnectModal(agent)}
                            className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-left transition-colors cursor-pointer"
                          >
                            <div className="font-bold text-[11px] text-neutral-900 truncate">
                              {agent.name}
                            </div>
                            <div className="text-[10px] text-neutral-500 truncate">{agent.office}</div>
                            <div className="text-[10px] font-semibold text-[#E5BC00] mt-1 flex items-center gap-1">
                              <PhoneCall className="w-3 h-3" /> Connect
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={onOpenAgentDirectory}
                        className="w-full text-center text-[11px] text-neutral-600 hover:text-neutral-950 font-semibold underline pt-1"
                      >
                        Browse all Ray White agents
                      </button>
                    </div>
                  )}

                  {/* Action prompt: Book appraisal */}
                  {msg.actionType === 'book_appraisal' && (
                    <div className="mt-3 pt-2 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => onOpenAppraisal()}
                        className="w-full py-2 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>Open Property Appraisal Form</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-2xl px-3.5 py-2 w-16 shadow-2xs">
                <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions pills */}
          <div className="px-3 py-2 bg-white border-t border-neutral-100 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-2.5 py-1 bg-neutral-100 hover:bg-[#FFD200]/30 hover:border-[#FFD200] text-neutral-700 text-[11px] font-medium rounded-full border border-neutral-200 transition-colors cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about houses, rolling tours, or mortgage..."
              className="flex-1 bg-neutral-100 hover:bg-neutral-50 focus:bg-white text-xs sm:text-sm text-neutral-900 rounded-xl px-3.5 py-2.5 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 bg-[#FFD200] hover:bg-[#E5BC00] disabled:opacity-40 disabled:hover:bg-[#FFD200] text-neutral-950 font-bold rounded-xl transition-colors cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Connect to Agent Direct Callback Modal */}
      {agentConnectModal && (
        <div className="fixed inset-0 z-60 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setAgentConnectModal(null);
                setAgentRequestSuccess(false);
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <img
                src={agentConnectModal.avatar}
                alt={agentConnectModal.name}
                className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-[#FFD200] mb-2"
                referrerPolicy="no-referrer"
              />
              <h3 className="font-bold text-base text-neutral-900">{agentConnectModal.name}</h3>
              <p className="text-xs text-neutral-500">{agentConnectModal.role}</p>
              <p className="text-xs font-semibold text-neutral-700 mt-0.5">{agentConnectModal.office}</p>
            </div>

            {agentRequestSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-lg text-xs text-center space-y-2">
                <p className="font-bold">Callback Requested!</p>
                <p>{agentConnectModal.name} will call you back within 15 minutes.</p>
                <button
                  onClick={() => {
                    setAgentConnectModal(null);
                    setAgentRequestSuccess(false);
                  }}
                  className="px-4 py-1.5 bg-emerald-700 text-white rounded font-bold text-xs mt-2 cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!userPhoneInput) return;
                  setAgentRequestSuccess(true);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Enter your phone number for an instant callback:
                  </label>
                  <input
                    type="tel"
                    required
                    value={userPhoneInput}
                    onChange={(e) => setUserPhoneInput(e.target.value)}
                    placeholder="0412 345 678"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <a
                    href={`tel:${agentConnectModal.phone.replace(/[^0-9+]/g, '')}`}
                    className="py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold rounded-lg text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Call Direct
                  </a>
                  <button
                    type="submit"
                    className="py-2.5 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Request Call
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
