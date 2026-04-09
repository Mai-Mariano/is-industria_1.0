// src/pages/News.jsx
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  memo,
} from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Newspaper,
  ArrowRight,
  X,
  Search,
  Tag as TagIcon,
  ExternalLink,
} from "lucide-react";
import { news as localNews } from "../data/news";

const NEWS_URL = import.meta.env.VITE_NEWS_URL;
const TRANSLATE_URL = import.meta.env.VITE_TRANSLATE_URL;

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop";

/* ===================== Helpers de rede ===================== */
const FETCH_TIMEOUT_MS = 10000;
function fetchWithTimeout(url, opts = {}, timeout = FETCH_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() =>
    clearTimeout(t)
  );
}

/* ===================== idioma atual (one-shot) ===================== */
function getCurrentLang() {
  if (typeof window !== "undefined") {
    const stored = window.localStorage?.getItem("lang");
    if (stored && ["pt", "en", "es"].includes(stored)) return stored;

    const htmlLang =
      document.documentElement.lang?.toLowerCase().slice(0, 2) || "";
    if (["pt", "en", "es"].includes(htmlLang)) return htmlLang;

    const nav =
      navigator.language?.toLowerCase().slice(0, 2) ||
      navigator.languages?.[0]?.toLowerCase().slice(0, 2);
    if (["pt", "en", "es"].includes(nav)) return nav;
  }
  return "pt";
}

/* ===================== hook reativo de idioma ===================== */
function useLang() {
  const [lang, setLang] = useState(getCurrentLang);

  useEffect(() => {
    const update = () => setLang(getCurrentLang());

    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    const onStorage = (e) => {
      if (e.key === "lang") update();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("languagechange", update);
    window.addEventListener("app:lang", update);

    const origSetItem = localStorage.setItem;
    localStorage.setItem = function (k, v) {
      origSetItem.apply(this, arguments);
      if (k === "lang") update();
    };

    return () => {
      mo.disconnect();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("languagechange", update);
      window.removeEventListener("app:lang", update);
      localStorage.setItem = origSetItem;
    };
  }, []);

  return lang;
}

/* ===================== UI strings por idioma ===================== */
const UI = {
  pt: {
    badge: "Notícias",
    heroTitle: "Últimas da IS — projetos, prêmios e histórias em campo.",
    heroLead:
      "Releases, conquistas e bastidores da nossa atuação em energia renovável.",
    searchPh: "Buscar por título, tag ou palavra-chave…",
    all: "todas",
    empty: "Nenhuma notícia encontrada. Tente limpar os filtros.",
    readHere: "Ler aqui",
    source: "Fonte",
    open: "Abrir",
    openFull: "Abrir matéria completa",
    section: "Notícia",
    openTitle: "Abrir fonte",
    brand: "IS • Notícias",
    dateLocale: "pt-BR",
    loadMore: "Carregar mais",
    translating: "Traduzindo…",
  },
  en: {
    badge: "News",
    heroTitle: "Latest from IS — projects, awards and field stories.",
    heroLead:
      "Press releases, achievements and behind-the-scenes from our work in renewable energy.",
    searchPh: "Search by title, tag or keyword…",
    all: "all",
    empty: "No news found. Try clearing the filters.",
    readHere: "Read here",
    source: "Source",
    open: "Open",
    openFull: "Open full article",
    section: "News",
    openTitle: "Open source",
    brand: "IS • News",
    dateLocale: "en-US",
    loadMore: "Load more",
    translating: "Translating…",
  },
  es: {
    badge: "Noticias",
    heroTitle: "Lo último de IS — proyectos, premios e historias en campo.",
    heroLead:
      "Notas de prensa, logros y bastidores de nuestra actuación en energía renovable.",
    searchPh: "Buscar por título, etiqueta o palabra clave…",
    all: "todas",
    empty: "No se encontraron noticias. Prueba a limpiar los filtros.",
    readHere: "Leer aquí",
    source: "Fuente",
    open: "Abrir",
    openFull: "Abrir nota completa",
    section: "Noticia",
    openTitle: "Abrir fuente",
    brand: "IS • Noticias",
    dateLocale: "es-ES",
    loadMore: "Cargar más",
    translating: "Traduciendo…",
  },
};

/* ===================== util de data ===================== */
function fmtDate(d, locale = "pt-BR") {
  try {
    const date = new Date(d);
    return isNaN(date)
      ? d ?? ""
      : date.toLocaleDateString(locale, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  } catch {
    return d ?? "";
  }
}

/* ===================== normalização ===================== */
function pickNewsByLang(data, lang) {
  if (!data) return [];
  if (!Array.isArray(data) && typeof data === "object") {
    if (Array.isArray(data[lang])) return data[lang];
  }
  if (Array.isArray(data)) {
    const hasLang = data.some((x) => typeof x?.lang === "string");
    return hasLang ? data.filter((x) => x.lang?.slice(0, 2) === lang) : data;
  }
  return [];
}

/* ===================== IDs / cache keys ===================== */
function itemId(n) {
  return (
    n.id ||
    n.slug ||
    `${n.url || ""}|${n.date || ""}|${(n.title || "").slice(0, 80)}`.trim()
  );
}
function hashText(s) {
  let h = 0;
  const str = String(s ?? "");
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h.toString(16);
}
function fieldKey(id, lang, field, original) {
  return `news:field:${lang}:${id}:${field}:${hashText(original)}`;
}
function contentKey(id, lang, original) {
  return `news:content:${lang}:${id}:${hashText(original)}`;
}
const listCacheKey = (lang) => `news:list:${lang}`;

/* ---- html detection (pra não injetar markdown) ---- */
function isProbablyHtml(s) {
  const str = String(s || "");
  return /<\/?[a-z][\s\S]*>/i.test(str);
}

/* ===================== normalizador (ESSENCIAL) ===================== */
function normalizeNewsItem(n = {}) {
  const content =
    n.content ??
    n.content_html ??
    n.content_md ??
    "";

  const excerpt =
    String(n.excerpt ?? "").trim() ||
    String(content || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/[#_*`>\-\n]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);

  return {
    ...n,
    id: itemId(n),
    content,
    excerpt,
    lang: (n.lang || "pt").slice(0, 2),
    tag_base: n.tag ?? "", // útil pra filtro/base
  };
}
function normalizeNewsList(list = []) {
  return Array.isArray(list) ? list.map(normalizeNewsItem) : [];
}

/* ===================== tradução (batch + cache) ===================== */
async function translateBatch(texts, target, source = "pt") {
  if (!TRANSLATE_URL) return texts;
  if (!texts?.length) return texts;
  if (target === "pt") return texts;

  try {
    const r = await fetchWithTimeout(
      TRANSLATE_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, target, texts }),
      },
      15000
    );
    if (!r.ok) throw new Error("translate http");
    const js = await r.json();
    if (Array.isArray(js?.translations)) return js.translations;
  } catch {}
  return texts;
}

/**
 * ✅ Tradução de campos curtos:
 * - LÊ cache e já devolve patch (isso era o ponto que fazia “não traduzir” após reload)
 * - Traduz só o que faltou
 */
async function translateFieldsFor(items, lang, fields, chunkSize = 60) {
  if (!items?.length) return { patchById: {}, translatedAny: false };
  if (lang === "pt" || !TRANSLATE_URL) return { patchById: {}, translatedAny: false };

  const patchById = {};
  const texts = [];
  const map = []; // { id, field, ck }

  for (const it of items) {
    const id = itemId(it);

    for (const field of fields) {
      const original = it?.[field] ?? "";
      if (!original) continue;

      const ck = fieldKey(id, lang, field, original);
      const cached = sessionStorage.getItem(ck);

      // ✅ se tiver cache, já aplica no patch
      if (cached != null && cached !== "") {
        if (!patchById[id]) patchById[id] = {};
        patchById[id][field] = cached;
        continue;
      }

      // precisa traduzir
      texts.push(String(original));
      map.push({ id, field, ck });
    }
  }

  // só cache já pode resolver tudo
  if (!texts.length) return { patchById, translatedAny: Object.keys(patchById).length > 0 };

  for (let p = 0; p < texts.length; p += chunkSize) {
    const slice = texts.slice(p, p + chunkSize);
    const tr = await translateBatch(slice, lang, "pt");

    for (let i = 0; i < tr.length; i++) {
      const idx = p + i;
      const m = map[idx];
      if (!m) continue;

      const val = tr[i] ?? "";
      if (!patchById[m.id]) patchById[m.id] = {};
      patchById[m.id][m.field] = val;

      try { sessionStorage.setItem(m.ck, val); } catch {}
    }
  }

  return { patchById, translatedAny: true };
}

/* traduz conteúdo sob demanda (modal) */
async function translateContentOnce(item, lang) {
  if (!item) return null;
  if (lang === "pt" || !TRANSLATE_URL) return null;

  const id = itemId(item);
  const original =
    item.content ??
    item.content_html ??
    item.content_md ??
    "";

  if (!original) return null;

  const ck = contentKey(id, lang, original);
  const cached = sessionStorage.getItem(ck);
  if (cached != null && cached !== "") return cached;

  const [tr] = await translateBatch([original], lang, "pt");
  const val = tr ?? original;

  try { sessionStorage.setItem(ck, val); } catch {}
  return val;
}

/* ===================== debounce ===================== */
function useDebouncedValue(value, delay = 220) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

/* ===================== Mini componentes ===================== */
const Badge = memo(function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold text-sky-800 ring-1 ring-sky-200 ${className}`}
    >
      <span className="size-1.5 rounded-full bg-sky-400" />
      {children}
    </span>
  );
});

const Tag = memo(function Tag({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
        active
          ? "bg-sky-600 text-white ring-sky-600"
          : "bg-white text-zinc-700 ring-zinc-200 hover:bg-zinc-50"
      }`}
    >
      <TagIcon className="size-3.5" />
      {children}
    </button>
  );
});

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-zinc-200 bg-white p-4">
      <div className="h-40 w-full animate-pulse rounded-2xl bg-zinc-200" />
      <div className="mt-3 h-4 w-20 animate-pulse rounded bg-zinc-200" />
      <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-zinc-200" />
      <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-zinc-200" />
      <div className="mt-3 h-9 w-32 animate-pulse rounded-full bg-zinc-200" />
    </div>
  );
});

function Modal({ open, onClose, children, title, url, t }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] grid place-items-center bg-black/45 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h4 className="text-lg font-bold">{title}</h4>
          <div className="flex items-center gap-2">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-zinc-50"
                title={t.openTitle}
              >
                {t.open} <ExternalLink className="size-3.5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="grid size-8 place-items-center rounded-full border border-zinc-300 hover:bg-zinc-50"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/* ===================== Card ===================== */
const NewsCardBubble = memo(function NewsCardBubble({ item, onPreview, t, locale }) {
  const { title, image, date, tag, url, excerpt } = item;
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.25 }}
      className="group relative overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-[0_22px_60px_-30px_rgba(2,6,23,.25)]"
    >
      <div className="relative">
        <img
          src={image || FALLBACK_IMG}
          alt=""
          className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
        />
        {tag && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-sky-800 ring-1 ring-sky-200">
            {tag}
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <span>{t.brand}</span>
          <time>{fmtDate(date, locale)}</time>
        </div>

        <h3 className="mt-2 line-clamp-2 text-[15px] font-extrabold tracking-tight text-sky-900">
          {title}
        </h3>

        {excerpt && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{excerpt}</p>
        )}

        <div className="relative mt-4">
          <div className="pointer-events-none absolute -bottom-4 -right-2 h-20 w-20 rounded-full bg-gradient-to-br from-sky-100 to-white blur-2xl" />
          <div className="flex gap-2">
            <button
              onClick={onPreview}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
            >
              {t.readHere} <ArrowRight className="size-4" />
            </button>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
              >
                {t.source} <ExternalLink className="size-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
});

function LazyNewsCard({ item, onPreview, t, locale }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  return (
    <div ref={ref}>
      {inView ? (
        <NewsCardBubble item={item} onPreview={onPreview} t={t} locale={locale} />
      ) : (
        <SkeletonCard />
      )}
    </div>
  );
}

/* ===================== Página ===================== */
function Page() {
  const lang = useLang();
  const t = UI[lang] || UI.pt;
  const locale = t.dateLocale || "pt-BR";

  // ✅ sempre guarde items normalizados
  const [items, setItems] = useState(() =>
    normalizeNewsList(pickNewsByLang(localNews, "pt"))
  );
  const [loading, setLoading] = useState(!!NEWS_URL);

  const [q, setQ] = useState("");
  const [tagKey, setTagKey] = useState("all");

  const [preview, setPreview] = useState(null);
  const [previewContentTr, setPreviewContentTr] = useState(null);
  const [previewTranslating, setPreviewTranslating] = useState(false);

  const [visibleCount, setVisibleCount] = useState(9);

  // id -> { title, tag, excerpt }
  const [cardTr, setCardTr] = useState({});

  const debouncedQ = useDebouncedValue(q, 220);

  const handlePreview = useCallback((n) => {
    setPreview(n);
    setPreviewContentTr(null);
  }, []);

  // reset por idioma
  useEffect(() => {
    setQ("");
    setTagKey("all");
    setPreview(null);
    setVisibleCount(9);
    setCardTr({});
    setPreviewContentTr(null);
  }, [lang]);

  // 1) SWR — lista base em PT (cache/rede) + normalização
  useEffect(() => {
    let alive = true;

    const key = listCacheKey("pt");

    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const list = JSON.parse(cached);
        if (Array.isArray(list) && alive) {
          setItems(normalizeNewsList(list));
          setLoading(false);
        }
      } else {
        setItems(normalizeNewsList(pickNewsByLang(localNews, "pt")));
      }
    } catch {
      setItems(normalizeNewsList(pickNewsByLang(localNews, "pt")));
    }

    if (!NEWS_URL) {
      setLoading(false);
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    const sep = NEWS_URL.includes("?") ? "&" : "?";
    const url = `${NEWS_URL}${sep}_=${Date.now()}`;

    fetchWithTimeout(url, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((json) => {
        if (!alive) return;
        const raw = pickNewsByLang(json, "pt") || [];
        const data = normalizeNewsList(raw);
        setItems(data);
        setLoading(false);
        try {
          sessionStorage.setItem(key, JSON.stringify(data));
        } catch {}
      })
      .catch(() => setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  // Tags (base PT)
  const tags = useMemo(() => {
    const set = new Set(items.map((n) => (n.tag || "").trim()).filter(Boolean));
    return [
      { key: "all", label: t.all },
      ...Array.from(set).map((x) => ({ key: x, label: x })),
    ];
  }, [items, t.all]);

  // paginação ao mudar filtros
  useEffect(() => {
    setVisibleCount(9);
  }, [debouncedQ, tagKey, items]);

  // Filtro busca + tag (base PT)
  const filtered = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    return items.filter((n) => {
      const okTag =
        tagKey === "all" ||
        (n.tag || "").toLowerCase() === String(tagKey).toLowerCase();
      if (!okTag) return false;
      if (!term) return true;
      const hay = `${n.title ?? ""} ${n.excerpt ?? ""} ${n.tag ?? ""}`.toLowerCase();
      return hay.includes(term);
    });
  }, [items, debouncedQ, tagKey]);

  const visibleItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const canLoadMore = visibleCount < filtered.length;

  // 2) Tradução “rápida” (somente cards visíveis) + aplica cache corretamente
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!visibleItems.length) return;
      if (lang === "pt" || !TRANSLATE_URL) return;

      const { patchById } = await translateFieldsFor(
        visibleItems,
        lang,
        ["title", "tag", "excerpt"],
        80
      );

      if (!alive) return;
      if (patchById && Object.keys(patchById).length) {
        setCardTr((prev) => ({ ...prev, ...patchById }));
      }
    })();

    return () => {
      alive = false;
    };
  }, [lang, visibleItems]);

  // 3) Tradução do conteúdo (somente ao abrir o modal)
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!preview) return;
      if (lang === "pt" || !TRANSLATE_URL) {
        setPreviewContentTr(null);
        return;
      }

      setPreviewTranslating(true);
      const tr = await translateContentOnce(preview, lang);
      if (!alive) return;

      setPreviewContentTr(tr);
      setPreviewTranslating(false);
    })();

    return () => {
      alive = false;
    };
  }, [preview, lang]);

  // item “patchado” pro card
  const displayItem = useCallback(
    (n) => {
      if (lang === "pt") return n;
      const id = itemId(n);
      const patch = cardTr[id];
      return patch ? { ...n, ...patch } : n;
    },
    [cardTr, lang]
  );

  // campos do modal (usam patch se houver)
  const modalTitle = useMemo(() => {
    if (!preview) return "";
    const id = itemId(preview);
    return lang !== "pt" && cardTr[id]?.title ? cardTr[id].title : preview.title;
  }, [preview, lang, cardTr]);

  const modalTag = useMemo(() => {
    if (!preview) return "";
    const id = itemId(preview);
    return lang !== "pt" && cardTr[id]?.tag ? cardTr[id].tag : preview.tag;
  }, [preview, lang, cardTr]);

  const modalExcerpt = useMemo(() => {
    if (!preview) return "";
    const id = itemId(preview);
    return lang !== "pt" && cardTr[id]?.excerpt ? cardTr[id].excerpt : preview.excerpt;
  }, [preview, lang, cardTr]);

  const modalContent = previewContentTr ?? preview?.content;

  return (
    <div className="bg-gradient-to-b from-sky-50 via-white to-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <Badge>{t.badge}</Badge>
            <h1 className="mt-3 text-[32px] md:text-[46px] font-black leading-tight">
              {t.heroTitle}
            </h1>
            <p className="mt-2 text-zinc-600">{t.heroLead}</p>

            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="flex w-full max-w-xl items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 shadow-sm">
                <Search className="size-4 text-zinc-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t.searchPh}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {tags.map((tg) => (
                  <Tag
                    key={tg.key}
                    active={tagKey === tg.key}
                    onClick={() => setTagKey(tg.key)}
                  >
                    {tg.label}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section
        className="pb-14 md:pb-20"
        style={{ contentVisibility: "auto", containIntrinsicSize: "1100px" }}
      >
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-600">
              {t.empty}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleItems.map((n) => (
                  <LazyNewsCard
                    key={itemId(n)}
                    item={displayItem(n)}
                    onPreview={() => handlePreview(n)}
                    t={t}
                    locale={locale}
                  />
                ))}
              </div>

              {canLoadMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((v) => v + 9)}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-zinc-50"
                  >
                    {t.loadMore}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* MODAL Preview */}
      <AnimatePresence>
        <Modal
          open={!!preview}
          onClose={() => setPreview(null)}
          title={modalTitle}
          url={preview?.url}
          t={t}
        >
          {preview && (
            <div className="space-y-3">
              <img
                src={preview.image || FALLBACK_IMG}
                alt=""
                className="h-56 w-full rounded-2xl object-cover"
                loading="lazy"
                decoding="async"
                sizes="100vw"
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              />

              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1">
                  <Newspaper className="size-3.5" /> {modalTag || t.section}
                </span>
                <time>{fmtDate(preview.date, locale)}</time>
              </div>

              {!!modalExcerpt && (
                <p className="text-sm text-zinc-700">{modalExcerpt}</p>
              )}

              {previewTranslating && lang !== "pt" && (
                <div className="text-xs text-zinc-500">{t.translating}</div>
              )}

              {!!modalContent && (
                isProbablyHtml(modalContent) ? (
                  <div
                    className="prose prose-zinc max-w-none prose-p:my-3 prose-h3:mt-6"
                    dangerouslySetInnerHTML={{ __html: modalContent }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-800 ring-1 ring-zinc-200">
                    {modalContent}
                  </pre>
                )
              )}

              {preview.url && (
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  {t.openFull} <ExternalLink className="size-4" />
                </a>
              )}
            </div>
          )}
        </Modal>
      </AnimatePresence>
    </div>
  );
}

export const Component = Page;
export default Page;