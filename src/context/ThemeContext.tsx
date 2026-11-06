import React, { createContext, useContext, useEffect } from "react";

export type ThemeId = "charcoal-gold";
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
    previewDots: [string, string];
  };
}
const theme: ThemeConfig = {
  id: "charcoal-gold",
  name: "Charcoal & Gold",
  subtitle: "Two colors. One consistent identity.",
  badge: "Ray White",
  colors: {
    primary: "#22252A",
    secondary: "#FFD200",
    accent: "#FFD200",
    heroGradient: "from-neutral-950 via-neutral-900 to-neutral-800",
    cardBorder: "border-neutral-300",
    glowColor: "rgba(34, 37, 42, 0.15)",
    pillBg: "bg-yellow-400/15",
    pillText: "text-yellow-400",
    previewDots: ["#22252A", "#FFD200"],
  },
};
export const THEMES = { "charcoal-gold": theme };
const ThemeContext = createContext({
  themeId: theme.id,
  theme,
  themesList: [theme],
  setThemeId: (_id: ThemeId) => {},
});
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "charcoal-gold");
  }, []);
  return (
    <ThemeContext.Provider
      value={{
        themeId: theme.id,
        theme,
        themesList: [theme],
        setThemeId: () => {},
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => useContext(ThemeContext);
