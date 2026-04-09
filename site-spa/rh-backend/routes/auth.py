import os
import datetime as dt
from functools import wraps

import jwt
from flask import Blueprint, request, jsonify, current_app, make_response, g, abort

from extensions import db
from models import AdminUser

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

COOKIE_NAME = "access_token"
COOKIE_SAMESITE = os.environ.get("COOKIE_SAMESITE", "Lax")
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "false").lower() == "true"
AUTH_EXP_HOURS = int(os.environ.get("AUTH_EXP_HOURS", "12"))


def _make_token(user_id: int, email: str | None = None, hours: int = AUTH_EXP_HOURS) -> str:
    now = dt.datetime.utcnow()
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + dt.timedelta(hours=hours),
    }
    if email:
        payload["email"] = email
    secret = current_app.config["SECRET_KEY"]
    return jwt.encode(payload, secret, algorithm="HS256")


def _decode_token(token: str):
    try:
        return jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def _get_user_from_cookie():
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    data = _decode_token(token)
    if not data:
        return None
    uid = data.get("sub")
    if not uid:
        return None
    return db.session.get(AdminUser, int(uid))


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = _get_user_from_cookie()
        if not user or not user.is_active:
            abort(401)
        g.user = user
        return fn(*args, **kwargs)
    return wrapper


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "missing_credentials"}), 400

    user = AdminUser.query.filter_by(email=email, is_active=True).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "invalid_credentials"}), 401

    token = _make_token(user.id, user.email)

    resp = make_response(jsonify({
        "authenticated": True,
        "user": user.to_dict(),
    }))
    resp.set_cookie(
        COOKIE_NAME,
        token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=60 * 60 * AUTH_EXP_HOURS,
        path="/",
    )
    return resp


@auth_bp.post("/logout")
def logout():
    resp = make_response(jsonify({"ok": True}))
    resp.delete_cookie(COOKIE_NAME, path="/")
    return resp


@auth_bp.get("/me")
def me():
    user = _get_user_from_cookie()
    if not user or not user.is_active:
        return jsonify({"authenticated": False}), 200
    return jsonify({"authenticated": True, "user": user.to_dict()}), 200
