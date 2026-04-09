from flask import Blueprint, jsonify, abort
from sqlalchemy import select
from datetime import date
from db import get_db
from models import Job, News
from utils import render_md

bp_public = Blueprint("public", __name__)

@bp_public.get("/api/jobs")
def list_jobs():
    db = next(get_db())
    today = date.today()
    rows = db.execute(
        select(Job).where(Job.status == "publicada",
            (Job.dt_expiracao.is_(None)) | (Job.dt_expiracao >= today)
        ).order_by(Job.dt_publicacao.desc(), Job.created_at.desc())

    ).scalars().all()

    return jsonify([
        {
            "id": f"job-{r.id}",
            "title": r.titulo,
            "location": r.localidade,
            "type": r.tipo,
            "model": r.modelo,
            "salary": r.salario,
            "summary": r.resumo,
            "requirements": list(filter(None, (r.requisitos_md or "").splitlines())),
            "benefits": list(filter(None, (r.beneficios_md or "").splitlines())),
            "description": render_md(r.descricao_md),
            "slug": r.slug,
            "date": (r.dt_publicacao or r.created_at).date().isoformat()
        } for r in rows
    ])

@bp_public.get("/api/news")
def list_news():
    db = next(get_db())
    rows = db.execute(
        select(News).where(News.status=="publicada").order_by(News.date.desc(), News.created_at.desc())
    ).scalars().all()

    return jsonify([
        {
            "title": r.title,
            "date": r.date.isoformat(),
            "tag": r.tag,
            "excerpt": r.excerpt,
            "content": render_md(r.content_md),
            "image": r.image,
            "url": r.url,
            "slug": r.slug
        } for r in rows
    ])
