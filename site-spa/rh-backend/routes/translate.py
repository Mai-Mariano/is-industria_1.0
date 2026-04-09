# rh-backend/routes/translate.py
from flask import Blueprint, request, jsonify
import os, requests

translate_bp = Blueprint("translate_bp", __name__)

LIBRE_URL = os.getenv("LIBRE_URL", "https://libretranslate.com/translate")

@translate_bp.post("/api/translate")
def translate():
    data = request.get_json(silent=True) or {}
    texts  = data.get("texts", [])
    source = (data.get("source") or "auto")[:5]
    target = (data.get("target") or "pt")[:5]

    out = []
    for txt in texts:
        if not txt:
            out.append(txt)
            continue
        try:
            r = requests.post(
                LIBRE_URL,
                json={"q": txt, "source": source, "target": target, "format": "html"},
                timeout=10,
            )
            r.raise_for_status()
            out.append(r.json().get("translatedText", txt))
        except Exception:
            out.append(txt)  # fallback silencioso

    return jsonify({"translations": out})
