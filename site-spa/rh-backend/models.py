# rh-backend/models.py
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db  # <<< única origem do SQLAlchemy na app


# =========================
# Modelos de domínio
# =========================

class Job(db.Model):
    __tablename__ = "jobs"
    __table_args__ = (
        db.Index("idx_jobs_status", "status"),
        db.Index("idx_jobs_pub", "dt_publicacao"),
        db.Index("idx_jobs_exp", "dt_expiracao"),
    )

    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(
        db.Enum("rascunho", "publicada", "pausada", name="job_status"),
        nullable=False,
        default="rascunho",
    )
    titulo = db.Column(db.String(160), nullable=False)
    slug = db.Column(db.String(180), nullable=False, unique=True, index=True)
    localidade = db.Column(db.String(160), nullable=False)
    tipo = db.Column(db.String(60), nullable=False)          # CLT / Estágio / PJ
    modelo = db.Column(db.String(60), nullable=False)        # Presencial / Híbrido / Remoto
    salario = db.Column(db.String(120))
    resumo = db.Column(db.String(240))
    descricao_md = db.Column(db.Text, nullable=False)
    requisitos_md = db.Column(db.Text)
    beneficios_md = db.Column(db.Text)
    dt_publicacao = db.Column(db.Date)                       # quando for publicada
    dt_expiracao = db.Column(db.Date)                        # opcional

    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    updated_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.now(), onupdate=db.func.now()
    )

    def to_dict(self):
        return {
            "id": self.id,
            "status": self.status,
            "titulo": self.titulo,
            "slug": self.slug,
            "localidade": self.localidade,
            "tipo": self.tipo,
            "modelo": self.modelo,
            "salario": self.salario,
            "resumo": self.resumo,
            "descricao_md": self.descricao_md,
            "requisitos_md": self.requisitos_md,
            "beneficios_md": self.beneficios_md,
            "dt_publicacao": self.dt_publicacao.isoformat() if self.dt_publicacao else None,
            "dt_expiracao": self.dt_expiracao.isoformat() if self.dt_expiracao else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class News(db.Model):
    __tablename__ = "news"
    __table_args__ = (
        db.Index("idx_news_status", "status"),
        db.Index("idx_news_date", "date"),
    )

    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(
        db.Enum("rascunho", "publicada", "pausada", name="news_status"),
        nullable=False,
        default="rascunho",
    )
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), nullable=False, unique=True, index=True)
    date = db.Column(db.Date, nullable=False)                # data do fato/matéria
    tag = db.Column(db.String(100))
    excerpt = db.Column(db.String(600))
    content_md = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(500))
    url = db.Column(db.String(500))

    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    updated_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.now(), onupdate=db.func.now()
    )

    def to_dict(self):
        return {
            "id": self.id,
            "status": self.status,
            "title": self.title,
            "slug": self.slug,
            "date": self.date.isoformat() if self.date else None,
            "tag": self.tag,
            "excerpt": self.excerpt,
            "content_md": self.content_md,
            "image": self.image,
            "url": self.url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class AdminUser(db.Model):
    __tablename__ = "admin_users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    # helpers de senha
    def set_password(self, raw: str) -> None:
        self.password_hash = generate_password_hash(raw)

    def check_password(self, raw: str) -> bool:
        return check_password_hash(self.password_hash, raw)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
