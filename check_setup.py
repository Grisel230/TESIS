#!/usr/bin/env python3
"""
Script para verificar que el proyecto está configurado correctamente
"""
import os
import sys
import subprocess
import importlib

def check_file_exists(filepath, description):
    """Verifica si un archivo existe"""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ {description}: {filepath} - NO ENCONTRADO")
        return False

def check_python_package(package_name, import_name=None):
    """Verifica si un paquete de Python está instalado"""
    if import_name is None:
        import_name = package_name
    
    try:
        importlib.import_module(import_name)
        print(f"✅ Paquete Python: {package_name}")
        return True
    except ImportError:
        print(f"❌ Paquete Python: {package_name} - NO INSTALADO")
        return False

def check_node_packages():
    """Verifica paquetes de Node.js"""
    if not os.path.exists("emotion-detector/package.json"):
        print("❌ No se encontró package.json de Angular")
        return False
    
    try:
        result = subprocess.run(["npm", "list", "--depth=0"], 
                              cwd="emotion-detector", 
                              capture_output=True, text=True, check=True)
        print("✅ Dependencias de Angular instaladas")
        return True
    except subprocess.CalledProcessError:
        print("❌ Dependencias de Angular no instaladas correctamente")
        return False

def main():
    print("🔍 Verificando configuración del proyecto...\n")
    
    all_good = True
    
    # Verificar archivos críticos
    print("📁 Verificando archivos críticos:")
    files_to_check = [
        ("requirements.txt", "Archivo de dependencias Python"),
        ("app.py", "Aplicación principal Flask"),
        ("models.py", "Modelos de base de datos"),
        ("config.py", "Configuración"),
        ("auth_utils.py", "Utilidades de autenticación"),
        ("emotion-detector/package.json", "Configuración Angular"),
        ("emotion-detector/angular.json", "Configuración de build Angular")
    ]
    
    for filepath, description in files_to_check:
        if not check_file_exists(filepath, description):
            all_good = False
    
    # Verificar archivos opcionales pero importantes
    print("\n📁 Verificando archivos opcionales:")
    optional_files = [
        ("modelFEC.h5", "Modelo de emociones"),
        ("face_detector/deploy.prototxt", "Modelo de detección de rostros"),
        ("face_detector/res10_300x300_ssd_iter_140000.caffemodel", "Pesos del modelo"),
        (".env", "Variables de entorno")
    ]
    
    for filepath, description in optional_files:
        check_file_exists(filepath, description)
    
    # Verificar paquetes de Python
    print("\n🐍 Verificando paquetes de Python:")
    python_packages = [
        ("flask", "Flask"),
        ("flask_cors", "Flask-CORS"),
        ("flask_sqlalchemy", "Flask-SQLAlchemy"),
        ("psycopg2", "psycopg2-binary"),
        ("tensorflow", "TensorFlow"),
        ("cv2", "opencv-python"),
        ("numpy", "NumPy"),
        ("PIL", "Pillow"),
        ("jwt", "PyJWT"),
        ("dotenv", "python-dotenv")
    ]
    
    for package, display_name in python_packages:
        if not check_python_package(package, display_name):
            all_good = False
    
    # Verificar paquetes de Node.js
    print("\n📦 Verificando paquetes de Angular:")
    if not check_node_packages():
        all_good = False
    
    # Resumen
    print("\n" + "="*50)
    if all_good:
        print("🎉 ¡Proyecto configurado correctamente!")
        print("\n📋 Para ejecutar el proyecto:")
        print("1. Backend: python app.py")
        print("2. Frontend: cd emotion-detector && npm start")
    else:
        print("⚠️  Se encontraron problemas en la configuración")
        print("\n🔧 Para solucionarlos:")
        print("1. Ejecuta: python install_dependencies.py")
        print("2. Verifica que PostgreSQL esté ejecutándose")
        print("3. Configura las variables de entorno")
    
    return all_good

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
