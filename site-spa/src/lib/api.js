// src/lib/api.js

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");

/**
 * Fetch padrão JSON com:
 * - credentials: include (cookie de sessão)
 * - Content-Type JSON quando tiver body
 * - mensagem de erro decente (json/text)
 */
async function jsonFetch(url, opts = {}) {
  const isAbs = /^https?:\/\//i.test(url);
  const finalUrl = isAbs ? url : `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;

  const headers = { ...(opts.headers || {}) };

  // Se body for objeto, converte para JSON automaticamente
  let body = opts.body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body && !isFormData && typeof body === "object" && !(body instanceof Blob)) {
    body = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  } else if (!headers["Content-Type"] && body && !isFormData) {
    // Se já veio string e não é FormData, garante content-type JSON
    headers["Content-Type"] = "application/json";
  } else if (isFormData) {
    // NÃO setar content-type em FormData (o browser seta boundary)
    delete headers["Content-Type"];
  }

  const res = await fetch(finalUrl, {
    credentials: "include", // ✅ essencial para sessão/cookie
    ...opts,
    headers,
    body,
  });

  if (!res.ok) {
    // tenta extrair erro como json ou texto
    let detail = "";
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const j = await res.json();
        detail = j?.error || j?.message || JSON.stringify(j);
      } else {
        detail = await res.text();
      }
    } catch {
      // ignore
    }
    throw new Error(`HTTP ${res.status} - ${detail || res.statusText}`);
  }

  if (res.status === 204) return null;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

/* ------ AUTH ------ */
export function authLogin(email, password) {
  return jsonFetch("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function authLogout() {
  return jsonFetch("/api/auth/logout", {
    method: "POST",
  }).catch(() => ({ ok: true }));
}

export async function authMe() {
  try {
    return await jsonFetch("/api/auth/me");
  } catch {
    return { authenticated: false };
  }
}

/* --------- VAGAS (public) --------- */
export function listJobsPublic() {
  const url = import.meta.env.VITE_JOBS_URL;
  if (!url) throw new Error("VITE_JOBS_URL não configurado");
  return jsonFetch(url, { credentials: "omit" }); // public: sem cookie
}

/* --------- VAGAS (admin) --------- */
export function adminListJobs() {
  return jsonFetch("/api/admin/jobs");
}
export function adminCreateJob(data) {
  return jsonFetch("/api/admin/jobs", {
    method: "POST",
    body: data,
  });
}
export function adminUpdateJob(id, data) {
  return jsonFetch(`/api/admin/jobs/${id}`, {
    method: "PUT",
    body: data,
  });
}
export function adminPublishJob(id, action = "publish") {
  return jsonFetch(`/api/admin/jobs/${id}/publish?action=${encodeURIComponent(action)}`, {
    method: "POST",
  });
}
export function adminDeleteJob(id) {
  return jsonFetch(`/api/admin/jobs/${id}`, {
    method: "DELETE",
  });
}

/* --------- NOTÍCIAS (public) --------- */
export function listNewsPublic() {
  const url = import.meta.env.VITE_NEWS_URL;
  if (!url) throw new Error("VITE_NEWS_URL não configurado");
  return jsonFetch(url, { credentials: "omit" }); // public: sem cookie
}

/* --------- NOTÍCIAS (admin) --------- */
export function adminListNews() {
  return jsonFetch("/api/admin/news");
}
export function adminCreateNews(data) {
  return jsonFetch("/api/admin/news", {
    method: "POST",
    body: data,
  });
}
export function adminUpdateNews(id, data) {
  return jsonFetch(`/api/admin/news/${id}`, {
    method: "PUT",
    body: data,
  });
}
export function adminPublishNews(id, action = "publish") {
  return jsonFetch(`/api/admin/news/${id}/publish?action=${encodeURIComponent(action)}`, {
    method: "POST",
  });
}
export function adminDeleteNews(id) {
  return jsonFetch(`/api/admin/news/${id}`, {
    method: "DELETE",
  });
}

/* --------- USERS (admin) --------- */
export function adminListUsers() {
  return jsonFetch("/api/admin/users");
}

export function adminCreateUser(body) {
  return jsonFetch("/api/admin/users", {
    method: "POST",
    body,
  });
}

export function adminToggleUserActive(id) {
  return jsonFetch(`/api/admin/users/${id}/toggle-active`, {
    method: "POST",
  });
}

export function adminResetUserPassword(id, password) {
  return jsonFetch(`/api/admin/users/${id}/reset-password`, {
    method: "POST",
    body: { password },
  });
}

export async function adminDeleteUser(id) {
  await jsonFetch(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
  return true;
}

