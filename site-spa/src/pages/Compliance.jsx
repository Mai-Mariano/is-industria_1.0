// src/pages/Compliance.jsx
import { useMemo, useState } from "react";
import { useT } from "../i18n-helpers";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");

// Regras (iguais ao backend)
const MIN_SUBJECT = 6;
const MIN_MESSAGE = 20;

export default function Compliance() {
  const t = useT("compliance");

  const [form, setForm] = useState({ subject: "", message: "", name: "", email: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | ok | error
  const [protocol, setProtocol] = useState("");
  const [error, setError] = useState("");

  const subjectTrim = useMemo(() => String(form.subject || "").trim(), [form.subject]);
  const messageTrim = useMemo(() => String(form.message || "").trim(), [form.message]);

  const subjectLen = subjectTrim.length;
  const messageLen = messageTrim.length;

  const subjectOk = subjectLen >= MIN_SUBJECT;
  const messageOk = messageLen >= MIN_MESSAGE;

  const canSubmit = subjectOk && messageOk && status !== "sending";

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  function mapBackendErrorToI18n(msg) {
    const s = String(msg || "").toLowerCase();

    // tenta reconhecer aquele erro padrão do backend
    const looksLikeMinRule =
      (s.includes("subject") && s.includes("message")) ||
      (s.includes("assunto") && s.includes("relato")) ||
      (s.includes(">=") && (s.includes("6") || s.includes("20")));

    if (looksLikeMinRule) {
      // mensagem combinada traduzida
      return t("form.validation.minBoth", { subjectMin: MIN_SUBJECT, messageMin: MIN_MESSAGE });
    }

    return msg || t("form.error");
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    // ✅ validação no front (já traduzida)
    if (!subjectOk && !messageOk) {
      setStatus("error");
      setProtocol("");
      setError(t("form.validation.minBoth", { subjectMin: MIN_SUBJECT, messageMin: MIN_MESSAGE }));
      return;
    }
    if (!subjectOk) {
      setStatus("error");
      setProtocol("");
      setError(t("form.validation.subjectMin", { min: MIN_SUBJECT }));
      return;
    }
    if (!messageOk) {
      setStatus("error");
      setProtocol("");
      setError(t("form.validation.messageMin", { min: MIN_MESSAGE }));
      return;
    }

    setStatus("sending");
    setError("");
    setProtocol("");

    try {
      const r = await fetch(`${API_BASE}/api/compliance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subjectTrim,
          message: messageTrim,
          // opcionais (deixe vazio para anônimo)
          name: (form.name || "").trim(),
          email: (form.email || "").trim(),
        }),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || t("form.error"));

      setStatus("ok");
      setProtocol(data?.protocol || "");
      setForm({ subject: "", message: "", name: "", email: "" });
    } catch (err) {
      setStatus("error");
      setError(mapBackendErrorToI18n(err?.message));
    }
  };

  const okText = protocol
    ? t("form.okWithProtocol", { protocol })
    : t("form.ok");

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold text-sky-800 ring-1 ring-sky-200">
          <span className="size-1.5 rounded-full bg-sky-400" />
          {t("hero.badge")}
        </div>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl">
          {t("hero.title")}
        </h1>

        <p className="mt-2 text-zinc-600">{t("hero.lead")}</p>

        <form
          onSubmit={onSubmit}
          className="mt-8 grid gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          {/* SUBJECT */}
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-zinc-800">
                {t("form.subjectLabel")}
              </label>
              <span className={`text-xs ${subjectOk ? "text-emerald-600" : "text-zinc-500"}`}>
                {t("form.validation.counter", { current: subjectLen, min: MIN_SUBJECT })}
              </span>
            </div>

            <input
              name="subject"
              required
              minLength={MIN_SUBJECT}
              value={form.subject}
              onChange={onChange}
              className="h-11 rounded-xl border border-zinc-300 px-4 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              placeholder={t("form.subjectPh")}
            />

            {!subjectOk && subjectLen > 0 && (
              <p className="text-xs text-amber-700">
                {t("form.validation.subjectMin", { min: MIN_SUBJECT })}
              </p>
            )}
          </div>

          {/* MESSAGE */}
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-zinc-800">
                {t("form.messageLabel")}
              </label>
              <span className={`text-xs ${messageOk ? "text-emerald-600" : "text-zinc-500"}`}>
                {t("form.validation.counter", { current: messageLen, min: MIN_MESSAGE })}
              </span>
            </div>

            <textarea
              name="message"
              required
              minLength={MIN_MESSAGE}
              rows={7}
              value={form.message}
              onChange={onChange}
              className="rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              placeholder={t("form.messagePh")}
            />

            {!messageOk && messageLen > 0 && (
              <p className="text-xs text-amber-700">
                {t("form.validation.messageMin", { min: MIN_MESSAGE })}
              </p>
            )}
          </div>

          {/* OPTIONALS */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-sm font-semibold text-zinc-800">
                {t("form.nameLabel")}{" "}
                <span className="text-xs text-zinc-500">{t("form.optional")}</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className="h-11 rounded-xl border border-zinc-300 px-4 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                placeholder={t("form.namePh")}
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-semibold text-zinc-800">
                {t("form.emailLabel")}{" "}
                <span className="text-xs text-zinc-500">{t("form.optional")}</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="h-11 rounded-xl border border-zinc-300 px-4 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                placeholder={t("form.emailPh")}
              />
            </div>
          </div>

          <p className="text-xs text-zinc-500">{t("form.anonymousNote")}</p>

          <button
            disabled={!canSubmit}
            className="mt-2 inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? t("form.sending") : t("form.submit")}
          </button>

          {status === "ok" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {okText}
            </div>
          )}

          {status === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}