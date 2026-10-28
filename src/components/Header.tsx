import React, { useState } from 'react';
import { Menu, X, Heart, Phone, CalendarCheck, Scale, MessageSquare, Sparkles, ShieldCheck } from 'lucide-react';
import { useRequests } from '../context/RequestContext';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, tab?: 'sale' | 'rent') => void;
  onOpenAppraisal: () => void;
  savedCount: number;
  onOpenSaved: () => void;
  compareCount?: number;
  onOpenCompare?: () => void;
  onOpenChat?: () => void;
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
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pendingCount, isAdminAuthenticated } = useRequests();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'buy', label: 'Buy', tab: 'sale' as const },
    { id: 'rent', label: 'Rent', tab: 'rent' as const },
    { id: 'videos', label: 'Video Storage' },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
              aria-label="Ray White Home"
            >
              {/* Ray White Brand Mark */}
              <div className="flex items-center">
                <div className="w-9 h-9 bg-[#FFD200] flex items-center justify-center font-bold text-neutral-900 text-xl tracking-tighter rounded-sm shadow-xs group-hover:bg-[#E5BC00] transition-colors">
                  RW
                </div>
                <div className="ml-2.5 flex flex-col">
                  <span className="text-xl font-extrabold tracking-tight text-neutral-900 leading-none">
                    Ray White<span className="text-[#FFD200]">.</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mt-0.5">
                    Real Estate
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-700">
            {navItems.map((item) => {
              const isActive =
                currentView === item.id ||
                (currentView === 'listings' && (item.id === 'buy' || item.id === 'rent'));
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.tab)}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 hover:text-neutral-950 cursor-pointer ${
                    isActive ? 'text-neutral-950 font-semibold' : 'text-neutral-600'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD200] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Zone */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Admin Portal Button - Hidden from public, only visible when staff is authenticated with password 000333999 */}
            {isAdminAuthenticated && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`relative px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
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
            {/* Chat Concierge Button */}
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="relative p-2 sm:px-3 sm:py-2 rounded-xl text-neutral-700 hover:text-blue-600 hover:bg-blue-50/80 transition-colors cursor-pointer flex items-center gap-1.5 border border-neutral-200/80"
                aria-label="Open Ray White Chat Concierge"
                title="Chat with AI Concierge"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="hidden xl:inline text-xs font-bold text-neutral-800">Chat</span>
              </button>
            )}

            {/* Compare properties button */}
            <button
              onClick={onOpenCompare}
              className={`relative p-2 sm:px-2.5 sm:py-2 rounded-xl transition-all cursor-pointer border ${
                compareCount > 0
                  ? 'text-amber-950 bg-amber-50 border-amber-300 hover:bg-amber-100 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 border-neutral-200/80'
              }`}
              aria-label="Compare properties"
              title={compareCount > 0 ? `Compare (${compareCount}/3 properties)` : 'Compare Properties'}
            >
              <Scale className={`w-4 h-4 ${compareCount > 0 ? 'text-amber-600 stroke-[2.2]' : ''}`} />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs border border-white">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Saved properties button */}
            <button
              onClick={onOpenSaved}
              className="relative p-2 sm:px-2.5 sm:py-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-rose-50/80 transition-colors cursor-pointer border border-neutral-200/80"
              aria-label="Saved properties"
              title="Saved Properties"
            >
              <Heart className={`w-4 h-4 ${savedCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-neutral-600'}`} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs border border-white">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Direct Phone Assistance */}
            <a
              href="tel:1300729944"
              className="hidden lg:flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#E5BC00]" />
              <span>1300 729 944</span>
            </a>

            {/* Primary Action Button: Ray White Yellow Book Appraisal */}
            <button
              onClick={onOpenAppraisal}
              className="px-4 py-2.5 text-xs sm:text-sm font-bold text-neutral-950 bg-[#FFD200] hover:bg-[#E5BC00] active:scale-[0.98] rounded-md transition-all shadow-xs flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-neutral-950" />
              <span>Book Appraisal</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-700 hover:text-neutral-950 rounded-lg hover:bg-neutral-100 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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

          <div className="pt-3 border-t border-neutral-100 space-y-2">
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
