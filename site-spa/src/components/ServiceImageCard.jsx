// src/components/ServiceCardBubble.jsx
import { ArrowRight } from "lucide-react";

const IMG_HEIGHT = {
  sm: "h-40",
  md: "h-48",
  lg: "h-56",
};

/**
 * Card de serviço com imagem, título e "bolha" com seta azul-escuro.
 *
 * Props:
 * - title: string
 * - img: string (URL/import)
 * - href: string
 * - chip?: string
 * - size?: "sm" | "md" | "lg"  (controla a ALTURA da imagem)
 * - className?: string
 */
export default function ServiceCardBubble({
  title,
  img,
  href = "#",
  chip,
  size = "md",
  className = "",
}) {
  const h = IMG_HEIGHT[size] ?? IMG_HEIGHT.md;

  return (
    <a
      href={href}
      className={`group relative block w-full overflow-visible ${className}`}
    >
      {/* CARD */}
      <div className="relative overflow-hidden rounded-[22px] shadow-sm ring-1 ring-zinc-200 transition group-hover:shadow-lg">
        {/* imagem */}
        <img
          src={img}
          alt={title}
          className={`${h} w-full object-cover`}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop";
          }}
        />

        {/* gradiente rodapé */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />

        {/* faixa com título/chip */}
        <div className="absolute bottom-0 left-0 m-[6px] rounded-[16px] bg-black/70 px-3 py-2 text-white backdrop-blur-sm">
          <span className="text-sm font-medium">{title}</span>
          {chip ? (
            <span className="ml-2 inline-flex items-center rounded-full bg-white/15 px-2 py-[2px] text-[10px] font-semibold ring-1 ring-white/30">
              {chip}
            </span>
          ) : null}
        </div>
      </div>

      {/* BOTÃO “pra fora” (azul-escuro) */}
      <span
        className="
          absolute -bottom-3 right-3 grid size-8 place-items-center
          rounded-full bg-blue-900 text-white
          ring-4 ring-white shadow-sm
          transition-transform group-hover:translate-x-0.5 group-hover:bg-blue-800
        "
        aria-hidden
      >
        <ArrowRight className="size-4" />
      </span>
    </a>
  );
}
