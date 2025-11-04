import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from models import Psicologo

def generate_token(psicologo_id):
    """Genera un token JWT para un psicólogo"""
    try:
        # Usar la clave secreta directamente desde la configuración
        secret_key = current_app.config.get('JWT_SECRET_KEY') or current_app.config.get('SECRET_KEY')
        if not secret_key:
            print("Error: No se encontró JWT_SECRET_KEY ni SECRET_KEY en la configuración")
            return None
            
        payload = {
            'exp': datetime.utcnow() + timedelta(seconds=3600),  # 1 hora
            'iat': datetime.utcnow(),
            'sub': str(psicologo_id)  # Convertir a string
        }
        token = jwt.encode(
            payload, 
            secret_key, 
            algorithm='HS256'
        )
        return token
    except Exception as e:
        print(f"Error generando token: {e}")
        return None

def verify_token(token):
    """Verifica un token JWT y retorna el ID del psicólogo"""
    try:
        # Usar la clave secreta directamente desde la configuración
        secret_key = current_app.config.get('JWT_SECRET_KEY') or current_app.config.get('SECRET_KEY')
        if not secret_key:
            print("Error: No se encontró JWT_SECRET_KEY ni SECRET_KEY en la configuración")
            return None
            
        payload = jwt.decode(
            token, 
            secret_key, 
            algorithms=['HS256']
        )
        return int(payload['sub'])  # Convertir de string a int
    except jwt.ExpiredSignatureError as e:
        print(f"Token expirado: {e}")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Token inválido: {e}")
        return None
    except Exception as e:
        print(f"Error verificando token: {e}")
        return None

def token_required(f):
    """Decorador para requerir autenticación JWT"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Buscar token en el header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Token malformado'}), 401
        
        if not token:
            return jsonify({'error': 'Token de acceso requerido'}), 401
        
        try:
            psicologo_id = verify_token(token)
            if not psicologo_id:
                return jsonify({'error': 'Token inválido o expirado'}), 401
            
            # Verificar que el psicólogo existe
            psicologo = Psicologo.query.get(psicologo_id)
            if not psicologo:
                return jsonify({'error': 'Usuario no encontrado'}), 401
            
            # Agregar el psicólogo al contexto de la request
            request.current_psicologo = psicologo
            
        except Exception as e:
            print(f"Error en autenticación: {e}")
            return jsonify({'error': 'Error de autenticación'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

def get_current_psicologo():
    """Obtiene el psicólogo actual del contexto de la request"""
    return getattr(request, 'current_psicologo', None)
