// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Linkedin, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "../image/logo.png";

const SOCIAL = {
  instagram: "https://www.instagram.com/isindustria/",
  linkedin: "https://br.linkedin.com/company/isindustria",
};

export default function Footer() {
  const { t } = useTranslation("common");
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-white">
      {/* separador full-bleed */}
      <div className="h-px w-full bg-zinc-200" />

      {/* conteúdo centralizado */}
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        {/* Top */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-3"
              aria-label={t("brand", { defaultValue: "IS Indústria" })}
            >
              <img
                src={logo}
                alt={t("brand", { defaultValue: "IS Indústria" })}
                className="h-10 w-auto object-contain"
              />
            </Link>

            <p className="mt-4 text-sm text-zinc-600">
              {t("tagline", {
                defaultValue: "Soluções industriais com qualidade, segurança e inovação.",
              })}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <a
                href={SOCIAL.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-50"
                aria-label={t("social.linkedin", { defaultValue: "LinkedIn" })}
                title={t("social.linkedin", { defaultValue: "LinkedIn" })}
              >
                <Linkedin className="h-5 w-5" />
              </a>

              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-50"
                aria-label={t("social.instagram", { defaultValue: "Instagram" })}
                title={t("social.instagram", { defaultValue: "Instagram" })}
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              {t("colunas.empresa", { defaultValue: "Institucional" })}
            </h3>

            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/QuemSomos" className="hover:text-brand-700">
                  {t("links.sobre", { defaultValue: "Quem Somos" })}
                </Link>
              </li>

              <li>
                <Link to="/certificados" className="hover:text-brand-700">
                  {t("links.certificados", { defaultValue: "Certificados" })}
                </Link>
              </li>

              <li>
                <Link to="/carreiras" className="hover:text-brand-700">
                  {t("links.carreiras", { defaultValue: "Carreiras" })}
                </Link>
              </li>

              <li>
                <Link to="/noticias" className="hover:text-brand-700">
                  {t("links.noticias", { defaultValue: "Notícias" })}
                </Link>
              </li>


            </ul>
          </div>

          {/* Serviços */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              {t("colunas.recursos", { defaultValue: "Serviços" })}
            </h3>

            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/servicos" className="hover:text-brand-700">
                  {t("links.servicos", { defaultValue: "Todos os serviços" })}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              {t("colunas.contato", { defaultValue: "Contato" })}
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-zinc-700">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 flex-none" />
                <a href="mailto:contato@isindustria.com.br" className="hover:text-brand-700">
                  contato@isindustria.com.br
                </a>
              </li>

              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 flex-none" />
                <a href="tel:+554130330160" className="hover:text-brand-700">
                  +55 (41) 3033-0160
                </a>
              </li>

              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-none" />
                <span>
                  {t("endereco", {
                    defaultValue:
                      "R. Francisco Alves de Lima, 52 - Costeira, São José dos Pinhais - PR, 83015-510",
                  })}
                </span>
              </li>

              <li className="pt-2 flex flex-wrap gap-2">
                <Link
                  to="/contato"
                  className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-white text-sm font-semibold hover:bg-brand-700"
                >
                  {t("cta", { defaultValue: "Fale Conosco" })}
                </Link>

                {/* ✅ Botão Compliance (secundário) */}
                <Link
                  to="/compliance"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                  title={t("links.compliance", { defaultValue: "Canal de Compliance" })}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t("footer.complianceCta", { defaultValue: "Compliance" })}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative mt-10 flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between
                        before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-zinc-300">
          <p className="text-xs text-zinc-500">
            © {year} {t("copy", { defaultValue: "IS Indústria — Todos os direitos reservados." })}
          </p>

          {/* ✅ Link extra no bottom (opcional, mas ajuda a achar) */}
          <Link
            to="/compliance"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-brand-700"
          >
            <ShieldCheck className="h-4 w-4" />
            {t("footer.complianceLink", { defaultValue: "Canal de Compliance" })}
          </Link>
        </div>
      </div>
    </footer>
  );
}