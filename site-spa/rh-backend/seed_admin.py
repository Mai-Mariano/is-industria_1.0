# rh-backend/seed_admin.py
from app import app
from extensions import db
from models import AdminUser

def create_or_update_admin(email: str, password: str):
    with app.app_context():
        db.create_all()  # garante que a tabela exista
        u = AdminUser.query.filter_by(email=email).first()
        if u:
            u.set_password(password)
            u.is_active = True
            action = "Senha atualizada"
        else:
            u = AdminUser(email=email, is_active=True)
            u.set_password(password)
            db.session.add(u)
            action = "Usuário criado"
        db.session.commit()
        print(f"{action}: id={u.id} email={u.email}")

if __name__ == "__main__":
    # TROQUE AQUI se quiser outro e-mail/senha
    create_or_update_admin("admin@isindustria.com.br", "admin123")
