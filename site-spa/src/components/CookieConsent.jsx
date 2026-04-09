import { useEffect, useMemo, useState } from "react";
import { DEFAULT_CONSENT, getConsent, setConsent } from "../lib/cookieConsent";

const OPEN_EVENT = "open-cookie-preferences";

export default function CookieConsent() {
  const [consent, setConsentState] = useState(null); // null = ainda não escolheu
  const [openPrefs, setOpenPrefs] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_CONSENT);

  // carrega consentimento salvo
  useEffect(() => {
    const c = getConsent();
    if (c) {
      setConsentState(c);
      setDraft(c);
    } else {
      setConsentState(null);
      setDraft(DEFAULT_CONSENT);
    }
  }, []);

  // permite abrir preferências a partir do footer/menu
  useEffect(() => {
    const onOpen = () => setOpenPrefs(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  const showBanner = useMemo(() => consent === null, [consent]);

  const acceptAll = () => {
    const saved = setConsent({ necessary: true, analytics: true, marketing: true });
    setConsentState(saved);
    setDraft(saved);
    setOpenPrefs(false);
  };

  const rejectAll = () => {
    const saved = setConsent({ necessary: true, analytics: false, marketing: false });
    setConsentState(saved);
    setDraft(saved);
    setOpenPrefs(false);
  };

  const savePrefs = () => {
    const saved = setConsent({
      necessary: true,
      analytics: !!draft.analytics,
      marketing: !!draft.marketing,
    });
    setConsentState(saved);
    setDraft(saved);
    setOpenPrefs(false);
  };

  return (
    <>
      {/* BANNER */}
      {showBanner && (
        <div className="fixed bottom-4 left-0 right-0 z-[9999] px-4">
          <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-zinc-700">
                <div className="font-semibold text-zinc-900">Cookies & Privacidade</div>
                <p className="mt-1">
                  Usamos cookies para melhorar sua experiência. Cookies essenciais são necessários para o funcionamento do site.
                  Você pode aceitar, rejeitar ou personalizar.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                <button
                  type="button"
                  onClick={() => setOpenPrefs(true)}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
                >
                  Personalizar
                </button>
                <button
                  type="button"
                  onClick={rejectAll}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
                >
                  Rejeitar
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  Aceitar tudo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREFERÊNCIAS */}
      {openPrefs && (
        <div className="fixed inset-0 z-[10000] grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <h3 className="text-lg font-extrabold">Preferências de Cookies</h3>
              <button
                type="button"
                onClick={() => setOpenPrefs(false)}
                className="grid size-9 place-items-center rounded-full border border-zinc-300 hover:bg-zinc-50"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-zinc-600">
                Escolha quais categorias de cookies você permite. Você pode alterar isso a qualquer momento.
              </p>

              <div className="space-y-3">
                {/* Necessários */}
                <div className="rounded-2xl border border-zinc-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">Essenciais</div>
                      <div className="text-sm text-zinc-600">
                        Necessários para o funcionamento do site (sempre ativos).
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
                      Ativo
                    </span>
                  </div>
                </div>

                {/* Analytics */}
                <div className="rounded-2xl border border-zinc-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">Analíticos</div>
                      <div className="text-sm text-zinc-600">
                        Ajudam a entender o uso do site (ex.: Google Analytics).
                      </div>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm font-semibold">
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={!!draft.analytics}
                        onChange={(e) => setDraft((d) => ({ ...d, analytics: e.target.checked }))}
                      />
                      Permitir
                    </label>
                  </div>
                </div>

                {/* Marketing */}
                <div className="rounded-2xl border border-zinc-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">Marketing</div>
                      <div className="text-sm text-zinc-600">
                        Usados para campanhas e remarketing (ex.: Meta Pixel).
                      </div>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm font-semibold">
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={!!draft.marketing}
                        onChange={(e) => setDraft((d) => ({ ...d, marketing: e.target.checked }))}
                      />
                      Permitir
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={rejectAll}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
                >
                  Rejeitar tudo
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
                >
                  Aceitar tudo
                </button>
                <button
                  type="button"
                  onClick={savePrefs}
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  Salvar preferências
                </button>
              </div>

              <div className="text-xs text-zinc-500">
                Dica: inclua o link para sua Política de Privacidade nesta tela.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}