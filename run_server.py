"""
Script para iniciar el servidor Flask de manera más estable
"""
import sys
import os

# Configurar TensorFlow antes de cualquier importación
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

print("=" * 60)
print("🚀 Iniciando Servidor de Detección de Emociones")
print("=" * 60)
print("\nCargando módulos de Python... Por favor espera...")

# Importar app después de configurar las variables de entorno
from app import app, db

if __name__ == '__main__':
    print("\n✅ Módulos cargados correctamente")
    print("📊 Inicializando base de datos...")
    
    with app.app_context():
        db.create_all()
        print("✅ Base de datos inicializada")
    
    print("\n" + "=" * 60)
    print("🌐 Servidor corriendo en: http://localhost:5000")
    print("🌐 También disponible en: http://127.0.0.1:5000")
    print("=" * 60)
    print("\n💡 Presiona CTRL+C para detener el servidor\n")
    
    app.run(debug=False, host='0.0.0.0', port=5000, use_reloader=False, threaded=True)
