import os
from typing import List, Optional

import httpx
from cachetools import TTLCache
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr

from azure.identity import ClientSecretCredential

# =========================
# Load .env (antes de ler os envs)
# =========================
load_dotenv()

# =========================
# LibreTranslate Config
# =========================
LIBRE_URL = os.getenv("LIBRETRANSLATE_URL", "https://libretranslate.de")
LIBRE_API_KEY = os.getenv("LIBRETRANSLATE_API_KEY", None)
TIMEOUT = float(os.getenv("TRANSLATE_TIMEOUT", "8"))
CACHE_TTL = int(os.getenv("CACHE_TTL", "86400"))       # 24h
CACHE_SIZE = int(os.getenv("CACHE_SIZE", "5000"))      # itens em cache

# =========================
# CORS Config (aceita ALLOW_ORIGINS ou ALLOWED_ORIGINS)
# =========================
ALLOW_ORIGINS = os.getenv("ALLOWED_ORIGINS") or os.getenv("ALLOW_ORIGINS") or "*"
origins = [o.strip() for o in ALLOW_ORIGINS.split(",")] if ALLOW_ORIGINS else ["*"]
if "*" in origins:
    origins = ["*"]

# =========================
# Microsoft Graph / 365 Config
# (se não tiver, API sobe e só o /api/contact fica indisponível)
# =========================
TENANT_ID = os.getenv("AZURE_TENANT_ID")
CLIENT_ID = os.getenv("AZURE_CLIENT_ID")
CLIENT_SECRET = os.getenv("AZURE_CLIENT_SECRET")
MAIL_SENDER = os.getenv("MAIL_SENDER")
MAIL_TO = os.getenv("MAIL_TO", "")

GRAPH_CONFIG_OK = all([TENANT_ID, CLIENT_ID, CLIENT_SECRET, MAIL_SENDER, MAIL_TO])

credential = None
if GRAPH_CONFIG_OK:
    credential = ClientSecretCredential(
        tenant_id=TENANT_ID,
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
    )

# =========================
# FastAPI App (ÚNICA instância)
# =========================
app = FastAPI(title="IS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Cache (translate)
# =========================
cache = TTLCache(maxsize=CACHE_SIZE, ttl=CACHE_TTL)

# =========================
# Models - Translate
# =========================
class TranslateRequest(BaseModel):
    source: Optional[str] = Field(default="auto", description="Idioma de origem (ou 'auto')")
    target: str = Field(description="Idioma de destino, ex: en, es, pt")
    texts: List[str] = Field(default_factory=list, description="Lista de textos para traduzir")

class TranslateResponse(BaseModel):
    translations: List[str]
    provider: str = "libretranslate"
    detected_source: Optional[str] = None

def _ckey(target: str, text: str) -> str:
    return f"{target}:{hash(text)}"

async def _lt_translate(client: httpx.AsyncClient, text: str, source: str, target: str) -> str:
    data = {"q": text, "source": source or "auto", "target": target, "format": "html"}
    if LIBRE_API_KEY:
        data["api_key"] = LIBRE_API_KEY

    r = await client.post(f"{LIBRE_URL.rstrip('/')}/translate", data=data, timeout=TIMEOUT)
    r.raise_for_status()
    js = r.json()
    return js.get("translatedText", text)

@app.post("/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest):
    if not req.texts:
        return TranslateResponse(translations=[])

    out: List[str] = []
    to_fetch_idx: List[int] = []
    to_fetch_texts: List[str] = []

    # 1) cache
    for i, txt in enumerate(req.texts):
        txt = txt or ""
        key = _ckey(req.target, txt)
        if key in cache:
            out.append(cache[key])
        else:
            out.append("")  # placeholder
            to_fetch_idx.append(i)
            to_fetch_texts.append(txt)

    # 2) busca faltantes (sequencial)
    if to_fetch_texts:
        async with httpx.AsyncClient() as client:
            for pos, txt in zip(to_fetch_idx, to_fetch_texts):
                try:
                    tr = await _lt_translate(client, txt, req.source or "auto", req.target)
                except httpx.HTTPError:
                    tr = txt  # fallback
                out[pos] = tr
                cache[_ckey(req.target, req.texts[pos] or "")] = tr

    return TranslateResponse(translations=out)

@app.get("/health")
async def health():
    # Health geral: testa LibreTranslate e informa se Graph está configurado
    libre_ok = True
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{LIBRE_URL.rstrip('/')}/languages", timeout=TIMEOUT)
            libre_ok = (r.status_code == 200)
    except Exception:
        libre_ok = False

    return {
        "ok": libre_ok,
        "provider": "libretranslate",
        "libre_url": LIBRE_URL,
        "graph_config_ok": GRAPH_CONFIG_OK,
        "mail_sender": MAIL_SENDER if GRAPH_CONFIG_OK else None,
        "mail_to": MAIL_TO if GRAPH_CONFIG_OK else None,
    }

@app.get("/providers")
def providers():
    return {"providers": [{"name": "libretranslate", "url": LIBRE_URL}]}

# =========================
# Models - Contact (365)
# =========================
class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    message: str = Field(min_length=5, max_length=2000)

def build_html(name: str, email: str, message: str) -> str:
    import html
    return f"""
    <div style="font-family:Arial,sans-serif;line-height:1.4">
      <h2>Novo contato do site</h2>
      <p><b>Nome:</b> {html.escape(name)}</p>
      <p><b>E-mail:</b> {html.escape(email)}</p>
      <p><b>Mensagem:</b></p>
      <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px">{html.escape(message)}</pre>
    </div>
    """

async def send_mail_graph(payload: ContactIn) -> None:
    if not GRAPH_CONFIG_OK or credential is None:
        raise HTTPException(
            status_code=503,
            detail="Config do Microsoft 365/Graph não encontrada no .env (AZURE_* / MAIL_*).",
        )

    # token app-only (.default)
    token = credential.get_token("https://graph.microsoft.com/.default").token

    subject = f"Contato do site — {payload.name}"
    html_body = build_html(payload.name, payload.email, payload.message)

    url = f"https://graph.microsoft.com/v1.0/users/{MAIL_SENDER}/sendMail"

    to_list = [addr.strip() for addr in MAIL_TO.split(",") if addr.strip()]
    if not to_list:
        raise HTTPException(status_code=500, detail="MAIL_TO está vazio no .env.")

    graph_body = {
        "message": {
            "subject": subject,
            "body": {"contentType": "HTML", "content": html_body},
            "toRecipients": [{"emailAddress": {"address": a}} for a in to_list],
            "replyTo": [{"emailAddress": {"address": payload.email, "name": payload.name}}],
        },
        "saveToSentItems": True,
    }

    async with httpx.AsyncClient(timeout=20) as client:
        res = await client.post(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json=graph_body,
        )

    # OK costuma vir como 202 (Accepted)
    if res.status_code not in (200, 202):
        raise HTTPException(
            status_code=400,
            detail=f"Falha ao enviar e-mail (Graph): {res.status_code} - {res.text}",
        )

@app.post("/api/contact")
async def contact(data: ContactIn):
    await send_mail_graph(data)
    return {"ok": True}
