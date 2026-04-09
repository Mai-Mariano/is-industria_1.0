import iso from "../image/iso.jpeg";
import isoteste from "../image/iso-9001.png";
import esg from "../image/esg2.png";

import iso9001Pdf from "../assets/docs/iso-9001.pdf";
import ESG from "../assets/docs/ESG.pdf";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  FileCheck2,
  ShieldCheck,
  BadgeCheck,
  ArrowRight,
  ChevronDown,
  X,
  Download,
  ExternalLink,
} from "lucide-react";

import { useT } from "../i18n-helpers";

// ===== contador 0->end
function useCountUp(end = 100, { duration = 1200, decimals = 0, suffix = "" } = {}) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const step = (t) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(end * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, duration]);
  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  return `${formatted}${suffix}`;
}

// ===== config fixa dos certificados (PDF/logo/cor)
const CERT_ITEMS = [
  { id: "iso9001", sigla: "ISO 9001", logo: isoteste, href: iso9001Pdf, color: "from-emerald-500 to-emerald-600" },
  { id: "esg",     sigla: "ESG",      logo: esg,       href: ESG,        color: "from-sky-500 to-sky-600" },
];

// ===== acordeão simples
function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
      {items.map((it, i) => (
        <div key={i} className="p-4">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-sky-900">{it.q}</span>
            <ChevronDown className={`size-4 transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden pl-0.5 pt-2 text-sm text-zinc-600"
              >
                {it.a}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ===== modal PDF
function PdfModal({ open, onClose, fileUrl, title, t }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          {/* conteúdo */}
          <motion.div
            className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10"
            initial={{ y: 30, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
          >
            {/* header */}
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-sky-900">{title}</p>
                <p className="truncate text-xs text-zinc-500">{fileUrl}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={fileUrl}
                  download
                  className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
                >
                  <Download className="size-3.5" />
                  {t("buttons.download")}
                </a>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
                >
                  <ExternalLink className="size-3.5" />
                  {t("buttons.openNewTab")}
                </a>
                <button
                  onClick={onClose}
                  className="inline-grid size-8 place-items-center rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  aria-label={t("buttons.close")}
                  title={t("buttons.close")}
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* corpo preview */}
            <div className="h-[70vh] bg-zinc-50">
              <iframe title={title} src={fileUrl} className="h-full w-full" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Page() {
  const t = useT("certs");

  // KPIs (só números animados, labels via t)
  const kpiA = useCountUp(99.6, { duration: 1400, decimals: 1, suffix: "%" });
  const kpiB = useCountUp(6, { duration: 1200, suffix: "/ano" });
  const kpiC = useCountUp(20, { duration: 1200, suffix: "+" });

  // estado modal PDF
  const [modalOpen, setModalOpen] = useState(false);
  const [activePdf, setActivePdf] = useState({ url: "", title: "" });
  const openPdf = (url, title) => { setActivePdf({ url, title }); setModalOpen(true); };

  // dados traduzidos
  const audits = t("audits.items", { returnObjects: true }) || [];
  const faqItems = t("faq.items", { returnObjects: true }) || [];

  return (
    <div className="bg-white">
      {/* HERO */}
      <section
        className="relative isolate overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.25)), url(${iso})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/55 via-black/35 to-white/0" />
        <div className="relative z-10 container py-16 md:py-24 min-h-[46vh] md:min-h-[54vh]">
          <div className="mx-auto max-w-3xl text-center text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/25">
              <BadgeCheck className="size-3.5" />
              {t("hero.badge")}
            </span>
            <h1 className="mt-3 text-[30px] md:text-[44px] font-black leading-tight tracking-tight drop-shadow-[0_6px_24px_rgba(0,0,0,.6)] [-webkit-text-stroke:0.5px_rgba(0,0,0,.35)]">
              {t("hero.title")}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-white/95">{t("hero.lead")}</p>

            {/* KPIs */}
            <div className="mx-auto mt-6 grid max-w-2xl grid-cols-3 gap-3 text-left text-black">
              <div className="rounded-2xl bg-white/90 p-3 text-center shadow-sm ring-1 ring-white/60">
                <div className="text-2xl font-extrabold">{kpiA}</div>
                <div className="text-[11px] text-zinc-600">{t("kpis.approval")}</div>
              </div>
              <div className="rounded-2xl bg-white/90 p-3 text-center shadow-sm ring-1 ring-white/60">
                <div className="text-2xl font-extrabold">{kpiB}</div>
                <div className="text-[11px] text-zinc-600">{t("kpis.auditsPerYear")}</div>
              </div>
              <div className="rounded-2xl bg-white/90 p-3 text-center shadow-sm ring-1 ring-white/60">
                <div className="text-2xl font-extrabold">{kpiC}</div>
                <div className="text-[11px] text-zinc-600">{t("kpis.yearsSgi")}</div>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="#certificados"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-md hover:bg-white/90"
              >
                {t("buttons.seeCertificates")} <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CARDS CERTIFICADOS */}
      <section id="certificados" className="-mt-10 md:-mt-14 pb-4">
        <div className="container grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CERT_ITEMS.map((c) => (
            <div
              key={c.id}
              className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
            >
              {/* fita */}
              <div className={`absolute -left-10 -top-10 h-24 w-24 rotate-45 bg-gradient-to-br ${c.color} opacity-90`} />
              <div className="relative">
                <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700 ring-1 ring-emerald-100">
                  <ClipboardCheck className="size-4" />
                  <span className="text-xs font-semibold">{t("labels.certificate")}</span>
                </div>

                <h3 className="text-xl font-extrabold tracking-tight text-sky-900">{c.sigla}</h3>
                <p className="mt-1 text-sm text-zinc-600">{t(`cards.${c.id}.name`)}</p>

                {/* logo canto */}
                {c.logo && (
                  <div className="absolute right-4 top-4 z-10 h-10 w-10 rounded-md bg-white/95 p-1 ring-1 ring-zinc-200 shadow-sm grid place-items-center">
                    <img
                      src={c.logo}
                      alt={`Logo ${c.sigla}`}
                      className="h-full w-full object-contain"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>
                )}

                {/* marca d'água */}
                {c.logo && (
                  <img
                    aria-hidden="true"
                    src={c.logo}
                    className="pointer-events-none absolute -bottom-6 -right-4 w-28 h-auto object-contain opacity-10 blur-[0.5px] saturate-0"
                  />
                )}

                {/* botões */}
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => openPdf(c.href, `${c.sigla} — ${t(`cards.${c.id}.name`)}`)}
                    className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    {t("buttons.preview")} <FileCheck2 className="size-4" />
                  </button>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                  >
                    {t("buttons.openPdf")} <ExternalLink className="size-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AUDITORIAS / LINHA DO TEMPO */}
      <section className="py-10 md:py-14">
        <div className="container">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1 text-[11px] font-semibold text-lime-700 ring-1 ring-lime-200">
              <ShieldCheck className="size-4" />
              {t("audits.badge")}
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-sky-900">{t("audits.title")}</h2>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600">{t("audits.blurb")}</p>
          </div>

          <ol className="relative ml-3 border-l border-zinc-200">
            {audits.map((a, i) => (
              <li key={i} className="mb-6 ml-4">
                <div className="absolute -left-2.5 mt-1 size-5 rounded-full border-2 border-white bg-emerald-500 ring-2 ring-emerald-200" />
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-sky-900">
                      {a.year} • {a.type}
                    </p>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      {a.status}
                    </span>
                  </div>
                    <p className="mt-1 text-sm text-zinc-600">{a.org}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-6 md:py-10">
        <div className="container grid gap-6 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight text-sky-900">{t("faq.title")}</h3>
            <p className="mt-1 text-sm text-zinc-600">{t("faq.subtitle")}</p>
            <div className="mt-4">
              <Accordion items={faqItems} />
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-sky-900">{t("commitment.title")}</h4>
            <p className="mt-2 text-sm text-zinc-700">{t("commitment.p1")}</p>
            <ul className="mt-3 list-disc pl-5 text-sm text-zinc-700">
              {(t("commitment.bullets", { returnObjects: true }) || []).map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="pb-16">
        <div className="container">
          <div className="rounded-3xl bg-gradient-to-r from-sky-600 to-emerald-600 p-6 md:p-10 text-white">
            <h4 className="text-xl md:text-2xl font-extrabold">{t("cta.title")}</h4>
            <p className="mt-2 text-white/90">{t("cta.text")}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="/contato" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 hover:bg-white/90">
                {t("cta.btnContact")}
              </a>
              <a href="#certificados" className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold hover:bg-white/10">
                {t("cta.btnCertificates")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL */}
      <PdfModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fileUrl={activePdf.url}
        title={activePdf.title}
        t={t}
      />
    </div>
  );
}

export const Component = Page;
export default Page;
