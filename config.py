import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Config:
    # Configuración de la base de datos PostgreSQL
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://postgres:123456@localhost:5432/emociones'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuración de la aplicación
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'tu-clave-secreta-aqui'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'tu-jwt-secret-key-aqui'
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
