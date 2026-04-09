// src/pages/AdminUsers.jsx
import { useState, useEffect } from "react";
import { redirect } from "react-router-dom";
import { Users, UserPlus, RefreshCw, Trash2, ToggleRight, KeyRound, Save } from "lucide-react";
import {
  adminListUsers, adminCreateUser, adminToggleUserActive,
  adminResetUserPassword, adminDeleteUser, authMe
} from "../lib/api";

function cls(...a){ return a.filter(Boolean).join(" "); }

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-semibold text-zinc-700">{label}</div>
      {children}
    </label>
  );
}

function Toolbar({ title, icon: Icon, onRefresh }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="inline-flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-lg bg-zinc-900 text-white">
          <Icon className="size-4" />
        </div>
        <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
      </div>
      <button onClick={onRefresh} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-zinc-50">
        <RefreshCw className="size-4" /> Atualizar
      </button>
    </div>
  );
}

function Page() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [createForm, setCreateForm] = useState({ email: "", password: "", is_active: true });
  const [resetForm, setResetForm] = useState({ id: null, email: "", password: "" });

  async function load() {
    setLoading(true);
    setMsg("");
    try {
      const data = await adminListUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setMsg(`Erro ao listar usuários: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function handleCreate() {
    setMsg("");
    try {
      if (!createForm.email.includes("@")) throw new Error("E-mail inválido");
      if ((createForm.password || "").length < 6) throw new Error("Senha muito curta");
      await adminCreateUser(createForm);
      setCreateForm({ email: "", password: "", is_active: true });
      await load();
      setMsg("Usuário criado.");
    } catch (e) {
      setMsg(`Erro ao criar: ${e.message}`);
    }
  }

  async function handleToggle(u) {
    setMsg("");
    try {
      await adminToggleUserActive(u.id);
      await load();
    } catch (e) {
      setMsg(`Erro ao alterar status: ${e.message}`);
    }
  }

  function fillReset(u) {
    setResetForm({ id: u.id, email: u.email, password: "" });
  }

  async function handleReset() {
    setMsg("");
    try {
      if (!resetForm.id) throw new Error("Selecione um usuário na lista (Reset senha).");
      if ((resetForm.password || "").length < 6) throw new Error("Senha muito curta");
      await adminResetUserPassword(resetForm.id, resetForm.password);
      setResetForm({ id: null, email: "", password: "" });
      setMsg("Senha alterada.");
    } catch (e) {
      setMsg(`Erro ao resetar: ${e.message}`);
    }
  }

  async function handleDelete(u) {
    if (!confirm(`Apagar usuário ${u.email}?`)) return;
    setMsg("");
    try {
      await adminDeleteUser(u.id);
      await load();
    } catch (e) {
      setMsg(`Erro ao apagar: ${e.message}`);
    }
  }

  return (
    <div className="bg-white">
      <section className="py-8 md:py-10">
        <div className="container">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Admin • Usuários</h1>
          <p className="mt-1 text-sm text-zinc-600">Crie usuários admin e gerencie acesso.</p>

          <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_.9fr]">
            {/* Lista */}
            <div className="rounded-2xl border bg-white p-4">
              <Toolbar title={`Usuários (${users.length})`} icon={Users} onRefresh={load} />
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 rounded-lg bg-zinc-100 animate-pulse" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="text-sm text-zinc-600">Nenhum usuário ainda.</div>
              ) : (
                <ul className="divide-y">
                  {users.map((u) => (
                    <li key={u.id} className="flex items-center justify-between py-3">
                      <div>
                        <div className="font-semibold">{u.email}</div>
                        <div className="text-xs text-zinc-500">
                          ID: {u.id} • ativo: {u.is_active ? "sim" : "não"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggle(u)}
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50"
                          title={u.is_active ? "Desativar" : "Ativar"}
                        >
                          <ToggleRight className="size-4" /> {u.is_active ? "Desativar" : "Ativar"}
                        </button>
                        <button
                          onClick={() => fillReset(u)}
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50"
                          title="Resetar senha"
                        >
                          <KeyRound className="size-4" /> Reset senha
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="size-4" /> Apagar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Formulários */}
            <div className="rounded-2xl border bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-extrabold tracking-tight">Novo usuário</h3>
              </div>

              <div className="grid gap-3">
                <Field label="E-mail">
                  <input
                    className="w-full rounded-lg border px-3 py-2"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  />
                </Field>
                <Field label="Senha (mín. 6)">
                  <input
                    type="password"
                    className="w-full rounded-lg border px-3 py-2"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  />
                </Field>
                <div className="flex items-center gap-2">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={createForm.is_active}
                    onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })}
                  />
                  <label htmlFor="is_active" className="text-sm text-zinc-700">Ativo</label>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    <UserPlus className="size-4" /> Criar
                  </button>
                </div>

                <hr className="my-4" />

                <h3 className="text-lg font-extrabold tracking-tight">Resetar senha</h3>
                <div className="text-xs text-zinc-500 mb-2">
                  Selecione um usuário na lista com “Reset senha” para preencher aqui.
                </div>
                <Field label="Usuário">
                  <input className="w-full rounded-lg border px-3 py-2" value={resetForm.email} readOnly />
                </Field>
                <Field label="Nova senha (mín. 6)">
                  <input
                    type="password"
                    className="w-full rounded-lg border px-3 py-2"
                    value={resetForm.password}
                    onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
                  />
                </Field>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
                  >
                    <Save className="size-4" /> Salvar nova senha
                  </button>
                </div>

                {msg && (
                  <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {msg}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export const Component = Page;
export default Page;

// Protege a rota (mesmo loader do AdminRH)
export async function loader() {
  const data = await authMe();
  if (!data?.authenticated) return redirect("/login");
  return null;
}
