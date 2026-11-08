import React, { useState } from 'react';
import { Menu, X, Heart, Phone, CalendarCheck, Scale, MessageSquare, Sparkles, ShieldCheck, Mail, Inbox, Bell } from 'lucide-react';
import { useRequests } from '../context/RequestContext';
import { ThemeSelector } from './ThemeSelector';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, tab?: 'sale' | 'rent') => void;
  onOpenAppraisal: () => void;
  savedCount: number;
  onOpenSaved: () => void;
  compareCount?: number;
  onOpenCompare?: () => void;
  onOpenChat?: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAppraisal,
  savedCount,
  onOpenSaved,
  compareCount = 0,
  onOpenCompare,
  onOpenChat,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rwTapCount, setRwTapCount] = useState(0);
  const [adminHint, setAdminHint] = useState<string | null>(null);
  const rwTapTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { visitor, openAccount, pendingCount, isAdminAuthenticated, unrepliedCount, visitorUnreadReplyCount, targetCustomEmail } = useRequests();

  const handleRwTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (rwTapTimerRef.current) {
      clearTimeout(rwTapTimerRef.current);
    }
    const nextCount = rwTapCount + 1;
    if (nextCount >= 3) {
      setRwTapCount(0);
      setAdminHint('Staff Admin Activated! Opening Portal...');
      setTimeout(() => setAdminHint(null), 2500);
      if (onOpenAdmin) {
        onOpenAdmin();
      } else if (isAdminAuthenticated) {
        onNavigate('admin');
      }
    } else {
      setRwTapCount(nextCount);
      setAdminHint(`Admin mode: tap ${3 - nextCount} more time${3 - nextCount === 1 ? '' : 's'}...`);
      rwTapTimerRef.current = setTimeout(() => {
        setRwTapCount(0);
        setAdminHint(null);
      }, 1500);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'buy', label: 'Buy', tab: 'sale' as const },
    { id: 'rent', label: 'Rent', tab: 'rent' as const },
    { id: 'airbnb', label: 'Airbnb & Stays', badge: 'AU' },
    { id: 'trends', label: 'Market Trends' },
    { id: 'pricelist', label: 'Price List' },
    { id: 'agents', label: 'Agents' },
  ];

  const handleNavClick = (id: string, tab?: 'sale' | 'rent') => {
    onNavigate(id, tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-20 gap-2 sm:gap-6 lg:gap-8">
          {/* Brand Zone */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 text-left group">
              {/* Ray White Brand Mark - Tap 3 times for Admin Portal */}
              <div className="relative">
                <button
                  type="button"
                  onClick={handleRwTap}
                  className={`w-8 h-8 sm:w-9 sm:h-9 bg-[#FFD200] flex items-center justify-center font-bold text-neutral-900 text-lg sm:text-xl tracking-tighter rounded-sm shadow-xs hover:bg-[#E5BC00] transition-all cursor-pointer select-none active:scale-95 ${
                    rwTapCount === 1
                      ? 'ring-2 ring-amber-400 scale-105'
                      : rwTapCount === 2
                      ? 'ring-4 ring-amber-500 scale-110 animate-pulse bg-amber-400'
                      : ''
                  }`}
                  title="Ray White (Tap 3 times for Admin Portal)"
                  aria-label="Ray White logo mark (Tap 3 times for Admin Portal)"
                >
                  RW
                </button>
                {adminHint && (
                  <div className="absolute top-full left-0 mt-2 z-50 whitespace-nowrap bg-neutral-950 text-[#FFD200] text-[10px] font-black px-2.5 py-1 rounded-lg border border-amber-400/40 shadow-xl animate-in fade-in slide-in-from-top-1 pointer-events-none">
                    {adminHint}
                  </div>
                )}
              </div>

              {/* Site Profile Picture & Google Verified Display Photo */}
              <div
                onClick={() => handleNavClick('home')}
                className="relative shrink-0 cursor-pointer group/avatar"
                title="Ray White Real Estate – Official Profile Picture (Google Verified)"
                aria-label="Ray White Profile Picture"
              >
                <img
                  src="/site-profile.webp"
                  alt="Ray White Real Estate Profile Picture"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-[#FFD200] shadow-xs group-hover/avatar:scale-105 transition-transform ring-1 ring-neutral-200"
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-black shadow-xs"
                  title="Google Verified Real Estate Agency Profile"
                >
                  ✓
                </span>
              </div>

              {/* Brand Text - Normal Navigation Home */}
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className="ml-0.5 sm:ml-1 flex flex-col text-left cursor-pointer focus:outline-none"
                aria-label="Ray White Home"
              >
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900 leading-none group-hover:text-neutral-950">
                  Ray White<span className="text-[#FFD200]">.</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mt-0.5">
                  Real Estate
                </span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-neutral-700">
            {navItems.map((item) => {
              const isActive =
                currentView === item.id ||
                (currentView === 'listings' && (item.id === 'buy' || item.id === 'rent'));
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.tab)}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 hover:text-neutral-950 cursor-pointer flex items-center gap-1 ${
                    isActive ? 'text-neutral-950 font-semibold' : 'text-neutral-600'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#FFD200] text-neutral-950 shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD200] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Zone */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">
            {/* Visitor & Staff Inbox - Real-Time In-Site Messages & Replies */}
            <button
              onClick={() => handleNavClick('replyportal')}
              className={`relative px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs active:scale-95 ${
                currentView === 'replyportal'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/25 font-black'
                  : visitorUnreadReplyCount > 0
                  ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100 ring-2 ring-red-400/20'
                  : 'text-neutral-800 bg-white hover:bg-neutral-100 border-neutral-300'
              }`}
              aria-label="Open Inbox"
              title={`Inbox (${visitorUnreadReplyCount > 0 ? `${visitorUnreadReplyCount} new unread replies from ${targetCustomEmail}` : `Messages & replies from ${targetCustomEmail}`})`}
            >
              <div className="relative">
                <Inbox className={`w-4 h-4 ${currentView === 'replyportal' ? 'text-white' : visitorUnreadReplyCount > 0 ? 'text-red-600 animate-bounce' : 'text-blue-600'}`} />
                {visitorUnreadReplyCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                  </span>
                )}
              </div>
              <span className="hidden md:inline font-bold">Inbox</span>
              {visitorUnreadReplyCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-600 text-white shadow-xs tabular-nums animate-pulse">
                  {visitorUnreadReplyCount}
                </span>
              ) : unrepliedCount > 0 && isAdminAuthenticated ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-xs tabular-nums">
                  {unrepliedCount}
                </span>
              ) : null}
            </button>

            <button onClick={() => visitor ? handleNavClick('replyportal') : openAccount()} className="px-2 py-2 text-xs font-bold rounded-lg hover:bg-neutral-100" aria-label={visitor ? 'Your visitor account' : 'Sign in or create an account'}>{visitor ? 'Account' : 'Sign in'}</button>

            {/* Admin Portal Button - Hidden from public, only visible when staff is authenticated */}
            {isAdminAuthenticated && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`relative px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
                  currentView === 'admin'
                    ? 'bg-neutral-950 text-[#FFD200] border-neutral-900 shadow-sm ring-2 ring-neutral-900/10'
                    : 'text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border-neutral-200'
                }`}
                aria-label="Open Admin Operations & Approvals Portal"
                title="Admin Portal (Approvals & Requests Management)"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">Admin Portal</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-neutral-950 shadow-xs border border-white tabular-nums animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {/* Chat Concierge Button - Oceanic Blue Theme */}
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="relative p-2 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                aria-label="Open Ray White Chat Concierge"
                title="Chat with AI Concierge"
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600 animate-pulse" />
                <MessageSquare className="w-4 h-4 text-blue-700" />
                <span className="hidden xl:inline text-xs font-bold text-blue-900">Chat</span>
              </button>
            )}

            {/* Compare properties button - Fresh Mint / Emerald Green Theme */}
            <button
              onClick={onOpenCompare}
              className={`relative p-2 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl transition-all cursor-pointer border flex items-center gap-1.5 shadow-2xs active:scale-95 ${
                compareCount > 0
                  ? 'text-white bg-emerald-600 border-emerald-600 hover:bg-emerald-700 font-bold shadow-xs shadow-emerald-600/20'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-300 font-semibold'
              }`}
              aria-label="Compare properties"
              title={compareCount > 0 ? `Compare (${compareCount}/3 properties)` : 'Compare Properties'}
            >
              <Scale className={`w-4 h-4 ${compareCount > 0 ? 'text-white stroke-[2.4]' : 'text-emerald-700'}`} />
              <span className="hidden lg:inline text-xs font-bold">Compare</span>
              {compareCount > 0 && (
                <span className="bg-white text-emerald-800 text-[10px] font-black w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center shadow-xs ml-0.5">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Saved properties button - Bold Crimson / Rose Red Theme */}
            <button
              onClick={onOpenSaved}
              className={`relative p-2 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl transition-all cursor-pointer border flex items-center gap-1.5 shadow-2xs active:scale-95 ${
                savedCount > 0
                  ? 'text-white bg-red-600 border-red-600 hover:bg-red-700 font-bold shadow-xs shadow-red-600/20'
                  : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-300 font-semibold'
              }`}
              aria-label="Saved properties"
              title="Saved Properties"
            >
              <Heart className={`w-4 h-4 ${savedCount > 0 ? 'text-white fill-white' : 'text-rose-600'}`} />
              <span className="hidden lg:inline text-xs font-bold">Saved</span>
              {savedCount > 0 && (
                <span className="bg-white text-red-600 text-[10px] font-black w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center shadow-xs ml-0.5">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Direct Phone Assistance - Crimson Red Accent */}
            <a
              href="tel:1300729944"
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-xl transition-colors shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-red-600" />
              <span>1300 729 944</span>
            </a>

            {/* Primary Action Button: Royal Oceanic Blue Theme with Gold accent */}
            <button
              onClick={onOpenAppraisal}
              className="hidden sm:flex px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl transition-all shadow-md shadow-blue-600/25 items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer border border-blue-500"
            >
              <CalendarCheck className="w-4 h-4 text-[#FFD200]" />
              <span>Book Appraisal</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 text-neutral-700 hover:text-neutral-950 rounded-lg hover:bg-neutral-100 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-neutral-100">
            <button
              onClick={() => handleNavClick('buy', 'sale')}
              className="py-2.5 px-3 bg-neutral-50 text-neutral-900 rounded-md text-sm font-semibold text-center hover:bg-neutral-100"
            >
              Properties For Sale
            </button>
            <button
              onClick={() => handleNavClick('rent', 'rent')}
              className="py-2.5 px-3 bg-neutral-50 text-neutral-900 rounded-md text-sm font-semibold text-center hover:bg-neutral-100"
            >
              Properties For Rent
            </button>
          </div>
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.tab)}
                className="w-full text-left py-2.5 px-3 rounded-md text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 text-sm font-medium transition-colors"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick('replyportal')}
              className={`w-full text-left py-2.5 px-3 rounded-md font-bold text-sm flex items-center justify-between transition-colors cursor-pointer ${
                visitorUnreadReplyCount > 0
                  ? 'text-red-900 bg-red-50 hover:bg-red-100 border border-red-200'
                  : 'text-blue-900 bg-blue-50/80 hover:bg-blue-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Inbox className={`w-4 h-4 ${visitorUnreadReplyCount > 0 ? 'text-red-600' : 'text-blue-600'}`} />
                <span>Inbox &amp; Messages ({targetCustomEmail})</span>
              </div>
              {visitorUnreadReplyCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-red-600 text-white animate-pulse">
                  {visitorUnreadReplyCount} New Reply
                </span>
              ) : unrepliedCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-blue-600 text-white">
                  {unrepliedCount}
                </span>
              ) : null}
            </button>
            {isAdminAuthenticated && (
              <button
                onClick={() => handleNavClick('admin')}
                className="w-full text-left py-2.5 px-3 rounded-md text-amber-800 bg-amber-50/80 font-bold text-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Admin Operations Portal</span>
                </div>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-400 text-neutral-950">
                    {pendingCount} Pending
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Theme Palette Customizer in mobile drawer */}
          <div className="pt-2.5 pb-1 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600">Color Palette</span>
            <ThemeSelector compact={true} />
          </div>

          <div className="pt-2 border-t border-neutral-100 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAppraisal();
              }}
              className="w-full py-3 bg-[#FFD200] text-neutral-950 font-bold rounded-md text-sm shadow-xs text-center"
            >
              Book Free Property Appraisal
            </button>
            <a
              href="tel:1300729944"
              className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-neutral-600"
            >
              <Phone className="w-3.5 h-3.5 text-neutral-500" />
              <span>Call Local Team: 1300 729 944</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
