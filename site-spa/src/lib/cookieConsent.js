const KEY = "is_cookie_consent_v1";

export const DEFAULT_CONSENT = {
  necessary: true,     // sempre true
  analytics: false,
  marketing: false,
  timestamp: null,
};

export function getConsent() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // garante formato
    return {
      ...DEFAULT_CONSENT,
      ...parsed,
      necessary: true,
    };
  } catch {
    return null;
  }
}

export function setConsent(consent) {
  const payload = {
    ...DEFAULT_CONSENT,
    ...consent,
    necessary: true,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(payload));
  return payload;
}

export function clearConsent() {
  localStorage.removeItem(KEY);
}

export function hasConsent(category) {
  const c = getConsent();
  if (!c) return false;
  if (category === "necessary") return true;
  return !!c[category];
}