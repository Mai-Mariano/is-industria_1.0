# rh-backend/routes/careers.py
import os, base64, requests
from flask import Blueprint, request, jsonify
from msal import ConfidentialClientApplication
from werkzeug.utils import secure_filename

careers_bp = Blueprint("careers_bp", __name__)

TENANT = os.getenv("MS_TENANT_ID")
CLIENT_ID = os.getenv("MS_CLIENT_ID")
CLIENT_SECRET = os.getenv("MS_CLIENT_SECRET")

FROM_ADDR = os.getenv("MS_FROM_ADDRESS")     # ex.: rh@isindustria.com.br
TO_ADDR   = os.getenv("MS_TO_ADDRESS", FROM_ADDR)

AUTHORITY = f"https://login.microsoftonline.com/{TENANT}"
SCOPE = ["https://graph.microsoft.com/.default"]

MAX_BYTES = 5 * 1024 * 1024  # 5MB (PDF)

def get_token():
    app = ConfidentialClientApplication(
        CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET
    )
    result = app.acquire_token_silent(SCOPE, account=None)
    if not result:
        result = app.acquire_token_for_client(scopes=SCOPE)
    if "access_token" not in result:
        raise RuntimeError(result.get("error_description") or "Auth failed")
    return result["access_token"]

@careers_bp.post("/api/careers/apply")
def careers_apply():
    # multipart/form-data
    form = request.form
    file = request.files.get("arquivo")

    nome = (form.get("nome") or "").strip()
    email = (form.get("email") or "").strip()
    linkedin = (form.get("linkedin") or "").strip()
    msg = (form.get("msg") or "").strip()
    vaga = (form.get("vaga") or "Talentos").strip()

    if not nome or not email:
        return jsonify({"ok": False, "error": "missing_fields"}), 400

    attachment = None
    if file:
        fname = secure_filename(file.filename) or "curriculo.pdf"
        blob = file.read()
        if len(blob) > MAX_BYTES:
            return jsonify({"ok": False, "error": "file_too_large"}), 400
        # aceita só PDF
        if (file.mimetype or "").lower() != "application/pdf" and not fname.lower().endswith(".pdf"):
            return jsonify({"ok": False, "error": "only_pdf"}), 400

        attachment = {
            "@odata.type": "#microsoft.graph.fileAttachment",
            "name": fname,
            "contentType": "application/pdf",
            "contentBytes": base64.b64encode(blob).decode("ascii"),
        }

    subject = f"Candidatura: {vaga} — {nome}"
    body_html = (
        f"<p><b>Nome:</b> {nome}</p>"
        f"<p><b>E-mail:</b> {email}</p>"
        f"<p><b>LinkedIn:</b> {linkedin or '-'}</p>"
        f"<p><b>Vaga:</b> {vaga}</p>"
        f"<p><b>Mensagem:</b><br>{(msg or '-').replace(chr(10), '<br>')}</p>"
    )

    token = get_token()
    payload = {
        "message": {
            "subject": subject,
            "body": {"contentType": "HTML", "content": body_html},
            "toRecipients": [{"emailAddress": {"address": TO_ADDR}}],
            "attachments": [attachment] if attachment else [],
        },
        "saveToSentItems": True,
    }

    # Application Permission: envia como o mailbox especificado
    url = f"https://graph.microsoft.com/v1.0/users/{FROM_ADDR}/sendMail"
    r = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json=payload,
        timeout=20,
    )

    if r.status_code not in (200, 202):
        return jsonify({"ok": False, "error": "graph_send_failed", "detail": r.text}), 502

    return jsonify({"ok": True})
