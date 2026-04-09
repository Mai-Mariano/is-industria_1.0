import os
import requests

GRAPH_SCOPE = "https://graph.microsoft.com/.default"

def get_graph_token():
    tenant = os.getenv("AZURE_TENANT_ID")
    client_id = os.getenv("AZURE_CLIENT_ID")
    client_secret = os.getenv("AZURE_CLIENT_SECRET")

    if not tenant or not client_id or not client_secret:
        raise RuntimeError("Faltam variáveis AZURE_TENANT_ID / AZURE_CLIENT_ID / AZURE_CLIENT_SECRET no .env")

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


def send_mail(subject: str, html_body: str, to_email: str | None = None):
    sender = os.getenv("MAIL_SENDER")
    default_to = os.getenv("MAIL_TO")
    to_email = to_email or default_to

    if not sender or not to_email:
        raise RuntimeError("Faltam variáveis MAIL_SENDER e/ou MAIL_TO no .env")

    token = get_graph_token()

    url = f"https://graph.microsoft.com/v1.0/users/{sender}/sendMail"
    payload = {
        "message": {
            "subject": subject,
            "body": {"contentType": "HTML", "content": html_body},
            "toRecipients": [{"emailAddress": {"address": to_email}}],
        },
        "saveToSentItems": True,
    }

    r = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json=payload,
        timeout=30,
    )

    if r.status_code not in (202, 200):
        raise RuntimeError(f"Erro sendMail ({r.status_code}): {r.text}")