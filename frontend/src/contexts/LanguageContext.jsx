import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { translations } from "../i18n/translations";

const STORAGE_KEY = "fpf-lang";
const DEFAULT = "id";

const getInitial = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT;
  } catch {
    return DEFAULT;
  }
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(getInitial);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ABAIKAN */
    }
  }, [lang]);

  const t = useCallback(
    (key, arg) => {
      const dict = translations[lang] || translations[DEFAULT];
      const val = key.split(".").reduce((acc, k) => acc?.[k], dict);
      if (typeof val !== "function") return val ?? key;
      return Array.isArray(arg) ? val(...arg) : val(arg);
    },
    [lang],
  );

  const toggle = useCallback(
    () => setLang((l) => (l === "id" ? "en" : "id")),
    [],
  );

  const value = useMemo(
    () => ({ lang, setLang, toggle, t, isEn: lang === "en" }),
    [lang, setLang, toggle, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};