// src/components/Navbar.jsx
import { Link, NavLink, useLocation } from "react-router-dom";
import { Linkedin, Instagram, ShieldCheck } from "lucide-react";
import React, { memo, useMemo, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { setAppLang } from "../utils/setAppLang";

import logo from "../image/logo.png";
// Bandeiras
import brFlag from "../image/svg-idioma/br.svg";
import usFlag from "../image/svg-idioma/us.svg";
import esFlag from "../image/svg-idioma/es.svg";

const linkBase = "hover:text-brand-700 transition";
const SOCIAL_LINKS = {
  linkedin: "https://br.linkedin.com/company/isindustria",
  instagram: "https://www.instagram.com/isindustria/",
};

function getActiveLang() {
  const html = typeof document !== "undefined" ? document.documentElement.lang : "";
  const ls = typeof window !== "undefined" ? localStorage.getItem("lang") : "";
  return (html || ls || "pt").slice(0, 2);
}

/* Sincroniza i18n -> <html lang> + localStorage + evento */
function LangBridge() {
  const { i18n } = useTranslation("common");
  useEffect(() => {
    const code = (i18n.language || "pt").slice(0, 2);
    try {
      document.documentElement.lang = code;
    } catch {}
    try {
      localStorage.setItem("lang", code);
    } catch {}
    try {
      window.dispatchEvent(new Event("app:lang"));
    } catch {}
  }, [i18n.language]);
  return null;
}

/* Botão de bandeira (somente imagem) */
const FlagIconBtn = memo(function FlagIconBtn({ code, img, labelKey }) {
  const { t, i18n } = useTranslation("common");
  const active = useMemo(() => {
    const fromI18n = i18n?.language?.slice(0, 2);
    return (fromI18n || getActiveLang()) === code;
  }, [i18n?.language, code]);

  return (
    <button
      type="button"
      onClick={() => setAppLang(code)}
      aria-pressed={active}
      title={t(labelKey)}
      className={[
        "grid place-items-center rounded-full transition ring-1",
        active ? "ring-brand-600 bg-brand-600/10" : "ring-zinc-300 hover:bg-zinc-50",
      ].join(" ")}
      style={{ width: 40, height: 40 }}
    >
      <img src={img} alt={t(labelKey)} className="h-6 w-6 select-none" loading="lazy" decoding="async" />
    </button>
  );
});

/* Grupo de bandeiras (somente imagens) */
function LangSwitcherIcons({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <FlagIconBtn code="pt" img={brFlag} labelKey="lang.pt" />
      <FlagIconBtn code="en" img={usFlag} labelKey="lang.en" />
      <FlagIconBtn code="es" img={esFlag} labelKey="lang.es" />
    </div>
  );
}

export default function Navbar() {
  const { t } = useTranslation("common");
  const location = useLocation();

  // Drawer state/infra
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // fecha ao mudar de rota
  useEffect(() => setOpen(false), [location.pathname]);

  // fecha com ESC e ao subir para desktop (lg)
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // fecha ao clicar fora do painel
  useEffect(() => {
    const onClickOutside = (e) => {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // trava o scroll do body quando o drawer abre
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [open]);

  return (
    <>
      <LangBridge />

      {/* HEADER fixo */}
      <header className="sticky top-0 z-[1000] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" aria-label={t("brand")}>
            <img src={logo} alt={t("brand") || "IS Indústria"} className="h-12 w-auto object-contain" />
          </Link>

          {/* NAV (desktop) */}
          <nav className="hidden items-center gap-6 text-sm lg:flex">
            <NavLink to="/" end className={linkBase}>
              {t("") ?? "Início"}
            </NavLink>
            <NavLink to="/QuemSomos" className={linkBase}>
              {t("nav.quem")}
            </NavLink>
            <NavLink to="/certificados" className={linkBase}>
              {t("nav.certificados")}
            </NavLink>
            <NavLink to="/servicos" className={linkBase}>
              {t("nav.servicos")}
            </NavLink>
            <NavLink to="/mapa" className={linkBase}>
              {t("nav.mapa")}
            </NavLink>
            <NavLink to="/noticias" className={linkBase}>
              {t("nav.noticias")}
            </NavLink>
            <NavLink to="/carreiras" className={linkBase}>
              {t("nav.carreiras")}
            </NavLink>

            {/* ✅ Compliance no menu */}
            <NavLink to="/compliance" className={linkBase}>
              {t("nav.compliance")}
            </NavLink>
          </nav>

          {/* LANG + CTA + Compliance (desktop) */}
          <div className="hidden items-center gap-3 lg:flex">
            <LangSwitcherIcons />



            {/* CTA contato */}
            <Link
              to="/contato"
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {t("cta")}
            </Link>
          </div>

          {/* HAMBÚRGUER (mobile/tablet) */}
          {!open && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              aria-controls="mobile-drawer"
              aria-expanded={open}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white p-2 text-zinc-700 shadow-sm transition hover:bg-zinc-100 focus:outline-none focus-visible:ring focus-visible:ring-brand-600/30 lg:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="3.5" y1="6" x2="20.5" y2="6" strokeWidth="2" strokeLinecap="round" />
                <line x1="3.5" y1="12" x2="20.5" y2="12" strokeWidth="2" strokeLinecap="round" />
                <line x1="3.5" y1="18" x2="20.5" y2="18" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* OVERLAY + DRAWER (mobile) */}
        <div id="mobile-drawer" className="lg:hidden" aria-hidden={!open}>
          <div
            onClick={() => setOpen(false)}
            className={`fixed inset-0 z-[1400] bg-black/40 backdrop-blur-[1px] transition-opacity ${
              open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          />
          <div
            ref={panelRef}
            className={`fixed top-0 left-0 z-[1500] flex h-screen w-80 max-w-[88vw] flex-col border-r border-zinc-200 bg-white shadow-2xl transition-transform duration-200 ${
              open ? "translate-x-0" : "-translate-x-full"
            }`}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4">
              <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                <img src={logo} alt={t("brand") || "IS Indústria"} className="h-8 w-auto object-contain" />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-zinc-700 hover:bg-zinc-100 focus:outline-none focus-visible:ring focus-visible:ring-brand-600/30"
                aria-label="Fechar menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
                  <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-3">
              <ul className="space-y-1">
                {[
                  { to: "/", txt: t("") ?? "Início", end: true },
                  { to: "/QuemSomos", txt: t("nav.quem") },
                  { to: "/certificados", txt: t("nav.certificados") },
                  { to: "/servicos", txt: t("nav.servicos") },
                  { to: "/mapa", txt: t("nav.mapa") },
                  { to: "/noticias", txt: t("nav.noticias") },
                  { to: "/carreiras", txt: t("nav.carreiras") },
                  { to: "/compliance", txt: t("nav.compliance") }, // ✅ compliance no mobile
                ].map((l) => (
                  <li key={l.to}>
                    <NavLink
                      to={l.to}
                      end={l.end}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-base font-medium ${
                          isActive ? "bg-zinc-100 text-brand-700" : "text-zinc-800 hover:bg-zinc-100"
                        }`
                      }
                    >
                      {l.txt}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <div className="mt-4 px-1">
                <LangSwitcherIcons />
              </div>

              {/* ✅ botões do rodapé do drawer */}
              <div className="mt-4 px-1 grid gap-2">
                <Link
                  to="/compliance"
                  onClick={() => setOpen(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  {t("nav.compliance")}
                </Link>

                <Link
                  to="/contato"
                  onClick={() => setOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-full bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                  {t("cta")}
                </Link>
              </div>

              <div className="mt-6 flex items-center gap-2 px-1">
                <a
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("social.linkedin")}
                  title={t("social.linkedin")}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 transition hover:bg-zinc-50"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("social.instagram")}
                  title={t("social.instagram")}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 transition hover:bg-zinc-50"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}