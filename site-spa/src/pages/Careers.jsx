// src/pages/Careers.jsx
import { motion } from "framer-motion";
import {
  ShieldCheck, Timer, Medal, ArrowRight, Briefcase, MapPin,
  X, UploadCloud, Send, CheckCircle2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import peca from "../image/trabalhe.png";
import { useT, Tx } from "../i18n-helpers";

const JOBS_URL = import.meta.env.VITE_JOBS_URL;

// Base do backend (local/dev ou produção)
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
const APPLY_URL = `${API_BASE}/api/careers/apply`;

/* ───────────────── mini componentes ───────────────── */
function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200 ${className}`}>
      <span className="size-1.5 rounded-full bg-emerald-400" />
      {children}
    </span>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200">
      {children}
    </span>
  );
}

function Perk({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-2 grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon className="size-5" />
      </div>
      <div className="font-semibold">{title}</div>
      <p className="mt-1 text-sm text-zinc-600">{desc}</p>
    </div>
  );
}

function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h4 className="text-lg font-bold">{title}</h4>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full border border-zinc-300 hover:bg-zinc-50">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ==== util: contador simples (0 -> end) ==== */
function useCountUp(end = 100, { duration = 1200, suffix = "", decimals = 0 } = {}) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(end * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  return { ref, text: `${formatted}${suffix}` };
}

function Stat({ value, label, suffix = "", decimals = 0, delay = 0 }) {
  const { ref, text } = useCountUp(value, { duration: 1000 + delay * 100, suffix, decimals });
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <p ref={ref} className="text-4xl font-extrabold tracking-tight text-sky-900 md:text-5xl">{text}</p>
      <p className="mt-2 text-zinc-600">{label}</p>
    </motion.div>
  );
}

function Page() {
  const t = useT("careers");

  const [previewJob, setPreviewJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);

  const [form, setForm] = useState({ nome:"", email:"", linkedin:"", msg:"", arquivo:null });

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // status do envio (backend)
  const [status, setStatus] = useState("idle"); // idle | sending | ok | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        if (!JOBS_URL) {
          setJobs([]);
          return;
        }
        const r = await fetch(JOBS_URL);
        const data = await r.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch {
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    }
    load();
  }, []);

  const openApply = (job) => {
    setApplyJob(job);
    setPreviewJob(null);
    const formEl = document.getElementById("form-curriculo");
    if (formEl) formEl.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ✅ AGORA ENVIA PARA O BACKEND (não abre e-mail)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nome || !form.email) return;

    setStatus("sending");
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("nome", form.nome);
      fd.append("email", form.email);
      fd.append("linkedin", form.linkedin || "");
      fd.append("vaga", applyJob ? applyJob.title : t("mail.talentRole"));
      fd.append("msg", form.msg || "");

      // backend espera "file"
      if (form.arquivo) fd.append("file", form.arquivo, form.arquivo.name);

      const res = await fetch(APPLY_URL, {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `Erro HTTP ${res.status}`);
      }

      setStatus("ok");
      setForm({ nome:"", email:"", linkedin:"", msg:"", arquivo:null });
      setApplyJob(null);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err?.message || "Falha ao enviar");
    }
  };

  return (
    <div className="bg-white">
      {/* ================= HERO ================= */}
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.25)), url(${peca})` }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-900/45 via-sky-900/20 to-transparent" />

        <div className="container flex min-h-[52vh] md:min-h-[60vh] items-center py-12 md:py-16">
          <div className="max-w-3xl text-white">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/20 backdrop-blur">
              <span className="size-1.5 rounded-full bg-lime-300" />
              {t("hero.badge")}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-3 max-w-2xl text-white/90">
              {t("hero.lead")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#vagas" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-md hover:bg-white/90">
                {t("hero.btnJobs")} <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* valores/perks */}
      <section className="py-10 md:py-14">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge>{t("perks.badge")}</Badge>
            <h2 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">
              {t("perks.title")}
            </h2>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Perk icon={ShieldCheck} title={t("perks.security.title")} desc={t("perks.security.desc")} />
            <Perk icon={Timer}       title={t("perks.agility.title")}  desc={t("perks.agility.desc")}  />
            <Perk icon={Medal}       title={t("perks.growth.title")}   desc={t("perks.growth.desc")}   />
          </div>
        </div>
      </section>

      {/* VAGAS + FORM */}
      <section id="vagas" className="py-10 md:py-16">
        <div className="container grid grid-cols-1 gap-6 md:grid-cols-[1.1fr_.9fr]">
          {/* VAGAS */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-extrabold tracking-tight">{t("jobs.title")}</h3>
              <Pill>
                <Briefcase className="mr-1 size-3.5" />
                {jobs.length} {t("jobs.countLabel")}
              </Pill>
            </div>

            <ul className="mt-4 space-y-3">
              {loadingJobs ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <li key={i} className="rounded-2xl border border-zinc-200 p-4">
                    <div className="h-5 w-2/3 bg-zinc-200 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-zinc-200 rounded" />
                  </li>
                ))
              ) : jobs.length === 0 ? (
                <li className="rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-600">
                  {t("jobs.empty")}
                </li>
              ) : (
                jobs.map((job) => (
                  <li key={job.slug || job.title} className="rounded-2xl border border-zinc-200 p-4 hover:shadow-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-[15px] font-semibold">{job.title}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3.5" />
                            {job.location}
                          </span>
                          <span>•</span>
                          <span>{job.type}</span>
                          {job.model && (<><span>•</span><span>{job.model}</span></>)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewJob({
                            title: job.title,
                            location: job.location,
                            type: job.type,
                            summary: job.summary || "",
                            requirements: job.requirements || [],
                          })}
                          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
                        >
                          {t("jobs.preview")}
                        </button>
                        <button
                          onClick={() => openApply({ title: job.title, id: job.slug || job.title })}
                          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                        >
                          {t("jobs.apply")}
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>

            <div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700 ring-1 ring-zinc-200">
              <Tx prefix="careers" k="jobs.talent.text" components={{ b: <b /> }} />
              <button
                onClick={() => openApply(null)}
                className="ml-2 inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-3 py-1 font-semibold hover:bg-zinc-100"
              >
                {t("jobs.talent.cta")} <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          {/* FORMULÁRIO */}
          <div id="form-curriculo" className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg md:text-xl font-extrabold tracking-tight">{t("form.title")}</h3>
            <p className="mt-1 text-sm text-zinc-600">{t("form.lead")}</p>

            <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
              {applyJob && (
                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-emerald-200">
                  {t("form.applyingPrefix")} <b>{applyJob.title}</b>
                </div>
              )}

              <input
                required
                className="rounded-xl border border-zinc-300 px-4 py-3"
                placeholder={t("form.namePh")}
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />

              <input
                required
                type="email"
                className="rounded-xl border border-zinc-300 px-4 py-3"
                placeholder={t("form.emailPh")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <input
                className="rounded-xl border border-zinc-300 px-4 py-3"
                placeholder={t("form.linkedinPh")}
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              />

              <textarea
                rows={4}
                className="rounded-xl border border-zinc-300 px-4 py-3"
                placeholder={t("form.messagePh")}
                value={form.msg}
                onChange={(e) => setForm({ ...form, msg: e.target.value })}
              />

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-zinc-300 px-4 py-3 hover:bg-zinc-50">
                <div className="text-sm text-zinc-600">
                  {form.arquivo
                    ? t("form.fileSelected", { name: form.arquivo.name })
                    : t("form.filePh")}
                </div>
                <UploadCloud className="size-5 text-zinc-500" />
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setForm({ ...form, arquivo: e.target.files?.[0] || null })}
                />
              </label>

              <div className="mt-1 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send className="size-4" />
                  {status === "sending" ? "Enviando..." : t("form.submit")}
                </button>
              </div>

              {status === "ok" && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
                  <CheckCircle2 className="size-4" />
                  {t("form.sentBadge")}
                </div>
              )}

              {status === "error" && (
                <p className="mt-2 text-sm text-red-600">
                  {t("form.error")} {errorMsg ? `- ${errorMsg}` : ""}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* MODAL: Preview da vaga */}
      <Modal open={!!previewJob} onClose={() => setPreviewJob(null)} title={previewJob?.title || t("modal.fallbackTitle")}>
        {previewJob && (
          <div className="space-y-3">
            <div className="text-sm text-zinc-600">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" />
                {previewJob.location}
              </span>{" "}
              • {previewJob.type}
            </div>
            <p className="text-zinc-700">{previewJob.summary}</p>

            {!!previewJob.requirements?.length && (
              <div className="mt-2">
                <div className="mb-1 text-sm font-semibold">{t("modal.requirementsTitle")}</div>
                <ul className="list-disc pl-5 text-sm text-zinc-700">
                  {previewJob.requirements.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </div>
            )}

            <div className="pt-3">
              <button onClick={() => openApply(previewJob)} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
                {t("modal.applyCta")}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export const Component = Page;
export default Page;