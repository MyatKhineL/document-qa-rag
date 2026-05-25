"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { translations, Locale, Translations } from "./i18n";

// Shape of the context value
type LocaleContextType = {
  locale: Locale;
  t: Translations;
  toggle: () => void;
};

// Create context with EN as default
const LocaleContext = createContext<LocaleContextType>({
  locale: "en",
  t: translations.en,
  toggle: () => {},
});

// Provider — wraps the app and shares locale state with all components
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  // Toggle between EN and JP
  const toggle = () => setLocale((l) => (l === "en" ? "ja" : "en"));

  return (
    <LocaleContext.Provider value={{ locale, t: translations[locale], toggle }}>
      {children}
    </LocaleContext.Provider>
  );
}

// Custom hook — use this in any component to access locale and translations
export const useLocale = () => useContext(LocaleContext);
