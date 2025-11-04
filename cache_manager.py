"""
Sistema de caché para producción
Incluye Redis, caché de predicciones y invalidación inteligente
"""

import redis
import json
import pickle
import hashlib
import time
from datetime import datetime, timedelta
from functools import wraps
import logging

logger = logging.getLogger(__name__)

class CacheManager:
    """Gestor de caché con Redis"""
    
    def __init__(self, redis_url='redis://localhost:6379/0', default_timeout=300):
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
        self.default_timeout = default_timeout
        self.prefix = "emotion_detection:"
        
        # Verificar conexión
        try:
            self.redis_client.ping()
            logger.info("Conexión a Redis establecida exitosamente")
        except redis.ConnectionError:
            logger.error("No se pudo conectar a Redis")
            self.redis_client = None
    
    def _get_key(self, key):
        """Generar clave con prefijo"""
        return f"{self.prefix}{key}"
    
    def set(self, key, value, timeout=None):
        """Almacenar valor en caché"""
        if not self.redis_client:
            return False
        
        try:
            timeout = timeout or self.default_timeout
            serialized_value = json.dumps(value, default=str)
            return self.redis_client.setex(
                self._get_key(key), 
                timeout, 
                serialized_value
            )
        except Exception as e:
            logger.error(f"Error almacenando en caché: {e}")
            return False
    
    def get(self, key):
        """Obtener valor del caché"""
        if not self.redis_client:
            return None
        
        try:
            value = self.redis_client.get(self._get_key(key))
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Error obteniendo del caché: {e}")
            return None
    
    def delete(self, key):
        """Eliminar valor del caché"""
        if not self.redis_client:
            return False
        
        try:
            return self.redis_client.delete(self._get_key(key))
        except Exception as e:
            logger.error(f"Error eliminando del caché: {e}")
            return False
    
    def exists(self, key):
        """Verificar si existe clave en caché"""
        if not self.redis_client:
            return False
        
        try:
            return self.redis_client.exists(self._get_key(key))
        except Exception as e:
            logger.error(f"Error verificando existencia en caché: {e}")
            return False
    
    def clear_pattern(self, pattern):
        """Limpiar claves que coincidan con patrón"""
        if not self.redis_client:
            return False
        
        try:
            keys = self.redis_client.keys(self._get_key(pattern))
            if keys:
                return self.redis_client.delete(*keys)
            return True
        except Exception as e:
            logger.error(f"Error limpiando patrón del caché: {e}")
            return False
    
    def get_stats(self):
        """Obtener estadísticas del caché"""
        if not self.redis_client:
            return {}
        
        try:
            info = self.redis_client.info()
            return {
                'connected_clients': info.get('connected_clients', 0),
                'used_memory': info.get('used_memory_human', '0B'),
                'total_commands_processed': info.get('total_commands_processed', 0),
                'keyspace_hits': info.get('keyspace_hits', 0),
                'keyspace_misses': info.get('keyspace_misses', 0),
                'uptime_in_seconds': info.get('uptime_in_seconds', 0)
            }
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas del caché: {e}")
            return {}

class EmotionCache:
    """Caché específico para predicciones de emociones"""
    
    def __init__(self, cache_manager):
        self.cache_manager = cache_manager
        self.emotion_timeout = 3600  # 1 hora
        self.session_timeout = 7200  # 2 horas
    
    def _generate_image_hash(self, image_data):
        """Generar hash único para imagen"""
        return hashlib.md5(image_data).hexdigest()
    
    def cache_emotion_prediction(self, image_data, emotion_result):
        """Almacenar predicción de emoción en caché"""
        image_hash = self._generate_image_hash(image_data)
        key = f"emotion_prediction:{image_hash}"
        
        cache_data = {
            'emotion': emotion_result['emotion'],
            'confidence': emotion_result['confidence'],
            'timestamp': datetime.utcnow().isoformat(),
            'image_hash': image_hash
        }
        
        return self.cache_manager.set(key, cache_data, self.emotion_timeout)
    
    def get_cached_emotion_prediction(self, image_data):
        """Obtener predicción de emoción del caché"""
        image_hash = self._generate_image_hash(image_data)
        key = f"emotion_prediction:{image_hash}"
        
        cached_result = self.cache_manager.get(key)
        if cached_result:
            logger.info(f"Predicción encontrada en caché para hash: {image_hash}")
            return cached_result
        
        return None
    
    def cache_session_data(self, session_id, session_data):
        """Almacenar datos de sesión en caché"""
        key = f"session_data:{session_id}"
        return self.cache_manager.set(key, session_data, self.session_timeout)
    
    def get_cached_session_data(self, session_id):
        """Obtener datos de sesión del caché"""
        key = f"session_data:{session_id}"
        return self.cache_manager.get(key)
    
    def invalidate_session_cache(self, session_id):
        """Invalidar caché de sesión"""
        key = f"session_data:{session_id}"
        return self.cache_manager.delete(key)
    
    def cache_patient_data(self, patient_id, patient_data):
        """Almacenar datos de paciente en caché"""
        key = f"patient_data:{patient_id}"
        return self.cache_manager.set(key, patient_data, self.session_timeout)
    
    def get_cached_patient_data(self, patient_id):
        """Obtener datos de paciente del caché"""
        key = f"patient_data:{patient_id}"
        return self.cache_manager.get(key)
    
    def invalidate_patient_cache(self, patient_id):
        """Invalidar caché de paciente"""
        key = f"patient_data:{patient_id}"
        return self.cache_manager.delete(key)
    
    def cache_psychologist_data(self, psychologist_id, psychologist_data):
        """Almacenar datos de psicólogo en caché"""
        key = f"psychologist_data:{psychologist_id}"
        return self.cache_manager.set(key, psychologist_data, self.session_timeout)
    
    def get_cached_psychologist_data(self, psychologist_id):
        """Obtener datos de psicólogo del caché"""
        key = f"psychologist_data:{psychologist_id}"
        return self.cache_manager.get(key)
    
    def invalidate_psychologist_cache(self, psychologist_id):
        """Invalidar caché de psicólogo"""
        key = f"psychologist_data:{psychologist_id}"
        return self.cache_manager.delete(key)

def cache_result(timeout=300, key_prefix=""):
    """Decorador para cachear resultados de funciones"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generar clave de caché basada en argumentos
            cache_key = f"{key_prefix}{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Intentar obtener del caché
            cached_result = cache_manager.get(cache_key)
            if cached_result:
                logger.info(f"Resultado encontrado en caché para {func.__name__}")
                return cached_result
            
            # Ejecutar función y cachear resultado
            result = func(*args, **kwargs)
            cache_manager.set(cache_key, result, timeout)
            
            return result
        return wrapper
    return decorator

def cache_emotion_prediction(func):
    """Decorador específico para cachear predicciones de emociones"""
    @wraps(func)
    def wrapper(image_data, *args, **kwargs):
        # Verificar caché
        cached_result = emotion_cache.get_cached_emotion_prediction(image_data)
        if cached_result:
            return cached_result
        
        # Ejecutar predicción
        result = func(image_data, *args, **kwargs)
        
        # Cachear resultado
        if result:
            emotion_cache.cache_emotion_prediction(image_data, result)
        
        return result
    return wrapper

def invalidate_cache_on_update(cache_type, entity_id):
    """Decorador para invalidar caché cuando se actualiza una entidad"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            
            # Invalidar caché según el tipo
            if cache_type == 'patient':
                emotion_cache.invalidate_patient_cache(entity_id)
            elif cache_type == 'session':
                emotion_cache.invalidate_session_cache(entity_id)
            elif cache_type == 'psychologist':
                emotion_cache.invalidate_psychologist_cache(entity_id)
            
            return result
        return wrapper
    return decorator

# Instancias globales
cache_manager = CacheManager()
emotion_cache = EmotionCache(cache_manager)

# Función para limpiar caché expirado
def cleanup_expired_cache():
    """Limpiar caché expirado"""
    try:
        # Redis maneja automáticamente la expiración
        # Solo loggear estadísticas
        stats = cache_manager.get_stats()
        logger.info(f"Estadísticas del caché: {stats}")
    except Exception as e:
        logger.error(f"Error limpiando caché: {e}")

# Función para obtener estadísticas del caché
def get_cache_stats():
    """Obtener estadísticas del caché"""
    return cache_manager.get_stats()
