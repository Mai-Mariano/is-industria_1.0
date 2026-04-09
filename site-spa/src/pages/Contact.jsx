// src/pages/Contato.jsx
import { useState, useMemo } from "react";
import { Mail, Phone, Loader2 } from "lucide-react";
import peca from "../image/contato.png";
import { useT, Tx } from "../i18n-helpers";

const API_URL = import.meta.env.VITE_API_URL || ""; // ex: http://localhost:5001

/* ===== Cartão de contato ===== */
function ContactItem({ icon: Icon, title, value, href }) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 hover:border-sky-300 hover:bg-sky-50/40 transition"
    >
      <div className="h-11 w-11 rounded-xl bg-sky-100 flex items-center justify-center">
        <Icon className="h-5 w-5 text-sky-700" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-zinc-900">{title}</p>
        <p className="truncate text-sm text-zinc-600">{value}</p>
      </div>
    </a>
  );
}

/* ===== Mapa (sem API key) ===== */
function MapEmbed({ query, title = "Como chegar", openText = "Abrir no Google Maps", zoom = 18, height = 420 }) {
  const q = encodeURIComponent(query);
  const mapSrc  = `https://www.google.com/maps?q=${q}&z=${zoom}&hl=pt-BR&output=embed`;
  const mapsURL = `https://www.google.com/maps/search/?api=1&query=${q}&hl=pt-BR`;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between px-2 pb-2">
        <h3 className="text-base font-semibold">{title}</h3>
        <a
          href={mapsURL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-sky-700 hover:underline"
        >
          {openText}
        </a>
      </div>
      <div className="overflow-hidden rounded-2xl">
        <iframe
          title="Mapa da empresa"
          src={mapSrc}
          width="100%"
          height={height}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0 }}
        />
      </div>
    </div>
  );
}

function Page({
  contactEmailProp = "contato@isindustria.com.br",
  contactPhoneProp = "(41) 3033-0160",
  addressProp = "IS Indústria - R. Francisco Alves de Lima, 52 - Costeira, São José dos Pinhais - PR, 83015-510",
}) {
  const t = useT("contact");

  const T = (key, fallback = "") => {
    const v = t(key);
    return typeof v === "string" && v.startsWith("[") ? fallback : v;
  };

  const contactEmail = T("info.email", contactEmailProp);
  const contactPhone = T("info.phone", contactPhoneProp);
  const address      = T("info.address", addressProp);

  const telHref  = useMemo(() => `tel:${contactPhone.replace(/\D/g, "")}`, [contactPhone]);
  const mailHref = useMemo(() => `mailto:${contactEmail}`, [contactEmail]);

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [agree, setAgree] = useState(false);
  const [serverError, setServerError] = useState("");

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!form.name || !form.email || !form.message || !agree) return;

    setStatus("sending");
    try {
      // 🔥 BACKEND espera: nome, email, msg
      const payload = {
        nome: form.name,
        email: form.email,
        msg: form.message,
      };

      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        setStatus("error");
        setServerError(data?.error || `Erro HTTP ${res.status}`);
        return;
      }

      setStatus("ok");
      setForm({ name: "", email: "", message: "" });
      setAgree(false);
    } catch (err) {
      setStatus("error");
      setServerError("Falha de rede (backend está offline ou URL incorreta).");
    }
  };

  return (
    <section className="relative py-12 md:py-20">
      <div className="container grid items-start gap-10 md:grid-cols-2">
        {/* Esquerda: título + formulário */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-7 md:p-9 shadow-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            <Mail className="size-3.5" />
            {t("hero.eyebrow")}
          </span>

          <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
            {t("hero.title")}
          </h1>

          <p className="mt-3 text-sm text-zinc-600">
            <Tx prefix="contact" k="hero.lead" />
          </p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="name" className="text-sm font-medium text-zinc-800">
                  {t("form.name")}
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  autoComplete="name"
                  placeholder={t("form.namePh")}
                  className="h-11 rounded-xl border border-zinc-300 px-4 text-sm outline-none
                             focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition"
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-zinc-800">
                  {t("form.email")}
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  autoComplete="email"
                  placeholder={t("form.emailPh")}
                  className="h-11 rounded-xl border border-zinc-300 px-4 text-sm outline-none
                             focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="message" className="text-sm font-medium text-zinc-800">
                {t("form.message")}
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={onChange}
                required
                rows={5}
                placeholder={t("form.messagePh")}
                className="rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none
                           focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition"
              />
            </div>

            <label className="mt-1 flex items-start gap-3 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-zinc-300 text-sky-600 focus:ring-sky-400"
              />
              <span>
                {t("form.agreePrefix")}
                <a href="Privacidade" className="font-semibold text-sky-700 underline-offset-2 hover:underline">
                  {t("form.agreeLink")}
                </a>.
              </span>
            </label>

            <button
              disabled={status === "sending" || !agree}
              className="mt-2 inline-flex items-center justify-center gap-2 h-11 rounded-xl
                         bg-sky-600 px-5 text-sm font-semibold text-white hover:bg-sky-700
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "sending" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("form.sending")}
                </>
              ) : (
                t("form.submit")
              )}
            </button>

            {status === "ok" && (
              <p className="text-sm text-emerald-600">{t("form.ok")}</p>
            )}

            {status === "error" && (
              <p className="text-sm text-red-600">
                {t("form.error")} {serverError ? `(${serverError})` : ""}
              </p>
            )}
          </form>
        </div>

        {/* Direita: imagem + cartões */}
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl bg-sky-50 p-3 md:p-4">
            <div className="pointer-events-none absolute inset-0 opacity-70">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#e0f2fe_0%,#cfe8ff_35%,#bddbff_55%,#dbeafe_75%,#eef6ff_100%)]" />
            </div>
            <img
              src={peca}
              alt="Equipe em atendimento"
              className="relative z-10 block w-full rounded-2xl object-cover h-[19rem] sm:h-[23rem] md:h-[25rem] lg:h-[29rem]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ContactItem icon={Mail}  title={t("cards.email")} value={contactEmail} href={mailHref} />
            <ContactItem icon={Phone} title={t("cards.phone")} value={contactPhone} href={telHref} />
          </div>
        </div>

        {/* Mapa — largura total */}
        <div className="md:col-span-2">
          <MapEmbed
            query={address}
            title={t("map.title")}
            openText={t("map.open")}
            zoom={18}
            height={420}
          />
        </div>
      </div>
    </section>
  );
}

export const Component = Page;
export default Page;