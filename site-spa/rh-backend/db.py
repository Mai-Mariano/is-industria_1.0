import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, scoped_session

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_SQLITE_PATH = (BASE_DIR / "instance" / "dev.db").as_posix()

DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "1234")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "is-industria")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    if all(os.getenv(key) for key in ("DB_HOST", "DB_USER", "DB_NAME")):
        DATABASE_URL = (
            f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
        )
    else:
        DATABASE_URL = f"sqlite:///{DEFAULT_SQLITE_PATH}"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=not DATABASE_URL.startswith("sqlite"),
)
SessionLocal = scoped_session(sessionmaker(bind=engine, autoflush=False, autocommit=False))

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
