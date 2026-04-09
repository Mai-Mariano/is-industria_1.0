// src/pages/ServicesIndex.jsx
import ServiceCardBubble from "../components/ServiceCardBubble";
import { services } from "../data/services";

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url('/image/services/hero.jpg')` }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-900/45 via-sky-900/20 to-white" />
      <div className="container py-14 md:py-20">
        <div className="mx-auto max-w-3xl text-center text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/25">
            <span className="size-1.5 rounded-full bg-lime-300" />
            Serviços
          </span>
          <h1 className="mt-3 text-[32px] md:text-[46px] font-black leading-tight drop-shadow-[0_4px_14px_rgba(0,0,0,.65)] [-webkit-text-stroke:0.6px_rgba(0,0,0,.35)]">
            Soluções completas para medições precisas e operação confiável.
          </h1>
          <p className="mt-2 text-white/95">
            Clique em um serviço para ver detalhes técnicos e CTAs.
          </p>
        </div>
      </div>
    </section>
  );
}

function ServicesIndex() {
  return (
    <div className="bg-white">
      <Hero />
      <section className="-mt-10 md:-mt-14 pb-12">
        <div className="container grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCardBubble
              key={s.slug}
              title={s.title}
              img={s.cover}
              chip={s.chip}
              href={`/servicos/${s.slug}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export const Component = ServicesIndex;
export default ServicesIndex;
