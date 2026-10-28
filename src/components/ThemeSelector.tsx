import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles, ChevronDown } from 'lucide-react';
import { useTheme, THEMES, ThemeId } from '../context/ThemeContext';

interface ThemeSelectorProps {
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ compact = false }) => {
  const { themeId, theme, setThemeId, themesList } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl transition-all cursor-pointer border ${
          compact
            ? 'px-2.5 py-1.5 text-xs bg-white/90 hover:bg-white text-neutral-800 border-neutral-200 shadow-xs'
            : 'px-3 py-2 text-xs font-bold bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200 shadow-xs'
        }`}
        title="Change Color Theme"
        aria-label="Change Color Theme"
      >
        {/* Colorful Tri-Dot Swatch Indicator */}
        <div className="flex items-center -space-x-1">
          {theme.colors.previewDots.map((c, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full ring-1 ring-white"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <span className="font-bold text-neutral-900 tracking-tight whitespace-nowrap">
          {theme.name.split(' ')[0]}
        </span>

        <Palette className="w-3.5 h-3.5 text-neutral-500" />
        <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-neutral-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-neutral-100 mb-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-neutral-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Theme &amp; Color Palette</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Select an organized color profile for the showcase
            </p>
          </div>

          <div className="space-y-1">
            {themesList.map((t) => {
              const isActive = t.id === themeId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setThemeId(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-neutral-100 font-bold text-neutral-950 ring-1 ring-neutral-300'
                      : 'hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Swatch preview dots */}
                    <div className="flex items-center -space-x-1.5 p-1 rounded-lg bg-neutral-100 border border-neutral-200">
                      {t.colors.previewDots.map((dot, idx) => (
                        <span
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full ring-1 ring-white shadow-xs"
                          style={{ backgroundColor: dot }}
                        />
                      ))}
                    </div>

                    <div>
                      <div className="text-xs font-bold leading-tight text-neutral-900 flex items-center gap-1.5">
                        <span>{t.name}</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">
                        {t.subtitle}
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-neutral-950 text-white flex items-center justify-center shrink-0 ml-2">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
