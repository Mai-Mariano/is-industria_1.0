const TRANSLATE_URL = import.meta.env.VITE_TRANSLATE_URL;

function normLang(lang) {
  return (lang || "pt").toLowerCase().slice(0, 2);
}

function safeKey(s) {
  return String(s || "").replace(/\s+/g, " ").trim().slice(0, 120);
}

export function makeId(item, fallbackFields = []) {
  return (
    item?.id ??
    item?.slug ??
    fallbackFields.map((k) => safeKey(item?.[k])).join("|") ??
    JSON.stringify(item).slice(0, 120)
  );
}

function cacheKey(id, lang, field, hash) {
  return `i18n:${lang}:${id}:${field}:${hash}`;
}

function hashText(s) {
  // hash simples (bom o suficiente p/ cache)
  let h = 0;
  const str = String(s ?? "");
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

export async function translateBatch(texts, target, source = "pt", format = "html") {
  const lang = normLang(target);
  if (!TRANSLATE_URL || lang === "pt") return texts;

  const r = await fetch(TRANSLATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // seu backend já lida com isso? se não, ignore format
    body: JSON.stringify({ source, target: lang, texts, format }),
  });

  if (!r.ok) return texts;

  const js = await r.json().catch(() => null);
  if (Array.isArray(js?.translations)) return js.translations;
  return texts;
}

/**
 * Traduz apenas fields desejados de uma lista de itens.
 * - Cache em sessionStorage por item+lang+field+hash(texto)
 * - Faz 1-3 requests no máximo (batch), ao invés de 1 por item
 */
export async function translateItemsFields(items, lang, fields, {
  source = "pt",
  idFn = (it) => makeId(it, ["slug", "date", "title"]),
  format = "html",
  chunkSize = 60, // evita payload gigante
} = {}) {
  const target = normLang(lang);
  if (target === "pt" || !items?.length) return items;

  const out = items.map((x) => ({ ...x }));

  const texts = [];
  const map = [];

  for (let i = 0; i < out.length; i++) {
    const it = out[i];
    const id = idFn(it);

    for (const f of fields) {
      const original = it?.[f] ?? "";
      const h = hashText(original);
      const k = cacheKey(id, target, f, h);

      const cached = sessionStorage.getItem(k);
      if (cached != null && cached !== "") {
        out[i][f] = cached;
      } else {
        texts.push(String(original));
        map.push({ i, f, k });
      }
    }
  }

  if (!texts.length) return out;

  // traduz em lotes grandes (bem mais rápido do que 2 em 2)
  for (let p = 0; p < texts.length; p += chunkSize) {
    const slice = texts.slice(p, p + chunkSize);
    const tr = await translateBatch(slice, target, source, format);

    for (let j = 0; j < tr.length; j++) {
      const { i, f, k } = map[p + j];
      const val = tr[j] ?? out[i][f];
      out[i][f] = val;
      try { sessionStorage.setItem(k, val); } catch {}
    }
  }

  return out;
}