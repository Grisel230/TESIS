#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para inicializar la base de datos
"""
import sys
from app import app, db
from models import Psicologo, Paciente, Sesion, EmocionDetectada

def init_database():
    with app.app_context():
        print("Creando tablas de la base de datos...")
        db.create_all()
        print("[OK] Tablas creadas exitosamente")
        
        # Verificar si ya existe un psicologo de prueba
        test_psicologo = Psicologo.query.filter_by(email='test@example.com').first()
        if not test_psicologo:
            print("\nCreando psicologo de prueba...")
            psicologo = Psicologo(
                nombre_completo='Dr. Juan Perez',
                cedula_profesional='12345678',
                especializacion='Psicologia Clinica',
                telefono='6641234567',
                email='test@example.com',
                nombre_usuario='testpsico'
            )
            psicologo.set_password('test123')
            db.session.add(psicologo)
            db.session.commit()
            print("[OK] Psicologo de prueba creado:")
            print("   Email: test@example.com")
            print("   Usuario: testpsico")
            print("   Password: test123")
        else:
            print("[INFO] Psicologo de prueba ya existe")

if __name__ == '__main__':
    try:
        init_database()
        print("\n[OK] Base de datos inicializada correctamente")
    except Exception as e:
        print(f"\n[ERROR] Error al inicializar la base de datos: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
