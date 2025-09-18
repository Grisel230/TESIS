#!/usr/bin/env python3
"""
Script para instalar todas las dependencias del proyecto
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Ejecuta un comando y maneja errores"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completado")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en {description}: {e}")
        print(f"Output: {e.stdout}")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Instalando dependencias del proyecto...")
    
    # Verificar que estamos en el directorio correcto
    if not os.path.exists("requirements.txt"):
        print("❌ No se encontró requirements.txt. Ejecuta desde el directorio raíz del proyecto.")
        sys.exit(1)
    
    # Instalar dependencias de Python
    if not run_command("pip install -r requirements.txt", "Instalando dependencias de Python"):
        print("❌ Falló la instalación de dependencias de Python")
        sys.exit(1)
    
    # Instalar dependencias de Angular
    if os.path.exists("emotion-detector"):
        os.chdir("emotion-detector")
        if not run_command("npm install", "Instalando dependencias de Angular"):
            print("❌ Falló la instalación de dependencias de Angular")
            sys.exit(1)
        os.chdir("..")
    
    print("\n✅ ¡Todas las dependencias instaladas correctamente!")
    print("\n📋 Próximos pasos:")
    print("1. Configura las variables de entorno copiando env.example a .env")
    print("2. Configura tu base de datos PostgreSQL")
    print("3. Ejecuta: python app.py")
    print("4. En otra terminal: cd emotion-detector && npm start")

if __name__ == "__main__":
    main()
