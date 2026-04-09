// src/utils/setAppLang.js
import i18n from "../i18n";

export function setAppLang(lang) {
  const code = (lang || "pt").slice(0, 2);
  // troca no i18next
  i18n.changeLanguage(code);
  // espelha no <html lang> + localStorage (útil p/ outros hooks)
  try { document.documentElement.lang = code; } catch {}
  try { localStorage.setItem("lang", code); } catch {}
  try { window.dispatchEvent(new Event("app:lang")); } catch {}
}
