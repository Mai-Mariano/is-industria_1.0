// src/pages/Services.jsx
import React, { useMemo, useState, useRef, lazy, Suspense, memo } from "react";
import { motion, useInView, MotionConfig } from "framer-motion";
import { useTranslation } from "react-i18next";

// code-splitting do card (carrega sob demanda)
const ServiceCardBubble = lazy(() => import("../components/ServiceCardBubble"));

// imagens
import tr from "../image/vento.jpeg";
import pintura from "../image/pintura.jpg";
import torre from "../image/peca.jpg";
import instala from "../image/tr.jpg";
import manutencao from "../image/manu.jpg";
import fio from "../image/fio.jpg";
import equi from "../image/equi.jpg";

import { ArrowRight, Factory, Wrench, Network, Gauge, Layers } from "lucide-react";

/* ====== TONS/ÍCONES por área ====== */
const AREA_STYLE = {
  fabricacao: {
    icon: Factory,
    tone: { bgLight: "bg-sky-50", text: "text-sky-800", ring: "ring-sky-200", gradFrom: "from-sky-600", gradTo: "to-sky-400" },
  },
  campo: {
    icon: Wrench,
    tone: { bgLight: "bg-lime-50", text: "text-lime-800", ring: "ring-lime-200", gradFrom: "from-lime-600", gradTo: "to-lime-400" },
  },
  integracao: {
    icon: Network,
    tone: { bgLight: "bg-violet-50", text: "text-violet-800", ring: "ring-violet-200", gradFrom: "from-violet-600", gradTo: "to-violet-400" },
  },
  equipamentos: {
    icon: Gauge,
    tone: { bgLight: "bg-emerald-50", text: "text-emerald-800", ring: "ring-emerald-200", gradFrom: "from-emerald-600", gradTo: "to-emerald-400" },
  },
};

/* ====== Lista base (usa tuas imagens) ====== */
const SERVICE_ITEMS = [
  // FABRICAÇÃO
  { key: "towers", slug: "torres-de-medicao", img: torre, area: "fabricacao" },
  { key: "painting", slug: "pintura-industrial", img: pintura, area: "fabricacao" },
  // CAMPO / O&M
  { key: "install", slug: "instalacao-e-instrumentacao", img: instala, area: "campo" },
  { key: "maintenance", slug: "manutencao-preventiva-corretiva", img: manutencao, area: "campo" },
  // INTEGRAÇÃO
  { key: "telemetry", slug: "telemetria-e-integracao", img: fio, area: "integracao" },
  // EQUIPAMENTOS
  { key: "equipment", slug: "sensores-e-calibracao", img: equi, area: "equipamentos" },
];

/* ====== animações (leves) ====== */
const containerStagger = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};
const itemFade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: "easeOut" } },
};

/* ====== Pill de sessão ====== */
function SectionKicker({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/25">
      <span className="size-1.5 rounded-full bg-lime-300" />
      {children}
    </span>
  );
}

/* ====== Skeleton do card (shimmer) ====== */
function SkeletonCard() {
  return (
    <div className="h-[300px] w-full overflow-hidden rounded-2xl bg-zinc-100">
      <div className="h-full w-full animate-[shimmer_1.6s_linear_infinite] bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(255,255,255,0.55)_50%,rgba(0,0,0,0)_100%)] bg-[length:200%_100%]" />
    </div>
  );
}

/* ====== Monta o card só quando entra na viewport ====== */
function LazyServiceCard({ s, t }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.05, once: true });
  return (
    <div ref={ref}>
      <Suspense fallback={<SkeletonCard />}>
        {inView ? (
          <ServiceCardBubble
            title={t(`services.list.${s.key}.title`)}
            img={s.img}
            chip={t(`services.list.${s.key}.chip`)}
            href={`/servicos/${s.slug}`}
          />
        ) : (
          <SkeletonCard />
        )}
      </Suspense>
    </div>
  );
}

/* ====== Abas (áreas) com contadores ====== */
const AreasTabs = memo(function AreasTabs({ active, onChange, counts, t }) {
  const AREAS = useMemo(
    () => [
      { key: "todos", label: t("services.filters.all"), icon: Layers, desc: t("services.filters.allDesc") },
      ...["fabricacao", "campo", "integracao", "equipamentos"].map((k) => {
        const MetaIcon = AREA_STYLE[k].icon;
        return { key: k, label: t(`services.areas.${k}.label`), icon: MetaIcon, desc: t(`services.areas.${k}.desc`) };
      }),
    ],
    [t]
  );

  return (
    <div className="container -mt-6 pb-2 md:-mt-10" style={{ contentVisibility: "auto", containIntrinsicSize: "120px" }}>
      <div className="mx-auto max-w-5xl rounded-2xl bg-white/80 p-2 shadow-sm ring-1 ring-zinc-200 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          {AREAS.map((a) => {
            const is = active === a.key;
            const tone =
              a.key in AREA_STYLE
                ? AREA_STYLE[a.key].tone
                : { bgLight: "bg-zinc-100", text: "text-zinc-900", ring: "ring-zinc-200", gradFrom: "from-zinc-700", gradTo: "to-zinc-500" };
            const Icon = a.icon;
            return (
              <button
                key={a.key}
                onClick={() => onChange(a.key)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition ${
                  is ? `text-white ring-1 ${tone.ring}` : "bg-white text-zinc-800 ring-1 ring-zinc-200 hover:bg-zinc-50"
                }`}
                style={is ? { backgroundImage: "linear-gradient(90deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.35) 100%)" } : undefined}
                title={a.desc}
              >
                <Icon className={`size-4 ${is ? "" : "text-zinc-600"}`} />
                {a.label}
                <span className={`rounded-full px-2 py-[2px] text-[11px] ${is ? "bg-white/20" : "bg-zinc-100"}`}>{counts[a.key] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

/* ====== Cabeçalho da área ====== */
const AreaHeader = memo(function AreaHeader({ areaKey, t }) {
  const style = AREA_STYLE[areaKey];
  if (!style) return null;
  const Icon = style.icon;
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <div className={`inline-grid size-9 place-items-center rounded-xl ${style.tone.bgLight} ${style.tone.text} ring-1 ${style.tone.ring}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-sky-900 md:text-2xl">{t(`services.areas.${areaKey}.label`)}</h3>
          <p className="text-xs text-zinc-600">{t(`services.areas.${areaKey}.desc`)}</p>
        </div>
      </div>
      <div className={`mt-3 h-1.5 w-28 rounded-full bg-gradient-to-r ${style.tone.gradFrom} ${style.tone.gradTo}`} />
    </div>
  );
});

/* ====== Seção de cards (grupo) ====== */
function AreaSection({ areaKey, items, t }) {
  if (!items?.length) return null;
  return (
    <section className="py-8" style={{ contentVisibility: "auto", containIntrinsicSize: "900px" }}>
      <div className="container">
        <AreaHeader areaKey={areaKey} t={t} />
        <motion.div
          variants={containerStagger}         // <- estava errado antes
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2, margin: "-80px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {items.map((s) => (
            <motion.div key={s.slug} variants={itemFade}>
              <LazyServiceCard s={s} t={t} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* =========================== PÁGINA =========================== */
function ServicesIndexPage() {
  const { t } = useTranslation();
  const [area, setArea] = useState("todos");

  const grouped = useMemo(() => {
    const by = { fabricacao: [], campo: [], integracao: [], equipamentos: [] };
    for (const s of SERVICE_ITEMS) if (by[s.area]) by[s.area].push(s);
    return by;
  }, []);

  const counts = useMemo(() => {
    const base = { todos: SERVICE_ITEMS.length };
    for (const k of Object.keys(grouped)) base[k] = grouped[k]?.length || 0;
    return base;
  }, [grouped]);

  const filtered = useMemo(
    () => (area === "todos" ? SERVICE_ITEMS : SERVICE_ITEMS.filter((s) => s.area === area)),
    [area]
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-white">
        {/* ================= HERO ================= */}
        <section className="relative isolate overflow-hidden">
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center"
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.25)), url(${tr})` }}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-900/45 via-sky-900/20 to-transparent" />

          <div className="container flex min-h-[52vh] items-center py-12 md:min-h-[60vh] md:py-16">
            <div className="max-w-3xl text-white">
              <SectionKicker>{t("services.hero.badge")}</SectionKicker>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">{t("services.hero.title")}</h1>
              <p className="mt-3 max-w-2xl text-white/90">{t("services.hero.lead")}</p>
              <div className="mt-6">
                <a
                  href="/contato"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-md hover:bg-white/90"
                >
                  {t("cta")} <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ABAS (filtro) ===== */}
        <AreasTabs active={area} onChange={setArea} counts={counts} t={t} />

        {/* ===== CONTEÚDO ===== */}
        {area === "todos" ? (
          <>
            <AreaSection areaKey="fabricacao" items={grouped.fabricacao} t={t} />
            <AreaSection areaKey="campo" items={grouped.campo} t={t} />
            <AreaSection areaKey="integracao" items={grouped.integracao} t={t} />
            <AreaSection areaKey="equipamentos" items={grouped.equipamentos} t={t} />
          </>
        ) : (
          <section className="py-8">
            <div className="container">
              <AreaHeader areaKey={area} t={t} />
              <motion.div
                key={area}                         // força remontagem ao trocar de aba
                variants={containerStagger}
                initial="hidden"
                animate="show"                     // anima imediatamente (sem depender do viewport)
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {filtered.map((s) => (
                  <motion.div key={`${area}-${s.slug}`} variants={itemFade}>
                    <LazyServiceCard s={s} t={t} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}
      </div>
    </MotionConfig>
  );
}

export const Component = ServicesIndexPage;
export default ServicesIndexPage;
