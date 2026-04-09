// src/i18n/lang.js
import { useEffect, useState } from "react";

export const SUPPORTED_LANGS = ["pt", "en", "es"];

export function getCurrentLang() {
  if (typeof window !== "undefined") {
    const stored = window.localStorage?.getItem("lang");
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

    const htmlLang = (document.documentElement.lang || "").toLowerCase().slice(0, 2);
    if (SUPPORTED_LANGS.includes(htmlLang)) return htmlLang;

    const nav1 = (navigator.language || "").toLowerCase().slice(0, 2);
    const nav2 =
      Array.isArray(navigator.languages) && navigator.languages[0]
        ? navigator.languages[0].toLowerCase().slice(0, 2)
        : "";
    const nav = nav1 || nav2;
    if (SUPPORTED_LANGS.includes(nav)) return nav;
  }
  return "pt";
}

/** Atualiza idioma global, <html lang>, localStorage e emite evento que as páginas escutam. */
export function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  try {
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
    // evento customizado para componentes (ex.: News.jsx) reagirem
    window.dispatchEvent(new Event("app:lang"));
  } catch {
    /* noop */
  }
}

/** Hook simples para ler o idioma atual reativamente (sem contexto). */
export function useLanguage() {
  const [lang, set] = useState(getCurrentLang());

  useEffect(() => {
    const update = () => set(getCurrentLang());

    // observa <html lang="">
    const mo = new MutationObserver(update);
    try {
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    } catch {}

    // mudanças em outras abas
    const onStorage = (e) => {
      if (e.key === "lang") update();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("languagechange", update);
    window.addEventListener("app:lang", update);

    // intercepta setItem local na MESMA aba (para refletir imediatamente)
    const orig = localStorage.setItem;
    localStorage.setItem = function (k, v) {
      const res = orig.apply(this, arguments);
      if (k === "lang") update();
      return res;
    };

    return () => {
      try { mo.disconnect(); } catch {}
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("languagechange", update);
      window.removeEventListener("app:lang", update);
      localStorage.setItem = orig;
    };
  }, []);

  return lang;
}

/**
 * Provider "no-op" só para compatibilidade com main.jsx.
 * Não usa JSX para não exigir extensão .jsx.
 * Se quiser de fato fornecer contexto, podemos evoluir depois.
 */
export function LanguageProvider({ children }) {
  return children;
}

// Opcional: rótulos globais mínimos
export const UI_COMMON = Object.freeze({
  pt: { brand: "IS Indústria" },
  en: { brand: "IS Industry" },
  es: { brand: "IS Industria" },
});

export default {
  SUPPORTED_LANGS,
  getCurrentLang,
  setLang,
  useLanguage,
  LanguageProvider,
  UI_COMMON,
};
