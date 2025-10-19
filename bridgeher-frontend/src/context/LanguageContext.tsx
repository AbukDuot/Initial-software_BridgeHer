import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "English" | "Arabic";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("English");

  useEffect(() => {
    const savedLang = localStorage.getItem("app-language");
    if (savedLang === "Arabic" || savedLang === "English") {
      setLanguage(savedLang as Language);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("app-language", language);
    document.documentElement.setAttribute("dir", language === "Arabic" ? "rtl" : "ltr");
    document.documentElement.lang = language === "Arabic" ? "ar" : "en";
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "English" ? "Arabic" : "English"));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
