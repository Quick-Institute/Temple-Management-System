import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Language = 'en' | 'si';

type Translations = {
  [key in Language]: { [key: string]: string }
};

const translations: Translations = {
  en: {
    welcome: "Welcome to Temple Management System",
    donation: "Donation",
    suggestions: "Suggestions",
    login: "Login",
    language: "Language",
  },
  si: {
    welcome: "පන්සලට සාදරයෙන් පිළිගනිමු",
    donation: "පරිත්‍යාග",
    suggestions: "යෝජනා",
    login: "පිවිසීම",
    language: "භාෂාව",
  }
};

type ContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<ContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('temple_lang') as Language;
    return saved === 'si' ? 'si' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('temple_lang', language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be inside LanguageProvider");
  return ctx;
};