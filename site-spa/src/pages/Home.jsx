// src/pages/Home.jsx
import ServiceImageCard from "../components/ServiceImageCard";
import torre from "../image/peca.jpg";
import pintura from "../image/pintura.jpg";
import instala from "../image/tr.jpg";
import manutencao from "../image/manu.jpg";
import { Link } from "react-router-dom";


import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";

import turbinePng from "../image/poste_.jpg";
import turbinateste from "../image/teste.png";
import Hero3DPop from "../components/Hero3D.jsx"; // ✅ versão performática

import { useT } from "../i18n-helpers";

/* ========= helpers ========= */
function useCountUp(end = 100, { duration = 1200, decimals = 0 } = {}) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(end * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
}

/* ==== reveal-on-scroll helper (fade+up+blur) ==== */
function Reveal({ children, y = 16, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      viewport={{ once: true, amount: 0.2 }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}

/* ==== stagger container (anima filhos em sequência) ==== */
const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function Kicker({ children, tone = "lime" }) {
  const tones = {
    lime: "bg-lime-100 text-lime-700 ring-lime-200",
    sky: "bg-sky-100 text-sky-700 ring-sky-200",
    brand: "bg-sky-100 text-sky-700 ring-sky-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${tones[tone]}`}
    >
      <span className="size-1.5 rounded-full bg-current/60" />
      {children}
    </span>
  );
}

function StatCard({ label, value, suffix = "", decimals = 0 }) {
  const txt = useCountUp(parseFloat(value || 0), { duration: 1200, decimals });
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div className="text-4xl font-extrabold tracking-tight md:text-5xl">
        {txt}
        <span className="text-sky-600">{suffix}</span>
      </div>
      <p className="mt-2 text-zinc-600">{label}</p>
    </motion.div>
  );
}

/* ========= Página ========= */
function Page() {
  const t = useT("home");

  return (
    <div className="bg-gradient-to-br from-sky-50 via-white to-white">
      {/* ============== HERO ============== */}
      <section
        className="relative z-[90] overflow-visible bg-gradient-to-b from-sky-100 via-emerald-50 to-white
                   after:content-[''] after:absolute after:inset-x-0 after:-bottom-1 after:h-6
                   after:bg-gradient-to-b after:from-transparent after:to-white/80"
      >
        <div className="container py-10 md:py-16">
          <div className="relative">
            {/* CARD B — IMAGEM/3D (fundo + hélice) */}
            <div className="relative">
              <Hero3DPop bg={turbinePng} turbine={turbinateste} className="z-[90]" />

              {/* selo/ISO no canto inferior direito */}
              <div className="absolute bottom-3 right-[160px] z-[230] hidden md:flex items-center gap-3
               rounded-2xl bg-white/85 px-4 py-3 shadow-lg ring-1 ring-zinc-200 backdrop-blur"
    style={{ transform: 'translateZ(20px)' }}>
                            <ShieldCheck className="size-6 text-emerald-600" />
                <div>
                  <p className="text-[11px] text-zinc-500">{t("hero.iso.badge")}</p>
                  <p className="text-[13px] font-semibold">{t("hero.iso.title")}</p>
                </div>
              </div>
            </div>

            {/* CARD A — TEXTO (sem 3D), sobreposto */}
            <div className="relative -mt-1 md:absolute md:left-6 md:top-20">
              <div className="w-full max-w-xl rounded-3xl bg-gradient-to-br from-white to-emerald-50/60 p-6 md:p-6 shadow-xl ring-1 ring-zinc-200 backdrop-blur supports-[backdrop-filter]:bg-white/80">
                <Reveal y={10}>
                  <Kicker>{t("hero.kicker")}</Kicker>
                </Reveal>

                <Reveal y={14} delay={0.05}>
                  <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight tracking-tight">
                    {t("hero.h1Start")}{" "}
                    <span className="bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                      {t("hero.h1Highlight")}
                    </span>{" "}
                    {t("hero.h1End")}
                  </h1>
                </Reveal>

                <Reveal y={14} delay={0.1}>
                  <p className="mt-4 text-zinc-700">{t("hero.lead")}</p>
                </Reveal>

                <Reveal y={12} delay={0.15}>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="/contato"
                      className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
                    >
                      {t("hero.btnQuote")}
                    </a>
                    <a
                      href="/servicos"
                      className="rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
                    >
                      {t("hero.btnServices")}
                    </a>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== SERVIÇOS ============== */}
        <section
          className="relative py-10 md:py-14 -mt-2 md:-mt-4
                     after:content-[''] after:absolute after:inset-x-0 after:-bottom-1 after:h-6
                     after:bg-gradient-to-b after:from-transparent after:to-sky-50/70"
        >
          <div className="container">
            <div className="mb-6 md:mb-8">
              <Reveal y={10}>
                <span className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700">
                  <span className="size-1.5 rounded-full bg-lime-400" />
                  {t("services.badge")}
                </span>
              </Reveal>

              <Reveal y={14} delay={0.05}>
                <h2 className="mt-3 text-2xl md:text-4xl font-extrabold tracking-tight">
                  {t("services.title")}
                </h2>
              </Reveal>

              <Reveal y={14} delay={0.1}>
                <p className="mt-2 max-w-3xl text-zinc-600">{t("services.subtitle")}</p>
              </Reveal>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid gap-4 sm:gap-5 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]"
            >
              <motion.div variants={staggerItem}>
                <ServiceImageCard
                  title={t("services.cards.towers.title")}
                  chip={t("services.cards.towers.chip")}
                  img={torre}
                  href="/servicos/torres-de-medicao"
                />
              </motion.div>

              <motion.div variants={staggerItem}>
                <ServiceImageCard
                  title={t("services.cards.painting.title")}
                  chip={t("services.cards.painting.chip")}
                  img={pintura}
                  href="/servicos/pintura-industrial"
                />
              </motion.div>

              <motion.div variants={staggerItem}>
                <ServiceImageCard
                  title={t("services.cards.equipment.title")}
                  chip={t("services.cards.equipment.chip")}
                  img={instala}
                  href="/servicos/sensores-e-calibracao"   // <- ABSOLUTO, sem ../
                />
              </motion.div>

              <motion.div variants={staggerItem}>
                <ServiceImageCard
                  title={t("services.cards.telemetry.title")}
                  chip={t("services.cards.telemetry.chip")}
                  img={manutencao}
                  href="/servicos/telemetria-e-integracao"
                />
              </motion.div>
            </motion.div>

            <Reveal y={10} delay={0.05}>
              <div className="mt-6 flex justify-center">
                <Link
                  to="/servicos"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white ring-4 ring-blue-200/60 hover:bg-blue-700 transition-colors"
                >
                  {t("services.viewAll")} <ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>


      {/* ============== RESULTADOS (3 métricas) ============== */}
      {/* menos padding + fundo intermediário + fade-up no topo */}
      <section
        className="relative py-10 md:py-14 bg-sky-50
                   before:content-[''] before:absolute before:inset-x-0 before:-top-1 before:h-6
                   before:bg-gradient-to-t before:from-white before:to-transparent
                   pointer-events-none"
      >
        <div className="container grid grid-cols-1 gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold">{t("results.availability.title")}</h3>
            <p className="mt-3 text-5xl font-extrabold">
              <span className="text-sky-700">{useCountUp(99.2, { decimals: 1 })}%</span>
            </p>
            <p className="mt-2 text-sm text-zinc-600">{t("results.availability.text")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold">{t("results.opex.title")}</h3>
            <p className="mt-3 text-5xl font-extrabold">
              <span className="text-sky-700">-{useCountUp(18)}%</span>
            </p>
            <p className="mt-2 text-sm text-zinc-600">{t("results.opex.text")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold">{t("results.slas.title")}</h3>
            <p className="mt-3 text-5xl font-extrabold">
              <span className="text-sky-700">{useCountUp(96)}%</span>
            </p>
            <p className="mt-2 text-sm text-zinc-600">{t("results.slas.text")}</p>
          </motion.div>
        </div>
      </section>

      {/* ============== CTA FINAL ============== */}
      {/* menos padding + leve pull-up + fade-up do sky-50 */}
      <section
        className="relative py-12 md:py-14 -mt-2 md:-mt-4
             before:content-[''] before:absolute before:inset-x-0 before:-top-1 before:h-6
             before:bg-gradient-to-t before:from-sky-50 before:to-transparent
             before:pointer-events-none"
      >
        <div className="container">
          <div className="rounded-3xl bg-gradient-to-r from-sky-600 to-emerald-600 p-6 text-white md:p-10">
            <Reveal y={10}>
              <h4 className="text-xl font-extrabold md:text-2xl">{t("cta.title")}</h4>
            </Reveal>

            <Reveal y={12} delay={0.05}>
              <p className="mt-2 text-white/90">{t("cta.text")}</p>
            </Reveal>

            <Reveal y={12} delay={0.1}>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="/contato"
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 hover:bg-white/90"
                >
                  {t("cta.btnContact")}
                </a>
                <a
                  href="/mapa"
                  className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold hover:bg-white/10"
                >
                  {t("cta.btnWhere")}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}

export const Component = Page;
export default Page;