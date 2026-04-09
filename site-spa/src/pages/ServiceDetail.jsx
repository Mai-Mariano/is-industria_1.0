// src/pages/ServiceDetail.jsx
import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getServiceBySlug, withLang } from "../data/services.i18n";
import { useLang } from "../i18n/useLang";

/* ---------------- UI strings por idioma ---------------- */
const UI = {
  pt: {
    notFoundTitle: "Serviço não encontrado",
    notFoundText: "Verifique o endereço ou volte para a lista de serviços.",
    backServices: "Ver todos os serviços",
    sectionWhat: "O que fazemos nesse serviço",
    detailsSoon: "Os detalhes técnicos deste serviço serão adicionados em breve.",
    whyItMatters: "Por que importa",
    whyText:
      "Documentação, rastreabilidade e foco em dados confiáveis — menos retrabalho, menos perda de dados e menor OPEX ao longo do ciclo do projeto.",
  },
  en: {
    notFoundTitle: "Service not found",
    notFoundText: "Check the address or go back to the services list.",
    backServices: "View all services",
    sectionWhat: "What we do in this service",
    detailsSoon: "Technical details for this service will be added soon.",
    whyItMatters: "Why it matters",
    whyText:
      "Documentation, traceability and a focus on reliable data — less rework, less data loss and lower OPEX throughout the project life cycle.",
  },
  es: {
    notFoundTitle: "Servicio no encontrado",
    notFoundText: "Verifica la dirección o vuelve a la lista de servicios.",
    backServices: "Ver todos los servicios",
    sectionWhat: "Qué hacemos en este servicio",
    detailsSoon: "Los detalles técnicos de este servicio se agregarán pronto.",
    whyItMatters: "Por qué importa",
    whyText:
      "Documentación, trazabilidad y foco en datos confiables — menos retrabajo, menor pérdida de datos y menor OPEX a lo largo del ciclo del proyecto.",
  },
};

/* --------------- Título com variações por serviço -----------------
   - Se base.titleFill existir -> usa o efeito "image-filled text"
   - Senão, se base.titleBg existir -> coloca uma faixa/foto atrás do H1
   - Senão, mostra o H1 normal
-------------------------------------------------------------------- */
function TitleBlock({ base, title, className = "" }) {
  const hero = base.hero || "/image/services/hero.jpg";
  const titleBg = base.titleBg || hero;
  const titleFill = base.titleFill || "";

  if (titleFill) {
    // Título preenchido por imagem (bg-clip-text)
    return (
      <h1
        className={
          "text-[30px] md:text-[44px] font-black leading-tight text-transparent " +
          "bg-clip-text bg-center bg-cover drop-shadow-[0_4px_14px_rgba(0,0,0,.35)] " +
          className
        }
        style={{ backgroundImage: `url(${titleFill})` }}
      >
        {title}
      </h1>
    );
  }

  if (base.titleBg) {
    // Faixa de imagem atrás do H1
    return (
      <div className={`relative inline-block ${className}`}>
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-3 -z-10 rounded-2xl bg-cover bg-center opacity-30 ring-1 ring-white/25"
          style={{ backgroundImage: `url('${titleBg}')` }}
        />
        <h1
          className="text-[30px] md:text-[44px] font-black leading-tight text-white
                     drop-shadow-[0_4px_14px_rgba(0,0,0,.65)]
                     [-webkit-text-stroke:0.6px_rgba(0,0,0,.35)]"
        >
          {title}
        </h1>
      </div>
    );
  }

  // Título padrão (sem imagem específica)
  return (
    <h1
      className={
        "text-[30px] md:text-[44px] font-black leading-tight text-white " +
        "drop-shadow-[0_4px_14px_rgba(0,0,0,.65)] [-webkit-text-stroke:0.6px_rgba(0,0,0,.35)] " +
        className
      }
    >
      {title}
    </h1>
  );
}

/* ------------------- NotFound (localizado) ------------------- */
function NotFound({ lang = "pt" }) {
  const t = UI[lang] || UI.pt;
  return (
    <div className="container py-24 text-center">
      <h1 className="text-2xl font-bold">{t.notFoundTitle}</h1>
      <p className="mt-2 text-zinc-600">{t.notFoundText}</p>
      <Link
        to="/servicos"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
      >
        {t.backServices} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

/* =========================== PÁGINA =========================== */
function ServiceDetailPage() {
  const { slug } = useParams();
  const lang = useLang(); // ← reativo ao mudar idioma

  // serviço base (imagens, tom etc.) + textos localizados
  const base = useMemo(() => getServiceBySlug(slug), [slug]);
  const svc = useMemo(() => withLang(base, lang), [base, lang]);

  if (!base || !svc) return <NotFound lang={lang} />;

  const t = UI[lang] || UI.pt;

  // Fallbacks seguros
  const hero =
    base.hero ||
    "/image/services/hero.jpg";
  const cover =
    base.cover ||
    "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop";

  const summary = svc.summary || "";
  const bullets = Array.isArray(svc.bullets) ? svc.bullets : [];
  const ctas = Array.isArray(svc.ctas) ? svc.ctas : [];
  const extra = svc.extra; // extra pode existir em alguns serviços (ex.: pintura)

  // “Tom” do serviço (opcional no data)
  const overlay =
    base.tone?.heroOverlay ||
    "from-sky-900/50 via-sky-900/25 to-white";

  return (
    <div className="bg-white">
      {/* ========================= HERO ========================= */}
      <section className="relative isolate z-0 bg-white">
        <div className="relative h-[26vh] md:h-[36vh]">
          {/* imagem */}
          <img
            src={hero}
            alt=""
            className="block h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1600&auto=format&fit=crop";
            }}
          />

          {/* overlay */}
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${overlay}`} />

          {/* título centralizado */}
          <div className="absolute inset-0 z-10 flex items-center">
            <div className="container">
              <div className="mx-auto max-w-3xl text-center">
                <TitleBlock base={base} title={svc.title} />
              </div>
            </div>
          </div>

          {/* fade para branco no rodapé */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white" />
        </div>
      </section>

      {/* ================= CONTEÚDO ================= */}
      <section className="relative z-50 bg-white">
        <div className="container pt-8 md:pt-12 pb-16">
          <div className="grid gap-8 md:grid-cols-[1.2fr_.8fr]">
            {/* Conteúdo principal */}
            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              {/* resumo */}
              {summary ? (
                <p className="text-zinc-700">{summary}</p>
              ) : null}

              {/* o que fazemos */}
              <h2 className="mt-5 text-lg md:text-xl font-extrabold tracking-tight text-sky-900">
                {t.sectionWhat}
              </h2>

              {bullets.length > 0 ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-700">
                  {bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-zinc-600">{t.detailsSoon}</p>
              )}

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap gap-3">
                {ctas.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    {c.label} <ArrowRight className="size-4" />
                  </a>
                ))}
                {extra && (
                  <a
                    href={extra.href}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                  >
                    {extra.label}
                  </a>
                )}
              </div>
            </article>

            {/* Lateral direita */}
            <aside className="space-y-4">
              <div className="overflow-hidden rounded-3xl border border-zinc-200 shadow-sm">
                <img
                  src={cover}
                  alt={svc.title}
                  className="h-64 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop";
                  }}
                />
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-sky-900">
                  {t.whyItMatters}
                </h3>
                <p className="mt-2 text-sm text-zinc-700">{t.whyText}</p>
              </div>

              <div className="pt-2">
                <Link
                  to="/servicos"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                >
                  {UI[lang]?.backServices || UI.pt.backServices}{" "}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

export const Component = ServiceDetailPage;
export default ServiceDetailPage;
