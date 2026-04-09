// src/i18n/useLang.js
import { useSyncExternalStore } from "react";

const SUP = ["pt", "en", "es"];

function readLang() {
  try {
    const fromLS = window.localStorage?.getItem("lang") || "";
    const html = document.documentElement.lang || "";
    const nav =
      navigator.language || (navigator.languages && navigator.languages[0]) || "";

    const pick = (v) => {
      const s = v.toLowerCase().slice(0, 2);
      return SUP.includes(s) ? s : null;
    };

    return pick(fromLS) || pick(html) || pick(nav) || "pt";
  } catch {
    return "pt";
  }
}

function subscribe(cb) {
  const handler = () => cb();
  // troca de idioma disparada pelo app
  window.addEventListener("app:lang", handler);
  // mudanças no localStorage (outra aba/janela)
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("app:lang", handler);
    window.removeEventListener("storage", handler);
  };
}

export function useLang() {
  return useSyncExternalStore(subscribe, readLang, readLang);
}

// helper para usar no botão/toggle
export function setLang(lang) {
  const safe = SUP.includes(lang) ? lang : "pt";
  try {
    localStorage.setItem("lang", safe);
    document.documentElement.lang = safe;
  } catch {}
  // notifica todos os componentes assinantes
  window.dispatchEvent(new Event("app:lang"));
}
