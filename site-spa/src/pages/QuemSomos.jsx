// src/pages/QuemSomos.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import {
  DraftingCompass, Factory, Paintbrush, Gauge, Cable, Wrench, GlobeLock,
  Target, Eye, Handshake, ShieldCheck, Award, Leaf, Users, ArrowRight
} from "lucide-react";
import peca from "../image/empresa.jpg";
import tr from "../image/empresa.png";
import luiz from "../image/luiz.png";
import leandro from "../image/leandro.png";
import lucas from "../image/lucas.png";
import igor from "../image/igor.png";
import everton from "../image/everton.png";
import josue from "../image/josue.png";
import hanna from "../image/hanna.png";
import thiago from "../image/thiago.jpeg";
import videoRef from "../image/empresa.mov";
import { useT, Tx } from "../i18n-helpers";

/* ===========================
   TOGGLE: desativar animações
   =========================== */
const NO_ANIM = true;

/* ==== helpers visuais ==== */
const fadeUp = (d = 0) =>
  NO_ANIM
    ? {} // sem props de animação = renderiza fixo e imediato
    : {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-120px" },
        transition: { duration: 0.6, delay: d, ease: "easeOut" },
      };

function SectionBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/20 backdrop-blur">
      <span className="size-1.5 rounded-full bg-lime-300" />
      {children}
    </span>
  );
}

function DividerGrad() {
  return <div className="mx-auto mt-6 h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />;
}

/* ==== contador (sem animação quando NO_ANIM=true) ==== */
function useCountUpWhenVisible(end = 100, { duration = 1200, suffix = "", decimals = 0 } = {}) {
  const [value, setValue] = useState(NO_ANIM ? end : 0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (NO_ANIM) {
      setValue(end);
      return;
    }
    if (!inView) return;

    let raf;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(end * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration]);

  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  return { ref, text: `${formatted}${suffix}` };
}

function Stat({ value, label, suffix = "", decimals = 0, delay = 0 }) {
  const { ref, text } = useCountUpWhenVisible(value, { duration: 1000 + delay * 100, suffix, decimals });
  return (
    <motion.div
      {...fadeUp(delay)}
      className="group rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm ring-1 ring-white/40 backdrop-blur hover:bg-white"
    >
      <p ref={ref} className="text-4xl font-extrabold tracking-tight text-sky-900 md:text-5xl">
        {text}
      </p>
      <p className="mt-2 text-zinc-600">{label}</p>
      <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-sky-500 to-blue-500" />
    </motion.div>
  );
}

/* ==== Página ==== */
function Page() {
  const t = useT("about");

  const cards = useMemo(
    () => [
      { icon: DraftingCompass, title: t("cards.design.title"),     text: t("cards.design.text"),     stripe: "from-sky-400 to-sky-600" },
      { icon: Factory,         title: t("cards.factory.title"),    text: t("cards.factory.text"),    stripe: "from-slate-400 to-slate-600" },
      { icon: Paintbrush,      title: t("cards.paint.title"),      text: t("cards.paint.text"),      stripe: "from-amber-400 to-amber-600" },
      { icon: Gauge,           title: t("cards.measure.title"),    text: t("cards.measure.text"),    stripe: "from-emerald-400 to-emerald-600" },
      { icon: Cable,           title: t("cards.integrate.title"),  text: t("cards.integrate.text"),  stripe: "from-indigo-400 to-indigo-600" },
      { icon: Wrench,          title: t("cards.field.title"),      text: t("cards.field.text"),      stripe: "from-rose-400 to-rose-600" },
      { icon: GlobeLock,       title: t("cards.compliance.title"), text: t("cards.compliance.text"), stripe: "from-teal-400 to-teal-600" },
    ],
    [t]
  );

  const rawTimeline = t("timeline.items", { returnObjects: true });
  const timeline = Array.isArray(rawTimeline) ? rawTimeline : [];

  const team = [
    { name: "Igor Solotoriw",        roleKey: "team.roles.opsDirector",          photo: igor },
    { name: "Thiago Souza",          roleKey: "team.roles.fieldEngineerImplat",    photo: thiago },
    { name: "Luiz Felipe Moreira",   roleKey: "team.roles.fieldEngineerWind",    photo: luiz },
    { name: "Lucas Alvieiro",        roleKey: "team.roles.paintCoordinator",     photo: lucas },
    { name: "Hanna Ziliotto",        roleKey: "team.roles.certificationReports1", photo: hanna },
    { name: "Leandro Neves",         roleKey: "team.roles.certificationReports", photo: leandro },
    { name: "Everton Andrade",       roleKey: "team.roles.projectsPMO",          photo: everton },
    { name: "Josué Benjamin",        roleKey: "team.roles.certificationReports2", photo: josue },
  ];

  return (
    <div className="bg-white">
      {/* ================= HERO ================= */}
      <section className="relative isolate overflow-hidden">
        {/* fundo com imagem + gradientes + glow radial */}
        <div className="absolute inset-0 -z-20 overflow-hidden">
          {/* Vídeo de fundo */}
          <video
            className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
            src={videoRef}
            poster={tr}
            autoPlay
            muted
            loop
            playsInline
            onPlay={(e) => {
              e.currentTarget.defaultPlaybackRate = 1.5;
              e.currentTarget.playbackRate = 1.5;
            }}
            aria-hidden="true"
          />
          {/* Overlay */}
          <div
            className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[rgba(2,15,30,0.60)] to-[rgba(2,15,30,0.35)]"
            aria-hidden="true"
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(800px_400px_at_20%_10%,rgba(14,165,233,.35),transparent),radial-gradient(600px_300px_at_90%_30%,rgba(59,130,246,.28),transparent)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-900/35 via-transparent to-white/0" />

        <div className="container relative flex min-h-[52vh] items-center py-12 md:min-h-[60vh] md:py-16">
          <motion.div {...fadeUp()} className="max-w-3xl text-white">
            <SectionBadge>{t("hero.badge")}</SectionBadge>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
              {t("hero.h1Start")}{" "}
              <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-white bg-clip-text text-transparent">
                {t("hero.h1Highlight")}
              </span>
              .
            </h1>
            <p className="mt-3 max-w-2xl text-white/90">
              <Tx prefix="about" k="hero.lead" components={{ b: <b /> }} />
            </p>
            <div className="mt-6">
              <a
                href="/contato"
                className="shine inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-md hover:bg-white/90"
              >
                {t("hero.cta")} <ArrowRight className="size-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= STORY ================= */}
      <section className="py-16 md:py-24">
        <div className="container grid items-start gap-10 md:grid-cols-[1.1fr_.9fr]">
          <motion.div {...fadeUp()}>
            <h2 className="text-2xl font-extrabold tracking-tight md:text-4xl">{t("story.title")}</h2>
            <DividerGrad />
            <div className="prose prose-zinc mt-6 max-w-none">
              <p><Tx prefix="about" k="story.p1" components={{ strong: <strong /> }} /></p>
              <p><Tx prefix="about" k="story.p2" components={{ strong: <strong /> }} /></p>
              <p><Tx prefix="about" k="story.p3" components={{ strong: <strong /> }} /></p>
              <p><Tx prefix="about" k="story.p4" components={{ strong: <strong /> }} /></p>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="relative">
            <div className="overflow-hidden rounded-3xl border border-zinc-200 shadow-[0_40px_120px_-40px_rgba(2,132,199,.35)]">
              <img
                src={tr}
                alt={t("story.imageAlt")}
                className="h-[320px] w-full object-cover md:h-[420px]"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* selos “glass” flutuantes */}
            <div className="pointer-events-none absolute -bottom-6 left-6 hidden gap-2 md:flex">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm ring-1 ring-zinc-200 shadow-sm">
                <ShieldCheck className="size-4 text-emerald-600" /> ISO 9001
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm ring-1 ring-zinc-200 shadow-sm">
                <Award className="size-4 text-sky-700" /> ESG
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= PILARES ================= */}
      <section className="py-12 md:py-16">
        <div className="container">
          <motion.h3 {...fadeUp()} className="text-xl font-extrabold tracking-tight md:text-2xl">
            {t("pillars.title")}
          </motion.h3>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { k: "mission",   Icon: Target,    tone: "bg-sky-50 text-sky-700 ring-sky-100" },
              { k: "vision",    Icon: Eye,       tone: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
              { k: "values",    Icon: Handshake, tone: "bg-lime-50 text-lime-700 ring-lime-100" },
            ].map((p, i) => (
              <motion.div
                key={p.k}
                {...fadeUp(i * 0.05)}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1"
              >
                <div className={`mb-3 inline-flex items-center justify-center rounded-xl p-3 ring-1 ${p.tone}`}>
                  <p.Icon className="size-6" />
                </div>
                <h4 className="text-lg font-semibold">{t(`pillars.${p.k}.title`)}</h4>
                <p className="mt-2 text-sm text-zinc-600">{t(`pillars.${p.k}.text`)}</p>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MÉTODO / CARDS ================= */}
      <section className="relative py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-sky-50 via-white to-lime-50/30" />
        <div className="container">
          <motion.div {...fadeUp()} className="mb-8">
            <span className="inline-block rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700">
              {t("method.badge")}
            </span>
            <h3 className="mt-3 text-xl font-extrabold tracking-tight md:text-2xl">{t("method.title")}</h3>
          </motion.div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c, i) => (
              <motion.div
                key={c.title}
                {...fadeUp(i * 0.04)}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition will-change-transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${c.stripe}`} />
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-sky-50 p-3 text-sky-700 ring-1 ring-sky-100 transition group-hover:bg-sky-100">
                    <c.icon className="size-5" />
                  </div>
                  <h4 className="text-base font-semibold text-sky-900">{c.title}</h4>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{c.text}</p>
                <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp(0.1)} className="mt-10 rounded-2xl bg-white/70 p-5 backdrop-blur ring-1 ring-zinc-200 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-semibold text-sky-900">
              {t("method.footerTitle")} <ArrowRight className="size-4" />
            </p>
            <p className="mt-1 text-sm text-zinc-700">{t("method.footerText")}</p>
          </motion.div>
        </div>
      </section>

      {/* ================= NÚMEROS ================= */}
      <section className="py-12 md:py-16">
        <div className="container">
          <motion.h3 {...fadeUp()} className="text-xl font-extrabold tracking-tight md:text-2xl">
            {t("numbers.title")}
          </motion.h3>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Stat value={1240} suffix="+" label={t("numbers.projects")} delay={0.02} />
            <Stat value={99.2} suffix="%" decimals={1} label={t("numbers.availability")} delay={0.06} />
            <Stat value={96} suffix="%" label={t("numbers.slas")} delay={0.1} />
            <Stat value={20} suffix="+" label={t("numbers.years")} delay={0.14} />
          </div>
        </div>
      </section>

      {/* ================= LINHA DO TEMPO ================= */}
      <section className="py-12 md:py-16">
        <div className="container">
          <motion.h3 {...fadeUp()} className="text-xl font-extrabold tracking-tight md:text-2xl">
            {t("timeline.title")}
          </motion.h3>

          <div className="relative mt-8">
            {/* linha base */}
            <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-sky-200 via-zinc-200 to-transparent md:left-0 md:top-8 md:h-px md:w-full md:bg-gradient-to-r" />
            <ol className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {timeline.map((i, idx) => (
                <motion.li
                  key={`${i.ano}-${idx}`}
                  {...fadeUp(idx * 0.05)}
                  className="relative rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div className="absolute left-3 top-5 z-10 h-3 w-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 md:left-1/2 md:top-0 md:-translate-x-1/2 md:-translate-y-1/2" />
                  <p className="text-sm font-semibold text-sky-800">{i.ano}</p>
                  <p className="mt-1 text-sm text-zinc-600">{i.texto}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ================= EQUIPE ================= */}
      <section className="py-14 md:py-20">
        <div className="container">
          <motion.div {...fadeUp()} className="mb-8">
            <span className="inline-block rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700">
              {t("team.badge")}
            </span>
            <h3 className="mt-3 text-2xl font-extrabold tracking-tight md:text-4xl">{t("team.title")}</h3>
            <p className="mt-2 max-w-2xl text-zinc-600">{t("team.desc")}</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-x-10 gap-y-14">
            {team.map((m, i) => (
              <motion.div key={m.name} {...fadeUp(i * 0.03)} className="group flex flex-col items-center">
                {/* Avatar redondo e nítido */}
                <div className="relative mx-auto overflow-hidden rounded-full aspect-square w-[144px] md:w-[160px]">
                  {/* fundo circular atrás da foto (não por cima) */}
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-[radial-gradient(70%_70%_at_50%_35%,#1e90ff_0%,#0a5bc4_60%,#033a86_100%)]"
                  />
                  <img
                    src={m.photo}
                    srcSet={m.photo2x ? `${m.photo} 1x, ${m.photo2x} 2x` : undefined}
                    sizes="(min-width:1024px) 160px, (min-width:768px) 144px, 144px"
                    alt={m.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=85&w=800&auto=format&fit=crop";
                    }}
                    className="
                      relative z-10 block h-full w-full object-cover object-top
                      [image-rendering:-webkit-optimize-contrast] [image-rendering:crisp-edges]
                      contrast-[1.07] saturate-[1.06]
                      transition-transform duration-300 will-change-transform group-hover:scale-[1.02]
                    "
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <p className="mt-3 text-sm font-semibold text-center">{m.name}</p>
                <p className="text-xs text-zinc-600 text-center">{t(m.roleKey ?? "team.roles._missing")}</p>
              </motion.div>
            ))}
          </div>

          {/* cultura/valores em glass */}
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-sky-50/70 p-5 text-sky-900 ring-1 ring-sky-100 backdrop-blur-sm">
              <Users className="size-5" />
              <p className="mt-2 text-sm font-semibold">{t("culture.safety.title")}</p>
              <p className="text-sm text-sky-900/80">{t("culture.safety.text")}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50/70 p-5 text-emerald-900 ring-1 ring-emerald-100 backdrop-blur-sm">
              <ShieldCheck className="size-5" />
              <p className="mt-2 text-sm font-semibold">{t("culture.quality.title")}</p>
              <p className="text-sm text-emerald-900/80">{t("culture.quality.text")}</p>
            </div>
            <div className="rounded-2xl bg-lime-50/70 p-5 text-lime-900 ring-1 ring-lime-100 backdrop-blur-sm">
              <Leaf className="size-5" />
              <p className="mt-2 text-sm font-semibold">{t("culture.sustainability.title")}</p>
              <p className="text-sm text-lime-900/80">{t("culture.sustainability.text")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="pb-16">
        <div className="container">
          <motion.div
            {...fadeUp()}
            className="rounded-3xl bg-gradient-to-r from-sky-600 to-sky-800 p-6 text-white md:p-10"
          >
            <h4 className="text-xl font-extrabold md:text-2xl">{t("cta.title")}</h4>
            <p className="mt-2 text-white/90">{t("cta.text")}</p>
            <div className="mt-4">
              <a
                href="/contato"
                className="shine inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 hover:bg-white/90"
              >
                {t("cta.button")} <ArrowRight className="size-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export const Component = Page;
export default Page;
