"""
Sistema de manejo de errores robusto para producción
Incluye logging, monitoreo y recuperación automática
"""

import logging
import traceback
import functools
import time
from datetime import datetime
from flask import Flask, request, jsonify, current_app
from werkzeug.exceptions import HTTPException
import psycopg2
from sqlalchemy.exc import SQLAlchemyError
import redis
from redis.exceptions import RedisError

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/error.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class ErrorHandler:
    """Manejador centralizado de errores"""
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Inicializar el manejador de errores"""
        app.register_error_handler(Exception, self.handle_exception)
        app.register_error_handler(HTTPException, self.handle_http_exception)
        app.register_error_handler(500, self.handle_internal_error)
        app.register_error_handler(404, self.handle_not_found)
        app.register_error_handler(400, self.handle_bad_request)
        app.register_error_handler(401, self.handle_unauthorized)
        app.register_error_handler(403, self.handle_forbidden)
        
        # Middleware para logging de requests
        app.before_request(self.log_request)
        app.after_request(self.log_response)
    
    def log_request(self):
        """Log de requests entrantes"""
        current_app.logger.info(
            f"Request: {request.method} {request.url} - "
            f"IP: {request.remote_addr} - "
            f"User-Agent: {request.headers.get('User-Agent', 'Unknown')}"
        )
    
    def log_response(self, response):
        """Log de responses salientes"""
        current_app.logger.info(
            f"Response: {response.status_code} - "
            f"Size: {response.content_length or 0} bytes"
        )
        return response
    
    def handle_exception(self, error):
        """Manejar excepciones generales"""
        error_id = self._generate_error_id()
        
        # Log del error
        logger.error(
            f"Error ID: {error_id} - "
            f"Type: {type(error).__name__} - "
            f"Message: {str(error)} - "
            f"Traceback: {traceback.format_exc()}"
        )
        
        # Determinar tipo de error y respuesta apropiada
        if isinstance(error, psycopg2.Error):
            return self._handle_database_error(error, error_id)
        elif isinstance(error, RedisError):
            return self._handle_cache_error(error, error_id)
        elif isinstance(error, SQLAlchemyError):
            return self._handle_sqlalchemy_error(error, error_id)
        else:
            return self._handle_generic_error(error, error_id)
    
    def handle_http_exception(self, error):
        """Manejar excepciones HTTP"""
        error_id = self._generate_error_id()
        
        logger.warning(
            f"HTTP Error ID: {error_id} - "
            f"Code: {error.code} - "
            f"Message: {error.description}"
        )
        
        return jsonify({
            'error': True,
            'error_id': error_id,
            'message': error.description,
            'code': error.code,
            'timestamp': datetime.utcnow().isoformat()
        }), error.code
    
    def handle_internal_error(self, error):
        """Manejar errores internos del servidor"""
        error_id = self._generate_error_id()
        
        logger.error(
            f"Internal Error ID: {error_id} - "
            f"Message: {str(error)} - "
            f"Traceback: {traceback.format_exc()}"
        )
        
        return jsonify({
            'error': True,
            'error_id': error_id,
            'message': 'Error interno del servidor',
            'code': 500,
            'timestamp': datetime.utcnow().isoformat()
        }), 500
    
    def handle_not_found(self, error):
        """Manejar errores 404"""
        error_id = self._generate_error_id()
        
        logger.info(
            f"Not Found ID: {error_id} - "
            f"URL: {request.url} - "
            f"Method: {request.method}"
        )
        
        return jsonify({
            'error': True,
            'error_id': error_id,
            'message': 'Recurso no encontrado',
            'code': 404,
            'timestamp': datetime.utcnow().isoformat()
        }), 404
    
    def handle_bad_request(self, error):
        """Manejar errores 400"""
        error_id = self._generate_error_id()
        
        logger.warning(
            f"Bad Request ID: {error_id} - "
            f"Message: {str(error)}"
        )
        
        return jsonify({
            'error': True,
            'error_id': error_id,
            'message': 'Solicitud inválida',
            'code': 400,
            'timestamp': datetime.utcnow().isoformat()
        }), 400
    
    def handle_unauthorized(self, error):
        """Manejar errores 401"""
        error_id = self._generate_error_id()
        
        logger.warning(
            f"Unauthorized ID: {error_id} - "
            f"IP: {request.remote_addr} - "
            f"URL: {request.url}"
        )
        
        return jsonify({
            'error': True,
            'error_id': error_id,
            'message': 'No autorizado',
            'code': 401,
            'timestamp': datetime.utcnow().isoformat()
        }), 401
    
    def handle_forbidden(self, error):
        """Manejar errores 403"""
        error_id = self._generate_error_id()
        
        logger.warning(
            f"Forbidden ID: {error_id} - "
            f"IP: {request.remote_addr} - "
            f"URL: {request.url}"
        )
        
        return jsonify({
            'error': True,
            'error_id': error_id,
            'message': 'Acceso prohibido',
            'code': 403,
            'timestamp': datetime.utcnow().isoformat()
        }), 403
    
    def _handle_database_error(self, error, error_id):
        """Manejar errores de base de datos"""
        logger.error(f"Database Error ID: {error_id} - {str(error)}")
        
        return jsonify({
            'error': True,
            'error_id': error_id,
            'message': 'Error de base de datos',
            'code': 500,
            'timestamp': datetime.utcnow().isoformat()
        }), 500
    
    def _handle_cache_error(self, error, error_id):
        """Manejar errores de caché"""
        logger.warning(f"Cache Error ID: {error_id} - {str(error)}")
        
        return jsonify({
            'error': True,
            'error_id': error_id,
            'message': 'Error de caché',
            'code': 500,
            'timestamp': datetime.utcnow().isoformat()
        }), 500
    
    def _handle_sqlalchemy_error(self, error, error_id):
        """Manejar errores de SQLAlchemy"""
        logger.error(f"SQLAlchemy Error ID: {error_id} - {str(error)}")
        
        return jsonify({
            'error': True,
            'error_id': error_id,
            'message': 'Error de base de datos',
            'code': 500,
            'timestamp': datetime.utcnow().isoformat()
        }), 500
    
    def _handle_generic_error(self, error, error_id):
        """Manejar errores genéricos"""
        logger.error(f"Generic Error ID: {error_id} - {str(error)}")
        
        return jsonify({
            'error': True,
            'error_id': error_id,
            'message': 'Error interno del servidor',
            'code': 500,
            'timestamp': datetime.utcnow().isoformat()
        }), 500
    
    def _generate_error_id(self):
        """Generar ID único para el error"""
        return f"ERR_{int(time.time())}_{hash(traceback.format_exc()) % 10000}"

def retry_on_failure(max_retries=3, delay=1):
    """Decorador para reintentar operaciones fallidas"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    logger.warning(
                        f"Intento {attempt + 1} fallido para {func.__name__}: {str(e)}"
                    )
                    
                    if attempt < max_retries - 1:
                        time.sleep(delay * (2 ** attempt))  # Backoff exponencial
            
            logger.error(
                f"Todos los intentos fallaron para {func.__name__}: {str(last_exception)}"
            )
            raise last_exception
        
        return wrapper
    return decorator

def validate_input(required_fields=None, max_length=None):
    """Decorador para validar entrada de datos"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            if request.is_json:
                data = request.get_json()
                
                # Validar campos requeridos
                if required_fields:
                    for field in required_fields:
                        if field not in data:
                            return jsonify({
                                'error': True,
                                'message': f'Campo requerido faltante: {field}',
                                'code': 400
                            }), 400
                
                # Validar longitud máxima
                if max_length:
                    for field, max_len in max_length.items():
                        if field in data and len(str(data[field])) > max_len:
                            return jsonify({
                                'error': True,
                                'message': f'Campo {field} excede la longitud máxima de {max_len}',
                                'code': 400
                            }), 400
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

def rate_limit(requests_per_minute=60):
    """Decorador para limitar tasa de requests"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Implementar lógica de rate limiting aquí
            # Por ahora, solo log
            logger.info(f"Rate limit check for {func.__name__}")
            return func(*args, **kwargs)
        return wrapper
    return decorator

# Instancia global del manejador de errores
error_handler = ErrorHandler()
