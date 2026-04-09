// src/pages/AdminRH.jsx — layout azul/branco estilo wizard
// Mantém a mesma lógica e campos; corrige upload de imagem (UPLOAD_URL único) e melhora UX

import { useEffect, useMemo, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import {
  adminListJobs, adminCreateJob, adminUpdateJob, adminPublishJob, adminDeleteJob,
  adminListNews, adminCreateNews, adminUpdateNews, adminPublishNews, adminDeleteNews, authLogout, authMe
} from "../lib/api";
import {
  Briefcase, Newspaper, Plus, Save, Upload, Pause, Trash2, RefreshCw, LogOut,
  Search, MapPin, DollarSign, Clock, CalendarDays, Hash, CheckCircle2, CirclePause, Check, X
} from "lucide-react";
import { motion } from "framer-motion";

/* ───────── Config de API (fonte única) ───────── */
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");
const UPLOAD_URL = (import.meta.env.VITE_UPLOAD_URL || `${API_BASE}/api/upload`).replace(/\/$/, "");
console.log("[API_BASE]", API_BASE);
console.log("[UPLOAD_URL]", UPLOAD_URL);


/* ───────── helpers ───────── */
function cls(...a) { return a.filter(Boolean).join(" "); }
function todayISO() { return new Date().toISOString().slice(0, 10); }
const slugify = (s = "") =>
  s
    .normalize("NFD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")   // remove acentos
    .replace(/[^a-z0-9\s-]/g, "")      // caracteres válidos
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* ───────── tiny UI kit (Tailwind) ───────── */
const variants = {
  primary:
    "inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-[.99]",
  outline:
    "inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-900/80 shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300/40",
  ghost:
    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-blue-900/80 hover:bg-blue-50",
  danger:
    "inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400/30",
};
function Button({ variant = "primary", className = "", ...props }) {
  return <button className={cls(variants[variant], className)} {...props} />;
}

function Card({ className = "", children }) {
  return (
    <div className={cls(
      "group relative rounded-2xl border border-blue-100 bg-white/95 shadow-sm hover:shadow-md transition-shadow",
      className
    )}>
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-blue-900/90">
        {label}
        {hint && <span className="text-xs font-normal text-blue-900/60">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

const inputBase =
  "w-full rounded-xl border border-blue-100 bg-white px-3.5 py-2.5 text-sm shadow-sm placeholder:text-blue-900/40 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25";
function Input(props) { return <input className={inputBase} {...props} />; }
function Textarea(props) { return <textarea className={cls(inputBase, "min-h-[120px]")} {...props} />; }
function Select(props) { return <select className={inputBase} {...props} />; }

function Chip({ color = "zinc", children }) {
  const palette = {
    zinc: "bg-blue-50 text-blue-800 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    yellow: "bg-amber-50 text-amber-800 ring-amber-200/70",
    blue: "bg-blue-100 text-blue-800 ring-blue-200/70",
    red: "bg-red-100 text-red-700 ring-red-200/70",
  };
  return (
    <span className={cls("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1", palette[color])}>
      {children}
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    rascunho: { label: "Rascunho", color: "zinc", icon: CirclePause },
    publicada: { label: "Publicada", color: "green", icon: CheckCircle2 },
    pausada: { label: "Pausada", color: "yellow", icon: Pause },
  };
  const cfg = map[status] || map.rascunho;
  const Icon = cfg.icon;
  return (
    <Chip color={cfg.color}>
      <Icon className="size-3.5" /> {cfg.label}
    </Chip>
  );
}

function Toolbar({ title, icon: Icon, onRefresh, extra }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Icon className="size-4" />
        </div>
        <h2 className="text-lg font-extrabold tracking-tight text-blue-950">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        {extra}
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="size-4" /> Atualizar
        </Button>
      </div>
    </div>
  );
}

/* ───────── wizard helpers (layout) ───────── */
function ProgressBar({ current = 1, total = 4 }) {
  const pct = Math.min(100, Math.max(0, Math.round((current - 1) / Math.max(1, (total - 1)) * 100)));
  return (
    <div className="mb-4">
      <div className="h-2 w-full rounded-full bg-blue-100">
        <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: pct + '%' }} />
      </div>
    </div>
  );
}

function StepList({ title = "Etapas do formulário", steps = [], current = 1 }) {
  return (
    <Card className="p-4 sticky top-4">
      <p className="mb-3 text-sm font-bold text-blue-950">{title}</p>
      <ol className="space-y-3">
        {steps.map((s, i) => {
          const idx = i + 1;
          const done = idx < current;
          const active = idx === current;
          return (
            <li key={i} className={cls("flex items-start gap-3", active ? "text-blue-900" : "text-blue-900/70") }>
              <span className={cls(
                "mt-0.5 grid size-6 place-items-center rounded-full border text-xs font-bold",
                done ? "border-blue-200 bg-blue-600 text-white" : active ? "border-blue-400 bg-white text-blue-900" : "border-blue-200 bg-white text-blue-700"
              )}>
                {done ? <Check className="size-4" /> : idx}
              </span>
              <div className="-mt-0.5">
                <p className="text-sm font-semibold">{s.title}</p>
                {s.desc && <p className="text-xs text-blue-900/70">{s.desc}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function LeftMiniPanel({ title, description, children }) {
  return (
    <Card className="p-4 sticky top-4">
      <p className="text-sm font-bold text-blue-950">{title}</p>
      {description && <p className="mt-1 text-xs text-blue-900/70">{description}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </Card>
  );
}

/* =================== PÁGINA (duas abas) =================== */
function Page() {
  const [tab, setTab] = useState("vagas"); // "vagas" | "news"
  const nav = useNavigate();

  async function sair() {
    try { await authLogout(); } catch {}
    nav("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* topo */}
      <div className="border-b border-blue-100/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <section className="py-8 md:py-10">
          <div className="container">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-blue-950">Admin • RH</h1>
                <p className="mt-1 text-sm text-blue-900/70">Cadastre e gerencie Vagas e Notícias.</p>
              </div>
              <Button variant="outline" onClick={sair} title="Sair">
                <LogOut className="size-4" /> Sair
              </Button>
            </div>

            {/* Tabs com indicador animado */}
            <div className="mt-6 inline-flex rounded-2xl border border-blue-100 bg-white/90 p-1 shadow-sm">
              {[
                { id: "vagas", label: "Vagas", Icon: Briefcase },
                { id: "news", label: "Notícias", Icon: Newspaper },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cls(
                    "relative mx-0.5 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                    tab === t.id ? "text-blue-950" : "text-blue-900/70 hover:text-blue-900"
                  )}
                >
                  {tab === t.id && (
                    <motion.span
                      layoutId="tab-bg"
                      className="absolute inset-0 rounded-xl bg-blue-600"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <t.Icon className={cls("size-4", tab === t.id ? "text-white" : "")} />
                  <span className={cls(tab === t.id ? "text-white" : "")}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* conteúdo */}
      <section className="py-8 md:py-10">
        <div className="container">
          {tab === "vagas" ? <VagasPanel /> : <NewsPanel />}
        </div>
      </section>
    </div>
  );
}

/* =================== VAGAS =================== */
function VagasPanel() {
  const empty = {
    id: null, status: "rascunho",
    titulo: "", slug: "", localidade: "", tipo: "CLT", modelo: "Presencial",
    salario: "", resumo: "", descricao_md: "", requisitos_md: "", beneficios_md: "",
    dt_expiracao: ""
  };

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await adminListJobs();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMessage(`Erro ao listar vagas: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function edit(row) {
    setForm({
      ...empty,
      id: row.id,
      titulo: row.titulo || "",
      slug: row.slug || "",
      status: row.status || "rascunho",
      localidade: row.localidade || "",
      tipo: row.tipo || "CLT",
      modelo: row.modelo || "Presencial",
      salario: row.salario || "",
      resumo: row.resumo || "",
      descricao_md: row.descricao_md || "",
      requisitos_md: row.requisitos_md || "",
      beneficios_md: row.beneficios_md || "",
      dt_expiracao: row.dt_expiracao || "",
    });
    setMessage("");
  }

  function handleTitle(v) {
    const next = { ...form, titulo: v };
    if (!form.slug?.trim()) next.slug = slugify(v);
    setForm(next);
  }

  async function handleSave() {
    setSaving(true); setMessage("");
    try {
      if (!form.titulo.trim()) throw new Error("Título é obrigatório.");
      if (!form.localidade.trim()) throw new Error("Localidade é obrigatória.");
      if (!form.descricao_md.trim()) throw new Error("Descrição é obrigatória.");

      const payload = { ...form };
      if (!payload.slug) payload.slug = slugify(payload.titulo);

      if (form.id) {
        await adminUpdateJob(form.id, payload);
      } else {
        const out = await adminCreateJob(payload);
        if (out?.id) setForm((f) => ({ ...f, id: out.id, slug: out.slug || payload.slug }));
      }
      await load();
      setMessage("Vaga salva com sucesso.");
    } catch (e) {
      setMessage(`Erro ao salvar: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function doPublish(row, action) {
    try {
      await adminPublishJob(row.id, action);
      await load();
      setMessage(action === "publish" ? "Vaga publicada." : "Vaga pausada.");
    } catch (e) {
      setMessage(`Erro ao publicar/pausar: ${e.message}`);
    }
  }

  async function doDelete(row) {
    if (!confirm(`Apagar a vaga "${row.titulo}"?`)) return;
    try {
      await adminDeleteJob(row.id);
      await load();
      if (form.id === row.id) setForm(empty);
      setMessage("Vaga apagada.");
    } catch (e) {
      setMessage(`Erro ao apagar: ${e.message}`);
    }
  }

  const count = useMemo(() => list.length, [list]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return list;
    return list.filter((r) =>
      [r.titulo, r.localidade, r.slug, r?.modelo, r?.tipo]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(t))
    );
  }, [list, q]);

  const step = (() => {
    const s2 = Boolean(form.titulo && form.localidade && form.descricao_md);
    const s3 = Boolean(form.id);
    const s4 = form.status === "publicada";
    return s4 ? 4 : s3 ? 3 : s2 ? 2 : 1;
  })();

  const steps = [
    { title: "Escolha a aba Vagas", desc: "Gerencie as posições abertas." },
    { title: "Preencha os dados", desc: "Título, localidade, descrição e detalhes." },
    { title: "Salvar & publicar", desc: "Salve e então publique ou pause." },
    { title: "Revisar e concluir", desc: "Confira status e expiração." },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr_320px]">
      {/* Esquerda (mini painel) */}
      <LeftMiniPanel title="Formulário de vagas" description="Pesquise e edite vagas.">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-blue-900/40" />
          <Input placeholder="Buscar vagas…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </LeftMiniPanel>

      {/* Centro (lista + form) */}
      <div className="space-y-6">
        <Card className="p-4">
          <ProgressBar current={step} total={4} />
          <Toolbar title={`Vagas (${count})`} icon={Briefcase} onRefresh={load} />

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-blue-50" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-blue-200 p-10 text-center">
              <Briefcase className="mb-2 size-6 text-blue-300" />
              <p className="text-sm text-blue-900/70">Nenhuma vaga encontrada.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((row) => (
                <li key={row.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-blue-950">{row.titulo}</p>
                      <StatusPill status={row.status} />
                      {row.slug && (<Chip color="blue"><Hash className="size-3.5" /> {row.slug}</Chip>)}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-blue-900/70">
                      {row.localidade && (<span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {row.localidade}</span>)}
                      {row.tipo && (<span className="inline-flex items-center gap-1"><Briefcase className="size-3.5" /> {row.tipo}</span>)}
                      {row.modelo && (<span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {row.modelo}</span>)}
                      {row.salario && (<span className="inline-flex items-center gap-1"><DollarSign className="size-3.5" /> {row.salario}</span>)}
                      {row.dt_expiracao && (<span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" /> expira {row.dt_expiracao}</span>)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => edit(row)}>Editar</Button>
                    {row.status === "publicada" ? (
                      <Button variant="outline" onClick={() => doPublish(row, "pause")}>
                        <Pause className="size-4" /> Pausar
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => doPublish(row, "publish")}>
                        <Upload className="size-4" /> Publicar
                      </Button>
                    )}
                    <Button variant="danger" onClick={() => doDelete(row)}>
                      <Trash2 className="size-4" /> Apagar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-extrabold tracking-tight text-blue-950">{form.id ? "Editar vaga" : "Nova vaga"}</h3>
            <Button variant="outline" onClick={() => setForm(empty)}>
              <Plus className="size-4" /> Nova
            </Button>
          </div>

          <div className="grid gap-3">
            <Field label="Título">
              <Input value={form.titulo} onChange={(e) => handleTitle(e.target.value)} />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Localidade">
                <Input value={form.localidade} onChange={(e) => setForm({ ...form, localidade: e.target.value })} />
              </Field>
              <Field label="Tipo">
                <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  <option>CLT</option>
                  <option>Estágio</option>
                  <option>PJ</option>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Modelo">
                <Select value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })}>
                  <option>Presencial</option>
                  <option>Híbrido</option>
                  <option>Remoto</option>
                </Select>
              </Field>
              <Field label="Faixa salarial (opcional)">
                <Input value={form.salario} onChange={(e) => setForm({ ...form, salario: e.target.value })} />
              </Field>
            </div>

            <Field label="Resumo (opcional)">
              <Input value={form.resumo} onChange={(e) => setForm({ ...form, resumo: e.target.value })} />
            </Field>

            <Field label="Descrição (Markdown)">
              <Textarea rows={8} value={form.descricao_md} onChange={(e) => setForm({ ...form, descricao_md: e.target.value })} />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Requisitos (um por linha)">
                <Textarea rows={6} value={form.requisitos_md} onChange={(e) => setForm({ ...form, requisitos_md: e.target.value })} />
              </Field>
              <Field label="Benefícios (um por linha)">
                <Textarea rows={6} value={form.beneficios_md} onChange={(e) => setForm({ ...form, beneficios_md: e.target.value })} />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Slug (opcional)" hint="gerado do título se vazio">
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </Field>
              <Field label="Expira em (opcional)">
                <Input type="date" value={form.dt_expiracao || ""} onChange={(e) => setForm({ ...form, dt_expiracao: e.target.value })} />
              </Field>
            </div>

            <div className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-2 border-t border-blue-100 bg-white/90 p-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="size-4" /> {form.id ? "Salvar alterações" : "Salvar rascunho"}
                </Button>
                {form.id && (
                  <>
                    <Button variant="outline" onClick={() => adminPublishJob(form.id, "publish").then(load)}>
                      <Upload className="size-4" /> Publicar
                    </Button>
                    <Button variant="outline" onClick={() => adminPublishJob(form.id, "pause").then(load)}>
                      <Pause className="size-4" /> Pausar
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-blue-100 p-4">
              <div className="mb-2 text-sm font-semibold text-blue-950">Pré-visualização (texto)</div>
              <div className="prose prose-sm max-w-none text-blue-950">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{form.descricao_md || "Escreva a descrição em Markdown aqui..."}</pre>
              </div>
            </div>

            {message && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {message}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Direita (etapas) */}
      <StepList title="Etapas do formulário" steps={steps} current={step} />
    </div>
  );
}

/* =================== NOTÍCIAS =================== */
function NewsPanel() {
  const empty = {
    id: null, status: "rascunho",
    title: "", slug: "", date: todayISO(), tag: "", excerpt: "",
    content_md: "", image: "", url: ""
  };

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await adminListNews();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMessage(`Erro ao listar notícias: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

function edit(row) {
  setForm({
    ...empty,
    id: row.id,
    title: row.title || row.titulo || "",
    slug: row.slug || "",
    status: row.status || "rascunho",
    date: row.date || row.data || todayISO(),
    tag: row.tag || "",
    excerpt: row.excerpt || row.resumo || "",
    // ✅ aceita content_md OU content OU content_html (caso backend mude)
    content_md: row.content_md || row.content || row.content_html || "",
    // ✅ aceita image OU image_url
    image: row.image || row.image_url || "",
    url: row.url || "",
  });

  setMessage("");
  setPreview("");
  setFile(null);
}

  function handleTitle(v) {
    const next = { ...form, title: v };
    if (!form.slug?.trim()) next.slug = slugify(v);
    setForm(next);
  }

  // --- helpers de upload de imagem (usa UPLOAD_URL global) ---
  async function uploadImageFile(f) {
    const fd = new FormData();
    fd.append("file", f); // o backend espera "file"

    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      body: fd,
      credentials: "include", // deixe se usa cookie/sessão; remova se usa token
    });

if (!res.ok) {
  let detail = "";
  try {
    const ct = res.headers.get("content-type") || "";
    detail = ct.includes("application/json") ? JSON.stringify(await res.json()) : await res.text();
  } catch {}
  throw new Error(`Upload falhou (${res.status}) ${detail?.slice(0, 300)}`);
}

    let data;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      try { data = JSON.parse(text); } catch {
        throw new Error(`Resposta não é JSON: ${text?.slice(0,200)}`);
      }
    }

    const url = data?.url || data?.secure_url || data?.path;
    if (!url) throw new Error("A API não retornou a URL da imagem (esperado 'url' | 'secure_url' | 'path').");
    return url;
  }

  function pickFile(f) {
    if (!f) return;
    setMessage("");
    try { setPreview(URL.createObjectURL(f)); } catch {}
    setUploading(true);
    setFile(f);
    uploadImageFile(f)
      .then((url) => setForm((prev) => ({ ...prev, image: url })))
      .catch((e) => setMessage(`Erro no upload: ${e.message}`))
      .finally(() => setUploading(false));
  }

  async function handleSave() {
    setSaving(true); setMessage("");
    try {
      // Garante URL mesmo se o usuário salvar logo após escolher o arquivo
      let imageUrl = (form.image || "").trim();
      if (!imageUrl && file) {
        imageUrl = await uploadImageFile(file);
        setForm((f) => ({ ...f, image: imageUrl }));
      }

      if (!form.title.trim()) throw new Error("Título é obrigatório.");
      if (!form.date) throw new Error("Data é obrigatória.");
      if (!imageUrl) throw new Error("Imagem é obrigatória.");
      if (!form.content_md.trim()) throw new Error("Conteúdo é obrigatório.");

const payload = {
  id: form.id,
  status: form.status,
  title: form.title.trim(),
  slug: (form.slug?.trim() || slugify(form.title)).trim(),
  date: form.date,
  tag: (form.tag || "").trim(),
  excerpt: (form.excerpt || "").trim(),
  url: (form.url || "").trim(),
  image: imageUrl,

  // ✅ manda nos dois nomes pra não quebrar se o backend espera "content"
  content_md: form.content_md,
  content: form.content_md,
};

      if (form.id) {
        await adminUpdateNews(form.id, payload);
      } else {
        const out = await adminCreateNews(payload);
        if (out?.id) setForm((f) => ({ ...f, id: out.id, slug: out.slug || payload.slug }));
      }
      await load();
      setMessage("Notícia salva com sucesso.");
    } catch (e) {
      setMessage(`Erro ao salvar: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function doPublish(row, action) {
    try {
      await adminPublishNews(row.id, action);
      await load();
      setMessage(action === "publish" ? "Notícia publicada." : "Notícia pausada.");
    } catch (e) {
      setMessage(`Erro ao publicar/pausar: ${e.message}`);
    }
  }

  async function doDelete(row) {
    if (!confirm(`Apagar a notícia "${row.title}"?`)) return;
    try {
      await adminDeleteNews(row.id);
      await load();
      if (form.id === row.id) setForm(empty);
      setMessage("Notícia apagada.");
    } catch (e) {
      setMessage(`Erro ao apagar: ${e.message}`);
    }
  }

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return list;
    return list.filter((r) => [r.title, r.tag, r.slug].filter(Boolean).some((x) => String(x).toLowerCase().includes(t)));
  }, [list, q]);

  const step = (() => {
    const s2 = Boolean(form.image || preview);
    const s3 = Boolean(form.content_md);
    const s4 = Boolean(form.id);
    return s4 ? 4 : s3 ? 3 : s2 ? 2 : 1;
  })();

  const steps = [
    { title: "Escolha a aba Notícias", desc: "Gerencie publicações." },
    { title: "Adicione uma imagem", desc: "Envie ou selecione uma URL." },
    { title: "Escreva o conteúdo", desc: "Título, resumo, conteúdo e metadados." },
    { title: "Salvar & publicar", desc: "Revise e publique." },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr_320px]">
      {/* Esquerda (mini painel) */}
      <LeftMiniPanel title="Formulário de notícias" description="Pesquise e edite notícias.">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-blue-900/40" />
          <Input placeholder="Buscar notícias…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </LeftMiniPanel>

      {/* Centro (lista) */}
      <div className="space-y-6">
        <Card className="p-4">
          <ProgressBar current={step} total={4} />
          <Toolbar title={`Notícias (${list.length})`} icon={Newspaper} onRefresh={load} />

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-blue-50" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-blue-200 p-10 text-center">
              <Newspaper className="mb-2 size-6 text-blue-300" />
              <p className="text-sm text-blue-900/70">Nenhuma notícia cadastrada ainda.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((row) => (
                <li key={row.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-blue-950">{row.title}</p>
                      <StatusPill status={row.status} />
                      {row.slug && (<Chip color="blue"><Hash className="size-3.5" /> {row.slug}</Chip>)}
                      {row.tag && (<Chip color="zinc">{row.tag}</Chip>)}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-blue-900/70">
                      {row.date && (<span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" /> {row.date}</span>)}
                      {row.url && (<a href={row.url} target="_blank" rel="noreferrer" className="text-blue-700 underline-offset-2 hover:underline">link externo</a>)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => edit(row)}>Editar</Button>
                    {row.status === "publicada" ? (
                      <Button variant="outline" onClick={() => doPublish(row, "pause")}>
                        <Pause className="size-4" /> Pausar
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => doPublish(row, "publish")}>
                        <Upload className="size-4" /> Publicar
                      </Button>
                    )}
                    <Button variant="danger" onClick={() => doDelete(row)}>
                      <Trash2 className="size-4" /> Apagar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Form */}
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-extrabold tracking-tight text-blue-950">{form.id ? "Editar notícia" : "Nova notícia"}</h3>
            <Button variant="outline" onClick={() => setForm(empty)}>
              <Plus className="size-4" /> Nova
            </Button>
          </div>

          <div className="grid gap-3">
            <Field label="Título">
              <Input value={form.title} onChange={(e) => handleTitle(e.target.value)} />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Data">
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
              <Field label="Tag (opcional)">
                <Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
              </Field>
            </div>

            <Field label="Resumo (opcional)">
              <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            </Field>

            {/* Upload obrigatório */}
            <Field label="Imagem (obrigatória)">
              {form.image ? (
                <div className="flex items-start gap-3">
                  <div className="group relative inline-block">
                    <img src={form.image} alt="Pré-visualização" className="h-20 w-20 rounded-lg object-cover ring-1 ring-blue-100" />
                    <button
                      type="button"
                      title="Remover imagem"
                      onClick={() => { setForm((f)=>({ ...f, image: "" })); setPreview(""); setFile(null); }}
                      className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-white text-blue-900/80 shadow ring-1 ring-blue-200 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <label className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-blue-900/80 shadow-sm hover:bg-blue-50 cursor-pointer">
                    <Upload className="size-4" /> Trocar imagem
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
                  </label>
                  <p className="text-xs text-blue-900/60">JPEG/PNG até ~5MB.</p>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-6 text-center hover:bg-blue-50"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) pickFile(f); }}
                >
                  <div>
                    <Upload className="mx-auto mb-2 size-6 text-blue-400" />
                    <div className="text-sm font-semibold text-blue-950">Clique para enviar</div>
                    <div className="text-xs text-blue-900/70">ou arraste e solte uma imagem</div>
                  </div>
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
                </label>
              )}
              {preview && !form.image && (
                <div className="mt-2 relative inline-block">
                  <img src={preview} alt="Pré-visualização" className="h-20 w-20 rounded-lg object-cover ring-1 ring-blue-100" />
                  <button
                    type="button"
                    title="Remover imagem"
                    onClick={() => { setPreview(""); setFile(null); }}
                    className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-white text-blue-900/80 shadow ring-1 ring-blue-200 hover:bg-blue-50"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
              {uploading && <div className="mt-2 text-xs text-blue-900/70">Enviando imagem...</div>}
            </Field>

            <Field label="URL externa (opcional)">
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </Field>

            <Field label="Conteúdo (Markdown)">
              <Textarea rows={10} value={form.content_md} onChange={(e) => setForm({ ...form, content_md: e.target.value })} />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Slug (opcional)" hint="gerado do título se vazio">
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </Field>
              <div />
            </div>

            <div className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-2 border-t border-blue-100 bg-white/90 p-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSave} disabled={saving || uploading}>
                  <Save className="size-4" /> {form.id ? "Salvar alterações" : "Salvar rascunho"}
                </Button>
                {form.id && (
                  <>
                    <Button variant="outline" onClick={() => adminPublishNews(form.id, "publish").then(load)}>
                      <Upload className="size-4" /> Publicar
                    </Button>
                    <Button variant="outline" onClick={() => adminPublishNews(form.id, "pause").then(load)}>
                      <Pause className="size-4" /> Pausar
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-blue-100 p-4">
              <div className="mb-2 text-sm font-semibold text-blue-950">Pré-visualização (texto)</div>
              <div className="prose prose-sm max-w-none text-blue-950">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{form.content_md || "Escreva o conteúdo em Markdown aqui..."}</pre>
              </div>
            </div>

            {message && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {message}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Direita (etapas) */}
      <StepList title="Etapas do formulário" steps={steps} current={step} />
    </div>
  );
}

/* ===== exports ===== */
export const Component = Page;
export default Page;


export async function loader() {
  const data = await authMe();
  if (!data?.authenticated) return redirect("/login");
  return null;
}
