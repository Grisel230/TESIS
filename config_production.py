"""
Configuración de producción para la aplicación Flask
Incluye configuraciones de seguridad, rendimiento y monitoreo
"""

import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import timedelta

class ProductionConfig:
    """Configuración para entorno de producción"""
    
    # Configuración básica
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-jwt-secret-change-in-production'
    
    # Base de datos
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        f"postgresql://{os.environ.get('DB_USER', 'emotion_app')}:{os.environ.get('DB_PASSWORD', '')}@{os.environ.get('DB_HOST', 'localhost')}:{os.environ.get('DB_PORT', '5432')}/{os.environ.get('DB_NAME', 'emotion_detection_prod')}"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 20,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'max_overflow': 30
    }
    
    # JWT
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']
    
    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:4200').split(',')
    CORS_ALLOW_CREDENTIALS = True
    CORS_ALLOW_HEADERS = ['Content-Type', 'Authorization', 'X-Requested-With']
    CORS_ALLOW_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    CORS_MAX_AGE = 3600
    
    # Configuración de archivos
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_FILE_SIZE', 10 * 1024 * 1024))  # 10MB
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
    ALLOWED_EXTENSIONS = set(os.environ.get('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif').split(','))
    
    # Configuración de modelos
    MODEL_PATH = os.environ.get('MODEL_PATH', './modelFEC.h5')
    FACE_DETECTOR_PROTOTXT = os.environ.get('FACE_DETECTOR_PROTOTXT', './face_detector/deploy.prototxt')
    FACE_DETECTOR_MODEL = os.environ.get('FACE_DETECTOR_MODEL', './face_detector/res10_300x300_ssd_iter_140000.caffemodel')
    
    # Configuración de caché
    CACHE_TYPE = os.environ.get('CACHE_TYPE', 'simple')
    CACHE_DEFAULT_TIMEOUT = int(os.environ.get('CACHE_DEFAULT_TIMEOUT', 300))
    
    # Configuración de Redis
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    
    # Configuración de logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'logs/app.log')
    LOG_MAX_SIZE = int(os.environ.get('LOG_MAX_SIZE', 10 * 1024 * 1024))  # 10MB
    LOG_BACKUP_COUNT = int(os.environ.get('LOG_BACKUP_COUNT', 5))
    
    # Configuración de seguridad
    MAX_LOGIN_ATTEMPTS = int(os.environ.get('MAX_LOGIN_ATTEMPTS', 5))
    LOGIN_LOCKOUT_TIME = int(os.environ.get('LOGIN_LOCKOUT_TIME', 900))  # 15 minutos
    SESSION_TIMEOUT = int(os.environ.get('SESSION_TIMEOUT', 3600))  # 1 hora
    
    # Configuración de rate limiting
    RATE_LIMIT_ENABLED = os.environ.get('RATE_LIMIT_ENABLED', 'True').lower() == 'true'
    RATE_LIMIT_REQUESTS = int(os.environ.get('RATE_LIMIT_REQUESTS', 100))
    RATE_LIMIT_WINDOW = int(os.environ.get('RATE_LIMIT_WINDOW', 3600))
    
    # Configuración de compresión
    COMPRESSION_ENABLED = os.environ.get('COMPRESSION_ENABLED', 'True').lower() == 'true'
    COMPRESSION_LEVEL = int(os.environ.get('COMPRESSION_LEVEL', 6))
    
    # Configuración de monitoreo
    MONITORING_ENABLED = os.environ.get('MONITORING_ENABLED', 'True').lower() == 'true'
    PROMETHEUS_PORT = int(os.environ.get('PROMETHEUS_PORT', 9090))
    
    # Configuración de health check
    HEALTH_CHECK_ENABLED = os.environ.get('HEALTH_CHECK_ENABLED', 'True').lower() == 'true'
    HEALTH_CHECK_INTERVAL = int(os.environ.get('HEALTH_CHECK_INTERVAL', 30))
    
    # Configuración de SSL
    SSL_CERT_PATH = os.environ.get('SSL_CERT_PATH')
    SSL_KEY_PATH = os.environ.get('SSL_KEY_PATH')
    
    # Configuración de backup
    BACKUP_ENABLED = os.environ.get('BACKUP_ENABLED', 'True').lower() == 'true'
    BACKUP_SCHEDULE = os.environ.get('BACKUP_SCHEDULE', '0 2 * * *')
    BACKUP_RETENTION_DAYS = int(os.environ.get('BACKUP_RETENTION_DAYS', 30))
    
    @staticmethod
    def init_app(app):
        """Inicializar configuración específica de la aplicación"""
        
        # Configurar logging
        if not app.debug and not app.testing:
            if not os.path.exists('logs'):
                os.mkdir('logs')
            
            file_handler = RotatingFileHandler(
                ProductionConfig.LOG_FILE,
                maxBytes=ProductionConfig.LOG_MAX_SIZE,
                backupCount=ProductionConfig.LOG_BACKUP_COUNT
            )
            file_handler.setFormatter(logging.Formatter(
                '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
            ))
            file_handler.setLevel(getattr(logging, ProductionConfig.LOG_LEVEL))
            app.logger.addHandler(file_handler)
            app.logger.setLevel(getattr(logging, ProductionConfig.LOG_LEVEL))
            app.logger.info('Aplicación iniciada en modo producción')

class DevelopmentConfig:
    """Configuración para entorno de desarrollo"""
    
    SECRET_KEY = 'dev-secret-key'
    JWT_SECRET_KEY = 'dev-jwt-secret'
    
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///emotion_detection.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    CORS_ORIGINS = ['http://localhost:4200', 'http://127.0.0.1:4200']
    CORS_ALLOW_CREDENTIALS = True
    
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif'}
    
    MODEL_PATH = './modelFEC.h5'
    FACE_DETECTOR_PROTOTXT = './face_detector/deploy.prototxt'
    FACE_DETECTOR_MODEL = './face_detector/res10_300x300_ssd_iter_140000.caffemodel'
    
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 300
    
    LOG_LEVEL = 'DEBUG'
    LOG_FILE = 'logs/app.log'
    
    MAX_LOGIN_ATTEMPTS = 10
    LOGIN_LOCKOUT_TIME = 300
    SESSION_TIMEOUT = 7200
    
    RATE_LIMIT_ENABLED = False
    COMPRESSION_ENABLED = False
    MONITORING_ENABLED = False
    HEALTH_CHECK_ENABLED = False
    BACKUP_ENABLED = False

class TestingConfig:
    """Configuración para entorno de testing"""
    
    SECRET_KEY = 'test-secret-key'
    JWT_SECRET_KEY = 'test-jwt-secret'
    
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(hours=1)
    
    CORS_ORIGINS = ['http://localhost:4200']
    CORS_ALLOW_CREDENTIALS = True
    
    MAX_CONTENT_LENGTH = 1024 * 1024  # 1MB
    UPLOAD_FOLDER = 'test_uploads'
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif'}
    
    MODEL_PATH = './test_model.h5'
    FACE_DETECTOR_PROTOTXT = './face_detector/deploy.prototxt'
    FACE_DETECTOR_MODEL = './face_detector/res10_300x300_ssd_iter_140000.caffemodel'
    
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 60
    
    LOG_LEVEL = 'WARNING'
    LOG_FILE = 'logs/test.log'
    
    MAX_LOGIN_ATTEMPTS = 3
    LOGIN_LOCKOUT_TIME = 60
    SESSION_TIMEOUT = 300
    
    RATE_LIMIT_ENABLED = False
    COMPRESSION_ENABLED = False
    MONITORING_ENABLED = False
    HEALTH_CHECK_ENABLED = False
    BACKUP_ENABLED = False

# Configuración por defecto
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
