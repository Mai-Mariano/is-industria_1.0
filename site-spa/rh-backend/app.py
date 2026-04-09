# rh-backend/app.py
from __future__ import annotations

import os
import uuid
import base64
from typing import Optional, List, Dict
from datetime import datetime


import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify, url_for
from flask_cors import CORS

from extensions import db
from routes.translate import translate_bp
from routes.careers import careers_bp
from routes import bp_public, bp_admin, users_admin_bp
from routes.auth import auth_bp

# Carrega variáveis do .env (se existir)
load_dotenv()

GRAPH_SCOPE = "https://graph.microsoft.com/.default"


def _split_origins(value: str) -> List[str]:
    # "http://a, http://b" -> ["http://a", "http://b"]
    return [v.strip() for v in (value or "").split(",") if v.strip()]


def _get_allowed_origins() -> List[str]:
    # Prioriza ALLOWED_ORIGINS (recomendado)
    env_allowed = os.getenv("ALLOWED_ORIGINS", "").strip()
    if env_allowed:
        return _split_origins(env_allowed)

    # Fallbacks antigos
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5174","http://localhost:5173").strip()

    return list(dict.fromkeys([
        frontend_origin,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:4173",  # vite preview
        "http://127.0.0.1:4173",
    ]))


def get_graph_token() -> str:
    tenant = os.getenv("AZURE_TENANT_ID")
    client_id = os.getenv("AZURE_CLIENT_ID")
    client_secret = os.getenv("AZURE_CLIENT_SECRET")

    if not tenant or not client_id or not client_secret:
        raise RuntimeError("Faltam AZURE_TENANT_ID / AZURE_CLIENT_ID / AZURE_CLIENT_SECRET no .env")

    url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "client_credentials",
        "scope": GRAPH_SCOPE,
    }

    r = requests.post(url, data=data, timeout=20)
    if r.status_code != 200:
        raise RuntimeError(f"Erro token ({r.status_code}): {r.text}")

    return r.json()["access_token"]


def send_mail(
    subject: str,
    html_body: str,
    to_email: Optional[str] = None,
    reply_to: Optional[Dict[str, str]] = None,
    attachments: Optional[List[Dict]] = None,
) -> None:
    """
    Envia e-mail via Microsoft Graph usando Application Permission (Mail.Send).
    Usa /users/{MAIL_SENDER}/sendMail.
    """
    sender = os.getenv("MAIL_SENDER")
    default_to = os.getenv("MAIL_TO")
    to_email = to_email or default_to

    if not sender or not to_email:
        raise RuntimeError("Faltam MAIL_SENDER e/ou MAIL_TO no .env")

    token = get_graph_token()

    message = {
        "subject": subject,
        "body": {"contentType": "HTML", "content": html_body},
        "toRecipients": [{"emailAddress": {"address": to_email}}],
    }

    if reply_to and reply_to.get("address"):
        message["replyTo"] = [{
            "emailAddress": {
                "address": reply_to["address"],
                "name": reply_to.get("name", ""),
            }
        }]

    if attachments:
        message["attachments"] = attachments

    url = f"https://graph.microsoft.com/v1.0/users/{sender}/sendMail"
    payload = {"message": message, "saveToSentItems": True}

    r = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json=payload,
        timeout=30,
    )

    if r.status_code not in (202, 200):
        raise RuntimeError(f"Erro sendMail ({r.status_code}): {r.text}")


def create_app() -> Flask:
    app = Flask(__name__, static_folder="static", static_url_path="/static")

    # Configs básicas
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///dev.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # limite de upload (MB) — default 8MB
    app.config["MAX_CONTENT_LENGTH"] = int(os.environ.get("MAX_UPLOAD_MB", "8")) * 1024 * 1024

    # DB
    db.init_app(app)

    # CORS
    frontend_origins = _get_allowed_origins()
    CORS(
        app,
        resources={r"/api/*": {"origins": frontend_origins}},
        supports_credentials=True,
    )

    # Healthcheck
    @app.get("/")
    def health():
        return jsonify(ok=True, service="rh-backend")

    # ----------------------------
    # CONTATO (site) -> envia email
    # ----------------------------
    @app.post("/api/contact")
    def api_contact():
        data = request.get_json(silent=True) or {}

        # aceita tanto pt quanto en (pra evitar mismatch do front/postman)
        nome = (data.get("nome") or data.get("name") or "").strip()
        email = (data.get("email") or "").strip()
        msg = (data.get("msg") or data.get("message") or "").strip()

        if not nome or not email or not msg:
            return jsonify({"ok": False, "error": "nome, email e msg são obrigatórios"}), 400

        subject = f"Site • Contato • {nome}"
        html = f"""
          <h3>Novo contato pelo site</h3>
          <p><b>Nome:</b> {nome}</p>
          <p><b>Email:</b> {email}</p>
          <p><b>Mensagem:</b><br/>{msg.replace(chr(10), "<br/>")}</p>
        """

        try:
            # envia pro MAIL_TO (do .env) e configura Reply-To pra responder o usuário
            send_mail(subject, html, reply_to={"address": email, "name": nome})
            return jsonify({"ok": True})
        except Exception as e:
            return jsonify({"ok": False, "error": str(e)}), 500

    # ------------------------------------
    # TRABALHE CONOSCO -> envia pro RH + PDF
    # ------------------------------------
    @app.route("/api/careers/apply", methods=["POST", "OPTIONS"])
    def careers_apply():
        if request.method == "OPTIONS":
            return ("", 204)

        nome = (request.form.get("nome") or "").strip()
        email = (request.form.get("email") or "").strip()
        linkedin = (request.form.get("linkedin") or "").strip()
        msg = (request.form.get("msg") or "").strip()
        vaga = (request.form.get("vaga") or "").strip()

        if not nome or not email:
            return jsonify({"ok": False, "error": "nome e email são obrigatórios"}), 400

        rh_to = os.getenv("MAIL_RH_TO", "rh@isindustria.com.br")
        subject = f"Trabalhe Conosco • {vaga}" if vaga else "Trabalhe Conosco • Banco de Talentos"

        safe_msg = (msg or "").replace("\n", "<br/>")
        html = f"""
          <h3>Novo currículo pelo site</h3>
          <p><b>Nome:</b> {nome}</p>
          <p><b>Email:</b> {email}</p>
          <p><b>LinkedIn:</b> {linkedin or "-"}</p>
          <p><b>Vaga:</b> {vaga or "Banco de Talentos"}</p>
          <p><b>Mensagem:</b><br/>{safe_msg or "-"}</p>
        """

        # anexo PDF
        f = request.files.get("file") or request.files.get("arquivo")
        attachments = None
        if f and f.filename:
            _, ext = os.path.splitext(f.filename)
            ext = (ext or "").lower()
            if ext != ".pdf":
                return jsonify({"ok": False, "error": "Apenas PDF é permitido"}), 400

            max_mb = int(os.getenv("MAX_CV_MB", "6"))
            max_bytes = max_mb * 1024 * 1024

            file_bytes = f.read()
            if len(file_bytes) > max_bytes:
                return jsonify({"ok": False, "error": f"PDF muito grande (máx {max_mb}MB)"}), 400

            attachments = [{
                "@odata.type": "#microsoft.graph.fileAttachment",
                "name": f.filename,
                "contentType": "application/pdf",
                "contentBytes": base64.b64encode(file_bytes).decode("utf-8"),
            }]

        try:
            send_mail(
                subject,
                html,
                to_email=rh_to,
                reply_to={"address": email, "name": nome},
                attachments=attachments,
            )
            return jsonify({"ok": True})
        except Exception as e:
            return jsonify({"ok": False, "error": str(e)}), 500

    # ----------------------------
    # UPLOAD (imagens) -> /static/uploads/...
    # ----------------------------
    @app.route("/api/upload", methods=["POST", "OPTIONS"])
    def upload():
        if request.method == "OPTIONS":
            return ("", 204)

        f = request.files.get("file")
        if not f:
            return jsonify(error="missing file"), 400

        _, ext = os.path.splitext(f.filename or "")
        ext = (ext or ".jpg").lower()

        allowed = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
        if ext not in allowed:
            return jsonify(error=f"extensão não permitida ({ext})"), 400

        uploads_dir = os.path.join(app.static_folder, "uploads")
        os.makedirs(uploads_dir, exist_ok=True)

        filename = f"{uuid.uuid4().hex}{ext}"
        dest_path = os.path.join(uploads_dir, filename)
        f.save(dest_path)

        url = url_for("static", filename=f"uploads/{filename}", _external=True)
        return jsonify(url=url)

    # ----------------------------
    # COMPLIANCE (site) -> envia email
    # ----------------------------
    @app.post("/api/compliance")
    def api_compliance():
        data = request.get_json(silent=True) or {}

        subject = (data.get("subject") or "").strip()
        message = (data.get("message") or "").strip()

        # opcional (se você quiser deixar anônimo, nem precisa mandar isso do front)
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip()

        if len(subject) < 6 or len(message) < 20:
            return jsonify({"ok": False, "error": "subject (>=6) e message (>=20) são obrigatórios"}), 400

        protocol = f"CMP-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        html = f"""
          <h3>Novo relato de Compliance</h3>
          <p><b>Protocolo:</b> {protocol}</p>
          <p><b>Assunto:</b> {subject}</p>
          <p><b>Nome:</b> {name or "Anônimo"}</p>
          <p><b>Email:</b> {email or "Anônimo"}</p>
          <hr/>
          <p><b>Mensagem:</b><br/>{message.replace(chr(10), "<br/>")}</p>
        """

        try:
            send_mail(
                subject=f"Compliance • {protocol} • {subject}",
                html_body=html,
                to_email="compliance@sologrupo.com.br",
                reply_to={"address": email, "name": name} if email else None,
            )
            return jsonify({"ok": True, "protocol": protocol})
        except Exception as e:
            return jsonify({"ok": False, "error": str(e)}), 500

    # Blueprints
    app.register_blueprint(bp_public)
    app.register_blueprint(bp_admin)
    app.register_blueprint(users_admin_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(translate_bp)
    app.register_blueprint(careers_bp)

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5001")), debug=True)
