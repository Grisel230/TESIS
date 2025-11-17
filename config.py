import os
import secrets
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Config:
    # Configuración de la base de datos PostgreSQL
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://postgres:123456@localhost:5432/emociones'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuración de la aplicación
    # IMPORTANTE: En producción, estas claves DEBEN estar en variables de entorno
    # Generar nueva clave con: python -c "import secrets; print(secrets.token_hex(32))"
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        if os.environ.get('FLASK_ENV') == 'production':
            raise ValueError("SECRET_KEY debe estar definida en producción")
        # Solo para desarrollo - generar clave temporal
        SECRET_KEY = secrets.token_hex(32)
        print("⚠️  ADVERTENCIA: Usando SECRET_KEY temporal. Define SECRET_KEY en variables de entorno.")
    
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    if not JWT_SECRET_KEY:
        if os.environ.get('FLASK_ENV') == 'production':
            raise ValueError("JWT_SECRET_KEY debe estar definida en producción")
        # Solo para desarrollo - usar SECRET_KEY como fallback
        JWT_SECRET_KEY = SECRET_KEY
        print("⚠️  ADVERTENCIA: Usando JWT_SECRET_KEY temporal. Define JWT_SECRET_KEY en variables de entorno.")
    
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hora
    
    # Configuración CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 
        'http://localhost:4200,http://127.0.0.1:4200,http://localhost:4201,http://127.0.0.1:4201'
    ).split(',')
    
    # Configuración de archivos
    MODEL_PATH = os.path.join(os.path.dirname(__file__), 'modelFEC.h5')
    FACE_DETECTOR_PATH = os.path.join(os.path.dirname(__file__), 'face_detector')
    
    # Configuración de la aplicación
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    FLASK_DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Configuración de Email (Gmail)
    EMAIL_SENDER = os.environ.get('EMAIL_SENDER')  # Tu email de Gmail
    EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD')  # Contraseña de aplicación de Gmail
    SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
