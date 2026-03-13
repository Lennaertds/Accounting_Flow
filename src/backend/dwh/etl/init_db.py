# src/backend/dwh/etl/init_db.py
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.backend.shared.database import engine, init_schemas, BaseOLTP, BaseOLAP
from src.backend.core import models as oltp_models
from src.backend.dwh import models as olap_models

def run_init():
    print("🚀 Initialiseren van de database...")
    init_schemas()
    
    print("📦 Aanmaken van OLTP tabellen (De Pilaren)...")
    BaseOLTP.metadata.create_all(bind=engine)
    
    print("📊 Aanmaken van OLAP tabellen (Het Sterschema)...")
    BaseOLAP.metadata.create_all(bind=engine)
    
    print("✅ Database is succesvol opgezet!")

if __name__ == "__main__":
    run_init()