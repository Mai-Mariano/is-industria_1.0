from __future__ import annotations

from datetime import datetime, date
from typing import Optional

from flask import Blueprint, request, jsonify
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from db import get_db
from models import Job, News
from routes.auth import require_auth
from utils import slugify


bp_admin = Blueprint("admin", __name__, url_prefix="/api/admin")


# -----------------------
# Helpers
# -----------------------
def parse_date(v) -> Optional[date]:
    if not v:
        return None
    if isinstance(v, date) and not isinstance(v, datetime):
        return v
    if isinstance(v, datetime):
        return v.date()
    if isinstance(v, str):
        try:
            return datetime.strptime(v, "%Y-%m-%d").date()
        except ValueError:
            return None
    return None


def unique_slug(session, Model, base_slug: str, current_id: Optional[int] = None) -> str:
    base = (base_slug or "").strip()
    base = slugify(base) if base else "item"

    slug = base
    i = 2
    while True:
        q = select(Model.id).where(Model.slug == slug)
        if current_id is not None:
            q = q.where(Model.id != current_id)

        exists = session.execute(q).first()
        if not exists:
            return slug

        slug = f"{base}-{i}"
        i += 1


def json_error(message: str, status: int = 400):
    return jsonify({"ok": False, "error": message}), status


@bp_admin.get("/jobs")
@require_auth
def admin_list_jobs():
    session = next(get_db())
    rows = session.execute(select(Job).order_by(Job.created_at.desc())).scalars().all()
    return jsonify([r.to_dict() for r in rows])


@bp_admin.post("/jobs")
@require_auth
def admin_create_job():
    session = next(get_db())
    data = request.get_json(silent=True) or {}

    titulo = (data.get("titulo") or "").strip()
    if not titulo:
        return json_error("titulo obrigatorio", 400)

    localidade = (data.get("localidade") or "").strip()
    if not localidade:
        return json_error("localidade obrigatoria", 400)

    descricao_md = (data.get("descricao_md") or "").strip()
    if not descricao_md:
        return json_error("descricao_md obrigatoria", 400)

    base_slug = (data.get("slug") or "").strip() or slugify(titulo)
    slug = unique_slug(session, Job, base_slug)

    job = Job(
        status=(data.get("status") or "rascunho"),
        titulo=titulo,
        slug=slug,
        localidade=localidade,
        tipo=(data.get("tipo") or "CLT"),
        modelo=(data.get("modelo") or "Presencial"),
        salario=(data.get("salario") or None),
        resumo=(data.get("resumo") or None),
        descricao_md=descricao_md,
        requisitos_md=(data.get("requisitos_md") or None),
        beneficios_md=(data.get("beneficios_md") or None),
        dt_expiracao=parse_date(data.get("dt_expiracao")),
        dt_publicacao=None,
    )

    try:
        session.add(job)
        session.commit()
    except IntegrityError:
        session.rollback()
        return json_error("slug ja existe", 409)

    return jsonify({"ok": True, "id": job.id, "slug": job.slug})


@bp_admin.put("/jobs/<int:job_id>")
@require_auth
def admin_update_job(job_id: int):
    session = next(get_db())
    job = session.get(Job, job_id)
    if not job:
        return json_error("vaga nao encontrada", 404)

    data = request.get_json(silent=True) or {}

    if "titulo" in data:
        titulo = (data.get("titulo") or "").strip()
        if not titulo:
            return json_error("titulo nao pode ser vazio", 400)
        job.titulo = titulo

    if "localidade" in data:
        localidade = (data.get("localidade") or "").strip()
        if not localidade:
            return json_error("localidade nao pode ser vazia", 400)
        job.localidade = localidade

    if "descricao_md" in data:
        desc = (data.get("descricao_md") or "").strip()
        if not desc:
            return json_error("descricao_md nao pode ser vazia", 400)
        job.descricao_md = desc

    for k in ["status", "tipo", "modelo"]:
        if k in data and data[k] is not None:
            job.__setattr__(k, data[k])

    for k in ["salario", "resumo", "requisitos_md", "beneficios_md"]:
        if k in data:
            v = data.get(k)
            job.__setattr__(k, (v.strip() if isinstance(v, str) and v.strip() else None) if v != "" else None)

    if "dt_expiracao" in data:
        job.dt_expiracao = parse_date(data.get("dt_expiracao"))

    if "slug" in data:
        raw = (data.get("slug") or "").strip()
        base = raw or slugify(job.titulo)
        job.slug = unique_slug(session, Job, base, current_id=job.id)

    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        return json_error("slug ja existe", 409)

    return jsonify({"ok": True, "id": job.id, "slug": job.slug})


@bp_admin.post("/jobs/<int:job_id>/publish")
@require_auth
def admin_publish_job(job_id: int):
    session = next(get_db())
    job = session.get(Job, job_id)
    if not job:
        return json_error("vaga nao encontrada", 404)

    act = (request.args.get("action") or "publish").lower()

    if act == "publish":
        job.status = "publicada"
        job.dt_publicacao = datetime.utcnow().date()
    elif act == "pause":
        job.status = "pausada"
    else:
        return json_error("action invalida (publish|pause)", 400)

    session.commit()
    return jsonify({"ok": True, "status": job.status})


@bp_admin.delete("/jobs/<int:job_id>")
@require_auth
def admin_delete_job(job_id: int):
    session = next(get_db())
    job = session.get(Job, job_id)
    if not job:
        return json_error("vaga nao encontrada", 404)

    session.delete(job)
    session.commit()
    return jsonify({"ok": True})


@bp_admin.get("/news")
@require_auth
def admin_list_news():
    session = next(get_db())
    rows = session.execute(select(News).order_by(News.created_at.desc())).scalars().all()
    return jsonify([r.to_dict() for r in rows])


@bp_admin.post("/news")
@require_auth
def admin_create_news():
    session = next(get_db())
    data = request.get_json(silent=True) or {}

    title = (data.get("title") or "").strip()
    if not title:
        return json_error("title obrigatorio", 400)

    dt = parse_date(data.get("date"))
    if not dt:
        return json_error("date invalida (use YYYY-MM-DD)", 400)

    content_md = (data.get("content_md") or "").strip()
    if not content_md:
        return json_error("content_md obrigatorio", 400)

    base_slug = (data.get("slug") or "").strip() or slugify(title)
    slug = unique_slug(session, News, base_slug)

    news = News(
        status=(data.get("status") or "rascunho"),
        title=title,
        slug=slug,
        date=dt,
        tag=(data.get("tag") or None),
        excerpt=(data.get("excerpt") or None),
        content_md=content_md,
        image=(data.get("image") or None),
        url=(data.get("url") or None),
    )

    try:
        session.add(news)
        session.commit()
    except IntegrityError:
        session.rollback()
        return json_error("slug ja existe", 409)

    return jsonify({"ok": True, "id": news.id, "slug": news.slug})


@bp_admin.put("/news/<int:news_id>")
@require_auth
def admin_update_news(news_id: int):
    session = next(get_db())
    n = session.get(News, news_id)
    if not n:
        return json_error("noticia nao encontrada", 404)

    data = request.get_json(silent=True) or {}

    if "title" in data:
        title = (data.get("title") or "").strip()
        if not title:
            return json_error("title nao pode ser vazio", 400)
        n.title = title

    if "date" in data:
        dt = parse_date(data.get("date"))
        if not dt:
            return json_error("date invalida (use YYYY-MM-DD)", 400)
        n.date = dt

    if "content_md" in data:
        content = (data.get("content_md") or "").strip()
        if not content:
            return json_error("content_md nao pode ser vazio", 400)
        n.content_md = content

    for k in ["tag", "excerpt", "image", "url", "status"]:
        if k in data:
            v = data.get(k)
            if isinstance(v, str):
                v = v.strip()
            n.__setattr__(k, v if v not in ("", None) else None)

    if "slug" in data:
        raw = (data.get("slug") or "").strip()
        base = raw or slugify(n.title)
        n.slug = unique_slug(session, News, base, current_id=n.id)

    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        return json_error("slug ja existe", 409)

    return jsonify({"ok": True, "id": n.id, "slug": n.slug})


@bp_admin.post("/news/<int:news_id>/publish")
@require_auth
def admin_publish_news(news_id: int):
    session = next(get_db())
    n = session.get(News, news_id)
    if not n:
        return json_error("noticia nao encontrada", 404)

    act = (request.args.get("action") or "publish").lower()

    if act == "publish":
        n.status = "publicada"
    elif act == "pause":
        n.status = "pausada"
    else:
        return json_error("action invalida (publish|pause)", 400)

    session.commit()
    return jsonify({"ok": True, "status": n.status})


@bp_admin.delete("/news/<int:news_id>")
@require_auth
def admin_delete_news(news_id: int):
    session = next(get_db())
    n = session.get(News, news_id)
    if not n:
        return json_error("noticia nao encontrada", 404)

    session.delete(n)
    session.commit()
    return jsonify({"ok": True})
