# src/bakend/shared/database.py
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

BaseOLTP = declarative_base()
BaseOLAP = declarative_base()

def init_schemas():
    """Maakt de logische schema's aan in Postgres"""
    with engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS pepol_app;")) # Voor OLTP
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS pepol_dwh;")) # Voor OLAP
        conn.commit()