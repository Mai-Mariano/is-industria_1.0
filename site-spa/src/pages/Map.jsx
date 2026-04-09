// src/pages/Mapa.jsx
import React, { useRef, useState } from "react";
import { Globe2, ShieldCheck, MapPin, PhoneCall } from "lucide-react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import teste from "../image/mapa.png";

/* === Dados das bases (coords em %) === */
const LOCATIONS = [
  { id: "sjp-pr",       label: "São José dos Pinhais (PR)", left: "55%", top: "70%", align: "left" },
  { id: "petrolina-pe", label: "Petrolina (PE)",             left: "89%", top: "40%", align: "left" },
  { id: "natal-rn",     label: "Natal (RN)",                 left: "94%", top: "33%", align: "right" },
];

/* ========= helpers ========= */
/* Reveal on scroll (fade + up + blur) */
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

/* Stagger container (anima filhos em sequência) */
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function TypeChip({ color, children }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${color}`}>
      <span className="size-2 rounded-full bg-current" />
      {children}
    </span>
  );
}

function Stat({ icon, label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm"
    >
      <div className="grid size-8 place-items-center rounded-xl bg-blue-100 text-blue-700">
        {icon}
      </div>
      <div>
        <div className="text-xs text-zinc-500">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </motion.div>
  );
}

/* === Pino com rótulo mobile + desktop === */
function Pin({ label, align = "right" }) {
  return (
    <div className="relative">
      {/* halo */}
      <span className="absolute -inset-3 rounded-full bg-sky-400/40 blur-[2px] animate-ping" />

      {/* pino */}
      <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-b from-sky-400 to-blue-600 shadow ring-2 ring-white">
        <MapPin className="h-3 w-3 text-white" />
      </span>

      {/* RÓTULO MOBILE (até md): central, com quebra de linha */}
      <span
        className={[
          "md:hidden absolute left-1/2 translate-x-[-50%] translate-y-2",
          "max-w-[78vw] px-2.5 py-1 text-[11px] text-center whitespace-normal break-words",
          "rounded-lg border border-white/60 bg-white/85 font-semibold text-sky-900 shadow-sm backdrop-blur",
        ].join(" ")}
      >
        {label}
      </span>

      {/* RÓTULO DESKTOP (md+): lateral com align */}
      <span
        className={[
          "hidden md:inline-block absolute mt-2 max-w-[42vw] overflow-hidden text-ellipsis whitespace-nowrap",
          "rounded-xl border border-white/60 bg-white/80 px-3 py-1.5 text-xs font-semibold text-sky-900 shadow-sm backdrop-blur",
          align === "left" ? "-translate-x-[calc(100%+10px)] left-0" : "translate-x-[10px] left-full",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}

/* === Mapa com tilt/3D leve + glow + scan light === */
function BrazilMap({
  mapSrc = teste,
  alt = "Mapa do Brasil – IS Indústria",
  locations = LOCATIONS,
  debug = false,
}) {
  const boxRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // motion values + springs para suavizar
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const rotateX = useSpring(mvX, { stiffness: 110, damping: 18, mass: 0.6 });
  const rotateY = useSpring(mvY, { stiffness: 110, damping: 18, mass: 0.6 });

  // glare (reflexo que segue o mouse)
  const [glare, setGlare] = useState({ x: 50, y: 50, on: false });

  const MAX = 9;         // ângulo máximo
  const DEADZONE = 0.02; // zona morta

  const onMove = (e) => {
    if (prefersReducedMotion) return;
    const r = boxRef.current?.getBoundingClientRect();
    if (!r) return;

    let px = (e.clientX - r.left) / r.width - 0.5;
    let py = (e.clientY - r.top) / r.height - 0.5;

    if (Math.abs(px) < DEADZONE) px = 0;
    if (Math.abs(py) < DEADZONE) py = 0;

    mvX.set(py * MAX);
    mvY.set(-px * MAX);

    setGlare({ x: (px + 0.5) * 100, y: (py + 0.5) * 100, on: true });

    if (debug) {
      const left = ((e.clientX - r.left) / r.width) * 100;
      const top  = ((e.clientY - r.top)  / r.height) * 100;
      const s = `left: "${left.toFixed(1)}%", top: "${top.toFixed(1)}%"`;
      console.log("coords ->", s);
      navigator.clipboard?.writeText(s).catch(() => {});
    }
  };

  const onLeave = () => {
    mvX.set(0);
    mvY.set(0);
    setGlare((g) => ({ ...g, on: false }));
  };

  return (
    <Reveal y={12}>
      <div className="relative overflow-visible" style={{ perspective: "1200px" }}>
        <motion.div
          ref={boxRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="relative [transform-style:preserve-3d]"
          style={{ rotateX, rotateY }}
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.01 }}
        >
          <motion.img
            src={mapSrc}
            alt={alt}
            className="w-full select-none object-contain"
            draggable={false}
            whileHover={{ filter: "drop-shadow(0 30px 80px rgba(2,132,199,0.25))" }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.classList.remove("hidden");
            }}
          />

          {/* fallback se a imagem não existir */}
          <div className="hidden aspect-[4/3] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-white to-sky-50 p-10 text-center text-sky-700">
            <div>
              <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-sky-100" />
              <p className="text-sm">
                Adicione o arquivo do mapa em <code className="rounded bg-sky-100 px-1">{mapSrc}</code>
              </p>
            </div>
          </div>

          {/* scan light */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="sweep absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          </div>

          {/* glare spot */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(500px at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.25), transparent 55%)`,
              opacity: glare.on ? 1 : 0,
              transition: "opacity 200ms ease",
            }}
          />

          {/* glows nas bases */}
          <span className="pointer-events-none absolute left-[55%] top-[70%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/25 blur-2xl" />
          <span className="pointer-events-none absolute left-[89%] top-[40%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/25 blur-2xl" />
          <span className="pointer-events-none absolute left-[86%] top-[33%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/25 blur-2xl" />

          {/* pins */}
          <div className="pointer-events-none absolute inset-0">
            {locations.map((loc) => (
              <div
                key={loc.id}
                aria-label={loc.label}
                className="absolute"
                style={{ left: loc.left, top: loc.top, transform: "translate(-50%, -100%) translateZ(30px)" }}
              >
                <div className="pointer-events-auto">
                  <Pin label={loc.label} align={loc.align} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Reveal>
  );
}

function Page() {
  const { t } = useTranslation();
  const waMsg = encodeURIComponent(t("maps.waText"));

  return (
    <div className="bg-gradient-to-br from-sky-50 via-white to-white">
      {/* HERO (no mobile não corta) */}
      <section
        className="relative overflow-visible md:overflow-hidden bg-gradient-to-b from-sky-100 via-emerald-50 to-white
                   after:content-[''] after:absolute after:inset-x-0 after:-bottom-1 after:h-3
                   after:bg-gradient-to-b after:from-transparent after:to-white/70"
      >
        <div className="container grid items-center gap-7 pb-8 pt-10 md:grid-cols-[1.08fr_.92fr] md:pb-12 md:pt-14">
          <div>
            <Reveal y={10}>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                <Globe2 className="size-3.5" />
                {t("maps.badge")}
              </span>
            </Reveal>

            <Reveal y={14} delay={0.05}>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
                {t("maps.titleStart")}{" "}
                <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  {t("maps.titleHighlight")}
                </span>
                .
              </h1>
            </Reveal>

            <Reveal y={14} delay={0.1}>
              <p className="mt-4 max-w-prose text-zinc-700">{t("maps.lead")}</p>
            </Reveal>

            <Reveal y={12} delay={0.15}>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/contato"
                  className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {t("maps.btnContact")}
                </a>
                <a
                  href="#areas"
                  className="rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
                >
                  {t("maps.btnSeeAreas")}
                </a>
              </div>
            </Reveal>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-6 grid grid-cols-2 gap-4 text-sm"
            >
              <motion.div variants={staggerItem}>
                <Stat icon={<ShieldCheck className="size-4" />} label={t("maps.statSLA")} value="> 98%" />
              </motion.div>
              <motion.div variants={staggerItem}>
                <Stat icon={<Globe2 className="size-4" />} label={t("maps.statCoverage")} value="Bases em PR, PE e RN" />
              </motion.div>
            </motion.div>
          </div>

          {/* Mapa com pins — respiro lateral no mobile */}
          <div className="-mx-3 px-3 sm:mx-0 sm:px-0">
            <BrazilMap mapSrc={teste} />
          </div>
        </div>
      </section>

      {/* LEGENDA / COBERTURA */}
      <section
        id="areas"
        className="relative py-12 md:py-14 -mt-2 md:-mt-4
             before:content-[''] before:absolute before:inset-x-0 before:-top-1 before:h-6
             before:bg-gradient-to-t before:from-sky-50 before:to-transparent
             before:pointer-events-none"
      >
        <div className="container grid grid-cols-1 gap-4 md:grid-cols-[1fr_.9fr]">
          {/* Card: Cobertura */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm backdrop-blur
                       ring-1 ring-white/50 hover:shadow-md transition-shadow"
          >
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="size-4 text-blue-700" />
              <h2 className="text-lg font-extrabold tracking-tight text-sky-900">
                {t("maps.coverageTitle")}
              </h2>
            </div>

            <p className="text-sm text-zinc-600">
              {t("maps.coverageServed")}{" "}

            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              className="mt-3 grid gap-3 text-sm md:grid-cols-3"
            >
              <motion.div variants={staggerItem} className="rounded-xl border border-zinc-200/70 bg-white/70 p-3 backdrop-blur-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-200/60">
                  <span className="size-1.5 rounded-full bg-sky-700" />
                  {t("maps.legendBase")}
                </span>
                <ul className="mt-2 space-y-1.5">
                  {LOCATIONS.map((l) => <li key={l.id}>{l.label}</li>)}
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Card: Próximo passo */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm backdrop-blur
                       ring-1 ring-white/50 hover:shadow-md transition-shadow md:flex md:flex-col md:justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-blue-700">{t("maps.nextStepBadge")}</p>
              <h3 className="mt-1 text-base font-bold">{t("maps.nextStepTitle")}</h3>
              <p className="mt-1 text-sm text-zinc-600">{t("maps.nextStepText")}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="/contato"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700
                           ring-4 ring-blue-200/50 transition-colors"
              >
                {t("maps.btnBriefing")}
              </a>
              <a
                href={`https://wa.me/554130330160?text=${waMsg}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold
                           hover:bg-zinc-50 ring-4 ring-zinc-100 transition-colors"
              >
                <PhoneCall className="size-4" />
                {t("maps.btnWhatsApp")}
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
