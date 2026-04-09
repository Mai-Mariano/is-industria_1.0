// src/pages/Privacidade.jsx
import { ShieldCheck, Lock, EyeOff, FileText, Mail, RefreshCcw, AlertTriangle } from "lucide-react";
import { useT, Tx } from "../i18n-helpers";

function Card({ icon: Icon, title, children }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
          <Icon className="size-5" />
        </span>
        <h3 className="text-base font-extrabold tracking-tight text-zinc-900">{title}</h3>
      </div>
      <div className="text-sm text-zinc-700 leading-relaxed">{children}</div>
    </div>
  );
}

export default function Privacidade() {
  const t = useT("privacy");

  return (
    <section className="relative overflow-hidden bg-white py-10 md:py-16">
      {/* fundo sutil */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-72 w-[38rem] -translate-x-1/2 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-24 right-[-6rem] h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />
      </div>

      <div className="container">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 ring-1 ring-sky-100">
            <ShieldCheck className="size-4" />
            {t("badge")}
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl">
            {t("title")}
          </h1>

          <p className="mt-3 text-sm text-zinc-600 md:text-base">
            <Tx prefix="privacy" k="lead" />
          </p>

          <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">

            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1">
              <Lock className="size-3.5" />
              {t("scope")}
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Card icon={EyeOff} title={t("cards.data.title")}>
            <Tx prefix="privacy" k="cards.data.text" />
          </Card>

          <Card icon={Lock} title={t("cards.security.title")}>
            <Tx prefix="privacy" k="cards.security.text" />
          </Card>

          <Card icon={RefreshCcw} title={t("cards.rights.title")}>
            <Tx prefix="privacy" k="cards.rights.text" />
          </Card>


        </div>

        {/* Seções detalhadas */}
        <div className="mt-10 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold tracking-tight text-zinc-900">{t("details.title")}</h2>

          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">{t("details.collect.title")}</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-zinc-700">
                <li><Tx prefix="privacy" k="details.collect.i1" /></li>
                <li><Tx prefix="privacy" k="details.collect.i2" /></li>
                <li><Tx prefix="privacy" k="details.collect.i3" /></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-900">{t("details.use.title")}</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-zinc-700">
                <li><Tx prefix="privacy" k="details.use.i1" /></li>
                <li><Tx prefix="privacy" k="details.use.i2" /></li>
                <li><Tx prefix="privacy" k="details.use.i3" /></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-900">{t("details.cookies.title")}</h3>
              <p className="mt-2 text-sm text-zinc-700">
                <Tx prefix="privacy" k="details.cookies.p1" />
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-900">{t("details.share.title")}</h3>
              <p className="mt-2 text-sm text-zinc-700">
                <Tx prefix="privacy" k="details.share.p1" />
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 flex-none" />
              <div>
                <div className="font-semibold">{t("notice.title")}</div>
                <div className="mt-1 text-amber-800">
                  <Tx prefix="privacy" k="notice.text" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 text-xs text-zinc-500">
            <Tx prefix="privacy" k="footerNote" />
          </div>
        </div>
      </div>
    </section>
  );
}