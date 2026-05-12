import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "campustracker:theme";
export const campusThemes = {
  "Dark Neon": { mode: "dark", accent: "#06B6D4" },
  "Light Minimal": { mode: "light", accent: "#7C3AED" },
  "Campus Blue": { mode: "dark", accent: "#2563EB" },
  "Purple SaaS": { mode: "dark", accent: "#8B5CF6" },
  "Cyber Glow": { mode: "dark", accent: "#22D3EE" },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem(STORAGE_KEY) || "Dark Neon";
  });

  useEffect(() => {
    const root = document.documentElement;
    const config = campusThemes[theme] || campusThemes["Dark Neon"];
    root.classList.toggle("dark", config.mode === "dark");
    root.classList.toggle("light", config.mode === "light");
    root.dataset.theme = theme;
    root.style.colorScheme = config.mode;
    root.style.setProperty("--campus-accent", config.accent);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      themes: Object.keys(campusThemes),
      isDark: (campusThemes[theme] || campusThemes["Dark Neon"]).mode === "dark",
      setTheme,
      toggleTheme: () => setTheme((current) => (campusThemes[current]?.mode === "dark" ? "Light Minimal" : "Dark Neon")),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
