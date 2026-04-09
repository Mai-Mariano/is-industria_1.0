# rh-backend/routes/admin_users.py
from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError

from routes.auth import require_auth  # decorador
from extensions import db
from models import AdminUser

users_admin_bp = Blueprint("users_admin", __name__, url_prefix="/api/admin/users")


@users_admin_bp.get("")
@require_auth
def list_users():
    rows = AdminUser.query.order_by(AdminUser.created_at.desc()).all()
    return jsonify([u.to_dict() for u in rows])


@users_admin_bp.post("")
@require_auth
def create_user():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    is_active = bool(data.get("is_active", True))

    if not email or not password:
        return jsonify({"error": "email_and_password_required"}), 400
    if "@" not in email:
        return jsonify({"error": "invalid_email"}), 400
    if len(password) < 6:
        return jsonify({"error": "weak_password"}), 400

    u = AdminUser(email=email, is_active=is_active)
    u.set_password(password)
    db.session.add(u)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "email_already_exists"}), 409

    return jsonify(u.to_dict()), 201


@users_admin_bp.post("/<int:user_id>/reset-password")
@require_auth
def reset_password(user_id):
    data = request.get_json(silent=True) or {}
    new_password = data.get("password") or ""
    if len(new_password) < 6:
        return jsonify({"error": "weak_password"}), 400

    u = db.session.get(AdminUser, user_id)
    if not u:
        return jsonify({"error": "not_found"}), 404

    u.set_password(new_password)
    db.session.commit()
    return jsonify({"ok": True})


@users_admin_bp.post("/<int:user_id>/toggle-active")
@require_auth
def toggle_active(user_id):
    u = db.session.get(AdminUser, user_id)
    if not u:
        return jsonify({"error": "not_found"}), 404
    u.is_active = not u.is_active
    db.session.commit()
    return jsonify({"id": u.id, "is_active": u.is_active})


@users_admin_bp.delete("/<int:user_id>")
@require_auth
def delete_user(user_id):
    u = db.session.get(AdminUser, user_id)
    if not u:
        return jsonify({"error": "not_found"}), 404

    # Evitar que o último usuário ativo seja apagado
    active_count = AdminUser.query.filter_by(is_active=True).count()
    if u.is_active and active_count <= 1:
        return jsonify({"error": "cant_delete_last_active_admin"}), 400

    db.session.delete(u)
    db.session.commit()
    return ("", 204)
