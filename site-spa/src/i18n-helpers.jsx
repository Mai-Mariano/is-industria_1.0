import { useTranslation, Trans } from "react-i18next";

/** useT("about") => (k) => t("about."+k) */
export function useT(prefix = "") {
  const { t } = useTranslation("common");
  return (k, opts) => t(prefix ? `${prefix}.${k}` : k, opts);
}

/** <Tx prefix="about" k="hero.lead" components={{ b:<b/> }} /> */
export function Tx({ prefix = "", k, components }) {
  return (
    <Trans ns="common" i18nKey={prefix ? `${prefix}.${k}` : k} components={components} />
  );
}
