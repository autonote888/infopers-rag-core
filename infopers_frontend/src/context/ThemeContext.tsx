"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  const syncThemeToDOM = (t: Theme) => {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      if (typeof document !== "undefined" && document.body) {
        document.body.classList.add("dark");
      }
    } else {
      root.classList.remove("dark");
      if (typeof document !== "undefined" && document.body) {
        document.body.classList.remove("dark");
      }
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("infopers_theme") as Theme;
    if (saved === "light") {
      setThemeState("light");
      syncThemeToDOM("light");
    } else {
      // Default resmi selalu DARK mode
      setThemeState("dark");
      syncThemeToDOM("dark");
    }
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    localStorage.setItem("infopers_theme", next);
    syncThemeToDOM(next);
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
  };

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      <div className={`min-h-screen ${isDark ? "dark" : ""}`} suppressHydrationWarning>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
