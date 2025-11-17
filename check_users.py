"""Script para verificar usuarios en la base de datos"""
from app import app, db
from models import Psicologo

with app.app_context():
    psicologos = Psicologo.query.all()
    
    print("\n=== USUARIOS REGISTRADOS ===")
    for p in psicologos:
        print(f"ID: {p.id}")
        print(f"Nombre: {p.nombre_completo}")
        print(f"Email: {p.email}")
        print(f"---")
