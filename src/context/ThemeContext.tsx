import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'vibrant-azure' | 'emerald-oasis' | 'sunset-coral' | 'cosmic-violet';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  badge: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    heroGradient: string;
    cardBorder: string;
    glowColor: string;
    pillBg: string;
    pillText: string;
    previewDots: [string, string, string];
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'vibrant-azure': {
    id: 'vibrant-azure',
    name: 'Prestige Azure & Gold',
    subtitle: 'Oceanic Sapphire with Radiant Gold & Emerald',
    badge: '🌟 Vibrant Prestige',
    colors: {
      primary: '#1E3A8A', // Blue 900
      secondary: '#FFD200', // Ray White Gold
      accent: '#0D9488', // Teal 600
      heroGradient: 'from-slate-950 via-[#0a1532] to-[#0f1d3e]',
      cardBorder: 'border-blue-500/30',
      glowColor: 'rgba(59, 130, 246, 0.25)',
      pillBg: 'bg-blue-500/15',
      pillText: 'text-blue-400',
      previewDots: ['#2563EB', '#FFD200', '#10B981'],
    },
  },
  'emerald-oasis': {
    id: 'emerald-oasis',
    name: 'Emerald Coast & Mint',
    subtitle: 'Lush Botanical Jade & Oceanic Cyan',
    badge: '🌿 Emerald Oasis',
    colors: {
      primary: '#064E3B', // Emerald 900
      secondary: '#10B981', // Emerald 500
      accent: '#F59E0B', // Amber 500
      heroGradient: 'from-slate-950 via-[#06241b] to-[#0a3326]',
      cardBorder: 'border-emerald-500/30',
      glowColor: 'rgba(16, 185, 129, 0.25)',
      pillBg: 'bg-emerald-500/15',
      pillText: 'text-emerald-400',
      previewDots: ['#059669', '#10B981', '#F59E0B'],
    },
  },
  'sunset-coral': {
    id: 'sunset-coral',
    name: 'Pacific Sunset & Coral',
    subtitle: 'Warm Terracotta, Amber Glow & Rose Quartz',
    badge: '🌅 Sunset Coral',
    colors: {
      primary: '#831843', // Pink 900
      secondary: '#F97316', // Orange 500
      accent: '#F43F5E', // Rose 500
      heroGradient: 'from-slate-950 via-[#2a0e22] to-[#3a1523]',
      cardBorder: 'border-rose-500/30',
      glowColor: 'rgba(244, 63, 94, 0.25)',
      pillBg: 'bg-rose-500/15',
      pillText: 'text-rose-400',
      previewDots: ['#F97316', '#F43F5E', '#FBBF24'],
    },
  },
  'cosmic-violet': {
    id: 'cosmic-violet',
    name: 'Cosmic Violet & Cyan',
    subtitle: 'Royal Amethyst, Electric Magenta & Cyan',
    badge: '🌌 Cosmic Violet',
    colors: {
      primary: '#4C1D95', // Violet 900
      secondary: '#8B5CF6', // Violet 500
      accent: '#06B6D4', // Cyan 500
      heroGradient: 'from-slate-950 via-[#1b0d33] to-[#261042]',
      cardBorder: 'border-violet-500/30',
      glowColor: 'rgba(139, 92, 246, 0.25)',
      pillBg: 'bg-violet-500/15',
      pillText: 'text-violet-400',
      previewDots: ['#8B5CF6', '#06B6D4', '#EC4899'],
    },
  },
};

interface ThemeContextType {
  themeId: ThemeId;
  theme: ThemeConfig;
  setThemeId: (id: ThemeId) => void;
  themesList: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('raywhite_theme');
      if (saved && saved in THEMES) {
        return saved as ThemeId;
      }
    } catch {
      // ignore
    }
    return 'vibrant-azure';
  });

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    try {
      localStorage.setItem('raywhite_theme', id);
    } catch {
      // ignore
    }
  };

  const theme = THEMES[themeId];
  const themesList = Object.values(THEMES);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId, theme, setThemeId, themesList }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
