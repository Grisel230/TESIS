#!/usr/bin/env python3
"""
Script de configuración de PostgreSQL para producción
Configura la base de datos con las mejores prácticas de seguridad y rendimiento
"""

import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_production_database():
    """Crear base de datos de producción con configuración optimizada"""
    
    # Configuración de producción
    config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', ''),
        'database': os.getenv('DB_NAME', 'emotion_detection_prod')
    }
    
    try:
        # Conectar a PostgreSQL
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            database='postgres'  # Conectar a la BD por defecto
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Crear base de datos si no existe
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{config['database']}'")
        if not cursor.fetchone():
            cursor.execute(f"CREATE DATABASE {config['database']}")
            logger.info(f"Base de datos '{config['database']}' creada exitosamente")
        else:
            logger.info(f"Base de datos '{config['database']}' ya existe")
        
        # Conectar a la nueva base de datos
        cursor.close()
        conn.close()
        
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            database=config['database']
        )
        cursor = conn.cursor()
        
        # Configuraciones de rendimiento
        performance_configs = [
            "ALTER SYSTEM SET shared_buffers = '256MB'",
            "ALTER SYSTEM SET effective_cache_size = '1GB'",
            "ALTER SYSTEM SET maintenance_work_mem = '64MB'",
            "ALTER SYSTEM SET checkpoint_completion_target = 0.9",
            "ALTER SYSTEM SET wal_buffers = '16MB'",
            "ALTER SYSTEM SET default_statistics_target = 100",
            "ALTER SYSTEM SET random_page_cost = 1.1",
            "ALTER SYSTEM SET effective_io_concurrency = 200"
        ]
        
        for config_sql in performance_configs:
            try:
                cursor.execute(config_sql)
                logger.info(f"Configuración aplicada: {config_sql}")
            except Exception as e:
                logger.warning(f"No se pudo aplicar configuración: {config_sql} - {e}")
        
        # Crear índices para optimización
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_psicologos_email ON psicologos(email)",
            "CREATE INDEX IF NOT EXISTS idx_pacientes_psicologo_id ON pacientes(psicologo_id)",
            "CREATE INDEX IF NOT EXISTS idx_sesiones_paciente_id ON sesiones(paciente_id)",
            "CREATE INDEX IF NOT EXISTS idx_sesiones_fecha ON sesiones(fecha_inicio)",
            "CREATE INDEX IF NOT EXISTS idx_emociones_sesion_id ON emociones_detectadas(sesion_id)",
            "CREATE INDEX IF NOT EXISTS idx_emociones_timestamp ON emociones_detectadas(timestamp)"
        ]
        
        for index_sql in indexes:
            try:
                cursor.execute(index_sql)
                logger.info(f"Índice creado: {index_sql}")
            except Exception as e:
                logger.warning(f"No se pudo crear índice: {index_sql} - {e}")
        
        # Configurar usuario específico para la aplicación
        app_user = os.getenv('DB_APP_USER', 'emotion_app')
        app_password = os.getenv('DB_APP_PASSWORD', 'secure_password_123')
        
        try:
            cursor.execute(f"CREATE USER {app_user} WITH PASSWORD '{app_password}'")
            logger.info(f"Usuario '{app_user}' creado exitosamente")
        except Exception as e:
            logger.info(f"Usuario '{app_user}' ya existe o error: {e}")
        
        # Otorgar permisos
        permissions = [
            f"GRANT CONNECT ON DATABASE {config['database']} TO {app_user}",
            f"GRANT USAGE ON SCHEMA public TO {app_user}",
            f"GRANT CREATE ON SCHEMA public TO {app_user}",
            f"GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO {app_user}",
            f"GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO {app_user}"
        ]
        
        for permission in permissions:
            try:
                cursor.execute(permission)
                logger.info(f"Permiso otorgado: {permission}")
            except Exception as e:
                logger.warning(f"No se pudo otorgar permiso: {permission} - {e}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info("Configuración de PostgreSQL completada exitosamente")
        return True
        
    except Exception as e:
        logger.error(f"Error configurando PostgreSQL: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Configurando PostgreSQL para producción...")
    success = create_production_database()
    if success:
        print("✅ Configuración completada exitosamente")
    else:
        print("❌ Error en la configuración")
        exit(1)
