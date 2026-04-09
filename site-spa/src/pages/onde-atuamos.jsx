import React from "react";
import { MapPin } from "lucide-react";

/**
 * OndeAtuamos.jsx — seção "Onde Atuamos" com mapa do Brasil + pins animados
 *
 * 💡 Como usar:
 * 1) Coloque um mapa do Brasil (estilo azul/branco) em: /public/images/mapa-brasil-azul.svg
 *    (pode ser .png/.jpg também). Se preferir outro caminho, altere a prop `mapSrc`.
 * 2) Ajuste as posições dos pins (left/top em %) conforme o seu mapa (já vem com bons valores iniciais).
 * 3) Importe e use: <OndeAtuamos />
 *
 * Cores: predominância azul + branco (marca IS Indústria).
 * UX: visual "tech" com glassmorphism nas etiquetas e animação de pulso nos pins.
 */

const locations = [
  {
    id: "sjp-pr",
    name: "Base Operacional — São José dos Pinhais (PR)",
    short: "São José dos Pinhais (PR)",
    // ~aprox south-east area
    left: "62%",
    top: "78%",
    align: "left",
  },
  {
    id: "petrolina-pe",
    name: "Base Operacional — Petrolina (PE)",
    short: "Petrolina (PE)",
    // ~aprox hinterland of Pernambuco
    left: "69%",
    top: "50%",
    align: "right",
  },
  {
    id: "natal-rn",
    name: "Base Operacional — Natal (RN)",
    short: "Natal (RN)",
    // ~far north-east coast
    left: "83%",
    top: "33%",
    align: "left",
  },
];

function Pin({ label, align = "right" }) {
  return (
    <div className="relative">
      {/* pulso externo */}
      <span className="absolute -inset-3 rounded-full bg-sky-400/40 blur-[2px] animate-ping" />
      {/* marcador */}
      <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-b from-sky-400 to-blue-600 shadow ring-2 ring-white">
        <MapPin className="h-3 w-3 text-white" />
      </span>
      {/* etiqueta */}
      <span
        className={[
          "absolute mt-2 whitespace-nowrap rounded-xl border border-white/60 bg-white/80 px-3 py-1.5 text-xs font-semibold text-sky-900 shadow-sm backdrop-blur",
          align === "left" ? "-translate-x-[calc(100%+10px)] left-0" : "translate-x-[10px] left-full",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}

export default function OndeAtuamos({
  title = "Onde Atuamos",
  subtitle = "Bases operacionais e presença no território brasileiro",
  mapSrc = "/images/mapa-brasil-azul.svg",
}) {
  return (
    <section className="relative w-full">
      {/* Fundo tech com grade sutil */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white to-sky-50" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(rgba(14,165,233,0.12)_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
        {/* Cabeçalho */}
        <div className="mb-8 md:mb-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Presença Nacional
          </span>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-sky-950 md:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-sky-900/70 md:text-base">
            {subtitle}
          </p>
        </div>

        {/* Container do mapa */}
        <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
          {/* imagem do mapa */}
          <img
            src={mapSrc}
            alt="Mapa do Brasil — IS Indústria"
            className="w-full select-none object-contain"
            draggable={false}
            onError={(e) => {
              // fallback visual se a imagem não existir
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.classList.remove("hidden");
            }}
          />

          {/* Fallback: bloco com contorno estilizado (quando o mapa não for encontrado) */}
          <div className="hidden aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-white to-sky-50 p-10 text-center text-sky-700">
            <div>
              <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-sky-100" />
              <p className="text-sm">
                Adicione seu mapa em <code className="rounded bg-sky-100 px-1">{mapSrc}</code>
              </p>
              <p className="text-xs opacity-70">(você pode usar .png / .jpg / .svg)</p>
            </div>
          </div>

          {/* Overlay de pins */}
          <div className="pointer-events-none absolute inset-0">
            {locations.map((loc) => (
              <div
                key={loc.id}
                aria-label={loc.name}
                className="absolute"
                style={{ left: loc.left, top: loc.top, transform: "translate(-50%, -100%)" }}
              >
                <div className="pointer-events-auto">
                  <Pin label={loc.short} align={loc.align} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legenda simples */}
        <div className="mt-6 grid gap-3 text-sm text-sky-900/80 md:grid-cols-3">
          {locations.map((l) => (
            <div key={l.id} className="flex items-center gap-2 rounded-xl border border-sky-100 bg-white p-3 shadow-sm">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-b from-sky-400 to-blue-600 ring-2 ring-white">
                <MapPin className="h-3 w-3 text-white" />
              </span>
              <span className="font-medium text-sky-950">{l.short}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
