// src/components/Hero3D.jsx
import { useRef, useEffect, useState, memo } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

/**
 * Hero 3D 100% RESPONSIVO (sem transform: scale no layout)
 * - Ocupa 100% da largura do pai
 * - Mantém proporção via CSS aspect-ratio
 * - Ajusta aspect ratio no mobile para ficar mais alto (fica mais “hero”)
 * - Tilt 3D intacto (Framer controla transform)
 * - Glare em porcentagem (acompanha qualquer tamanho)
 * - Turbina com width usando clamp() (bonita do mobile ao desktop)
 */
function Hero3DPop({
  bg = "/image/torre.jpg",
  turbine = "/image/teste.png",

  // base de proporção do design (usado no desktop)
  designW = 1000,
  designH = 560,

  // largura máxima opcional do hero (desktop)
  maxWidthPx = 1100,

  // mantidas por compatibilidade com chamadas anteriores
  fitVH = 0.82, // (não usado nesta abordagem)
  maxScale = 1, // (não usado nesta abordagem)

  className = "",
  style,
}) {
  const cardRef = useRef(null);
  const prefersReduced = useReducedMotion();

  // flags de ambiente
  const [isCoarse, setIsCoarse] = useState(false);
  const [isSmall, setIsSmall] = useState(false); // viewport < 640px (Tailwind sm)
  const [aspect, setAspect] = useState(designW / designH); // proporção dinâmica

  useEffect(() => {
    const sync = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1024;
      setIsSmall(w < 640);
      // aspecto mais alto no mobile para não “achatar”
      const aspectMobile = 16 / 10; // 1.6
      setAspect(w < 640 ? aspectMobile : designW / designH);
      try {
        setIsCoarse(window.matchMedia("(pointer: coarse)").matches);
      } catch {}
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, [designW, designH]);

  // centro padrão (0.5, 0.5)
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  // Intensidade adaptativa (desliga tilt no mobile/touch)
  const MAX_X = isCoarse || prefersReduced || isSmall ? 0 : 10; // tilt X
  const MAX_Y = isCoarse || prefersReduced || isSmall ? 0 : 14; // tilt Y

  const tiltX = useTransform(my, [0, 1], [MAX_X, -MAX_X]);
  const tiltY = useTransform(mx, [0, 1], [-MAX_Y, MAX_Y]);

  // Springs suaves
  const rx = useSpring(tiltX, { stiffness: 120, damping: 16 });
  const ry = useSpring(tiltY, { stiffness: 120, damping: 16 });
  const cardScale = useSpring(1, { stiffness: 140, damping: 18 });

  // Glare proporcional em % (varia levemente no mobile)
  const glareX = useTransform(mx, (v) => `${v * 100}%`);
  const glareY = useTransform(my, (v) => `${v * 100}%`);
  const glare = useTransform([glareX, glareY], ([x, y]) =>
    isSmall
      ? `radial-gradient(32% 26% at ${x} ${y}, rgba(255,255,255,.18), transparent 55%)`
      : `radial-gradient(38% 32% at ${x} ${y}, rgba(255,255,255,.22), transparent 55%)`
  );

  // Eventos
  const onPointerMove = (e) => {
    const b = cardRef.current?.getBoundingClientRect();
    if (!b) return;
    const cx = e.clientX ?? (e.touches?.[0]?.clientX ?? 0);
    const cy = e.clientY ?? (e.touches?.[0]?.clientY ?? 0);
    const nx = Math.min(1, Math.max(0, (cx - b.left) / b.width));
    const ny = Math.min(1, Math.max(0, (cy - b.top) / b.height));
    mx.set(nx);
    my.set(ny);
    if (!prefersReduced && !isCoarse && !isSmall) cardScale.set(1.012);
  };
  const onPointerLeave = () => {
    mx.set(0.5);
    my.set(0.5);
    cardScale.set(1);
  };
  const onPointerDown = () => {
    if (!prefersReduced && !isCoarse && !isSmall) cardScale.set(1.02);
  };
  const onPointerUp = () => {
    if (!prefersReduced && !isCoarse && !isSmall) cardScale.set(1.012);
  };

  // Largura da turbina com clamp: mínima 44%, preferido 56vw, máxima 56% do hero
  const turbineWidthCss = "clamp(44%, 56vw, 56%)";

  return (
    <div
      className={`w-full ${className}`}
      style={{
        ...style,
        maxWidth: maxWidthPx ? `${maxWidthPx}px` : undefined,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {/* Mantém proporção e ocupa 100% da largura disponível */}
      <div
        className="relative rounded-[22px] overflow-visible"
        style={{
          aspectRatio: aspect,               // responsivo: desktop vs mobile
          perspective: "1200px",
          isolation: "isolate",
          willChange: "transform",
          background: "transparent",
        }}
      >
        <motion.div
          ref={cardRef}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          style={{
            rotateX: rx,
            rotateY: ry,
            scale: cardScale,
            transformStyle: "preserve-3d",
          }}
          className="absolute inset-0 z-[200]"
        >
          {/* Fundo */}
          <div className="absolute inset-0 rounded-[18px] overflow-hidden ring-1 ring-zinc-200">
            <img
              src={bg}
              alt="Fundo"
              className="absolute inset-0 h-full w-full object-cover select-none"
              loading="lazy"
              decoding="async"
              style={{ transform: "translateZ(0)", willChange: "transform" }}
            />
            {/* Glare */}
            <motion.div
              aria-hidden
              style={{ backgroundImage: glare }}
              className="pointer-events-none absolute inset-0 mix-blend-screen"
            />
          </div>

          {/* Turbina */}
          <motion.img
            src={turbine}
            alt="Torre em primeiro plano"
            draggable={false}
            style={{
              transform: "translateZ(50px)",
              filter: "drop-shadow(0 22px 40px rgba(0,0,0,.35))",
              width: turbineWidthCss,
              height: "auto",
            }}
            className="pointer-events-none select-none absolute z-[220] bottom-0 left-1/2 -translate-x-1/2 transform-gpu will-change-transform"
            loading="eager"
            decoding="async"
          />
        </motion.div>
      </div>
    </div>
  );
}

export default memo(Hero3DPop);
