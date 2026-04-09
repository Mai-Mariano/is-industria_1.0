# rh-backend/extensions.py
from flask_sqlalchemy import SQLAlchemy

# ÚNICA instância global do SQLAlchemy para o projeto
db = SQLAlchemy()
