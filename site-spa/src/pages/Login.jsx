import { useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { authLogin, authMe } from "../lib/api";

function Page() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    try {
      await authLogin(email, pwd);
      window.location.replace("/admin");
    } catch {
      setMsg("Falha no login. Verifique e-mail e senha.");
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 max-w-sm">
        <input
          className="rounded border px-3 py-2"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="rounded border px-3 py-2"
          placeholder="senha"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <button className="rounded bg-zinc-900 px-4 py-2 font-semibold text-white">
          Entrar
        </button>
        {msg && <div className="text-sm text-red-600">{msg}</div>}
      </form>
    </div>
  );
}

export async function loader() {
  const data = await authMe();
  if (data?.authenticated) {
    return redirect("/admin");
  }
  return null;
}

export const Component = Page;
export default Page;
