import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import pt from "./locales/pt/common.json";
import en from "./locales/en/common.json";
import es from "./locales/es/common.json";

const savedLang = localStorage.getItem("lang") || "pt";

i18n
  .use(initReactI18next)
  .init({
    resources: { pt: { common: pt }, en: { common: en }, es: { common: es } },
    lng: savedLang,
    fallbackLng: "pt",
    interpolation: { escapeValue: false },
    defaultNS: "common",
    ns: ["common"],
  });

// ... sua config do i18next
i18n.on("languageChanged", (lng) => {
  try { localStorage.setItem("lang", lng); } catch {}
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng.startsWith("pt") ? "pt-BR"
      : lng.startsWith("es") ? "es"
      : "en";
  }
});

// opcional: recuperar preferido ao carregar
const stored = typeof localStorage !== "undefined" && localStorage.getItem("lang");
if (stored) i18n.changeLanguage(stored);


export default i18n;
