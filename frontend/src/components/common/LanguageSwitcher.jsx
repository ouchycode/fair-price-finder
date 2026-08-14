import React from "react";
import { useLanguage } from "../../hooks/useI18n";

const IndonesiaFlag = () => (
  <svg
    width="18"
    height="12"
    viewBox="0 0 18 12"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="18" height="6" fill="#CE1126" />
    <rect y="6" width="18" height="6" fill="#fff" />
  </svg>
);

const EnglandFlag = () => (
  <svg
    width="18"
    height="12"
    viewBox="0 0 60 30"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="60" height="30" fill="#012169" />
    <path d="M0,0 60,30 M60,0 0,30" stroke="#fff" strokeWidth="6" fill="none" />
    <path d="M0,0 60,30 M60,0 0,30" stroke="#C8102E" strokeWidth="3.5" fill="none" />
    <path d="M0,15 60,15 M30,0 30,30" stroke="#fff" strokeWidth="10" fill="none" />
    <path d="M0,15 60,15 M30,0 30,30" stroke="#C8102E" strokeWidth="6" fill="none" />
  </svg>
);

const FLAGS = {
  id: <IndonesiaFlag />,
  en: <EnglandFlag />,
};

const FLAG_LABELS = {
  id: "Bahasa Indonesia",
  en: "English",
};

const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();

  const next = lang === "id" ? "en" : "id";

  return (
    <button
      type="button"
      className="lang-switcher icon-btn"
      onClick={() => setLang(next)}
      aria-label={`${FLAG_LABELS[lang]} - klik untuk beralih ke ${FLAG_LABELS[next]}`}
      title={`${FLAG_LABELS[lang]} - switch to ${FLAG_LABELS[next]}`}
    >
      {FLAGS[lang]}
    </button>
  );
};

export default LanguageSwitcher;