// src/components/ServiceCardBubble.jsx
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ServiceCardBubble({
  title,
  img,
  href = "#",
  chip, // opcional
}) {
  const isInternal = href?.startsWith("/");

  const Wrapper = ({ children }) =>
    isInternal ? (
      <Link to={href} className="group relative block w-full overflow-visible">
        {children}
      </Link>
    ) : (
      <a href={href} className="group relative block w-full overflow-visible">
        {children}
      </a>
    );

  return (
    <Wrapper>
      {/* CARD */}
      <div className="relative overflow-hidden rounded-[22px] shadow-sm ring-1 ring-zinc-200 transition group-hover:shadow-lg">
        <img
          src={img}
          alt={title}
          className="h-48 w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop";
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute bottom-0 left-0 m-[6px] rounded-[16px] bg-black/70 px-3 py-2 text-white backdrop-blur-sm">
          <span className="text-sm font-medium">{title}</span>
          {chip ? (
            <span className="ml-2 inline-flex items-center rounded-full bg-white/15 px-2 py-[2px] text-[10px] font-semibold ring-1 ring-white/30">
              {chip}
            </span>
          ) : null}
        </div>
      </div>

      <span
        className="
          absolute -bottom-3 right-3 grid size-8 place-items-center
          rounded-full bg-blue-900 text-white
          ring-4 ring-white shadow-sm
          transition-transform group-hover:translate-x-0.5 group-hover:bg-blue-800
        "
      >
        <ArrowRight className="size-4" />
      </span>
    </Wrapper>
  );
}
