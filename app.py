from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Importar librerias de tensorflow y keras especificas como en el ejemplo
try:
    from tensorflow.keras.preprocessing.image import img_to_array
    from tensorflow.keras.models import load_model
    import numpy as np
    import cv2
    import time
    import base64
    TENSORFLOW_AVAILABLE = True
    logger.info("TensorFlow cargado correctamente")
except ImportError as e:
    logger.error(f"TensorFlow no disponible: {e}")
    TENSORFLOW_AVAILABLE = False
    import numpy as np
    import cv2
    import time
    import base64

from models import db, Psicologo, Paciente, Sesion, EmocionDetectada
from config import Config
from auth_utils import generate_token, token_required, get_current_psicologo

app = Flask(__name__)
CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = Config.SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = Config.SQLALCHEMY_TRACK_MODIFICATIONS
app.config['SECRET_KEY'] = Config.SECRET_KEY
app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY

# Inicializar la base de datos
db.init_app(app)

# Tipos de emociones del detector
classes = ['angry','disgust','fear','happy','neutral','sad','surprise']

# Cargamos el modelo de detección de rostros
prototxtPath = os.path.join(Config.FACE_DETECTOR_PATH, "deploy.prototxt")
weightsPath = os.path.join(Config.FACE_DETECTOR_PATH, "res10_300x300_ssd_iter_140000.caffemodel")

# Verificar que los archivos existen
faceNet = None
emotionModel = None

# Cargar modelos de forma asíncrona para evitar bloqueos
def load_models():
    global faceNet, emotionModel
    if TENSORFLOW_AVAILABLE:
        try:
            if os.path.exists(prototxtPath) and os.path.exists(weightsPath):
                faceNet = cv2.dnn.readNet(prototxtPath, weightsPath)
                logger.info("Modelo de detección de rostros cargado correctamente")
            else:
                logger.warning("Archivos de detección de rostros no encontrados")
            
            if os.path.exists(Config.MODEL_PATH):
                logger.info("Cargando modelo de emociones...")
                emotionModel = load_model(Config.MODEL_PATH)
                logger.info("Modelo de emociones cargado correctamente")
            else:
                logger.warning("Modelo de emociones no encontrado")
        except Exception as e:
            logger.error(f"Error cargando modelos: {e}")
            faceNet = None
            emotionModel = None

# Cargar modelos en un hilo separado
import threading
model_thread = threading.Thread(target=load_models, daemon=True)
model_thread.start()

# La lógica de predict_emotion adaptada para el backend
def process_image_for_emotion(frame, faceNet, emotionModel):
    """Procesa una imagen para detectar emociones en rostros"""
    if faceNet is None or emotionModel is None:
        return [{'error': 'Modelos de IA no disponibles'}]
    # Construye un blob de la imagen para el detector de rostros
    # El ejemplo usa 224x224 para el blob del detector de rostros
    blob = cv2.dnn.blobFromImage(frame, 1.0, (224, 224), (104.0, 177.0, 123.0))

    # Realiza las detecciones de rostros
    faceNet.setInput(blob)
    detections = faceNet.forward()

    emotion_results = []
	
    # Recorre cada una de las detecciones
    for i in range(0, detections.shape[2]):
        # Fija un umbral de confianza (usando 0.3 como en el ejemplo)
        confidence = detections[0, 0, i, 2]

        if confidence > 0.3: # Usando el umbral más bajo que probamos
            # Toma el bounding box escalado
            (h, w) = frame.shape[:2]
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (Xi, Yi, Xf, Yf) = box.astype("int")

            # Valida las dimensiones
            if Xi < 0: Xi = 0
            if Yi < 0: Yi = 0
            if Xf > w: Xf = w
            if Yf > h: Yf = h

            # Extrae el rostro
            face = frame[Yi:Yf, Xi:Xf]

            # Asegurarse de que la región del rostro no esté vacía
            if face.shape[0] == 0 or face.shape[1] == 0:
                continue 

            # Se convierte BGR a GRAY y se escala a 48x48 como en el ejemplo
            face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
            face = cv2.resize(face, (48, 48))
            
            # Preparar el array para el modelo de emociones usando img_to_array y expand_dims
            face2 = img_to_array(face)
            face2 = np.expand_dims(face2,axis=0)

            # Realizar la predicción de emociones
            pred = emotionModel.predict(face2)
            
            # Procesar la predicción para obtener confianza y resultados por clase
            predicted_class = np.argmax(pred[0])
            confidence = float(pred[0][predicted_class]) # Confianza de la emoción predicha

            # Guardar el resultado para este rostro
            emotion_results.append({
                'box': [int(Xi), int(Yi), int(Xf), int(Yf)], # Coordenadas del bounding box (opcional en frontend)
                'emotion': classes[predicted_class],
                'confidence': confidence,
                'all_predictions': {
                    class_name: float(p) 
                    for class_name, p in zip(classes, pred[0])
                }
            })

    return emotion_results

# Endpoint para verificar estado del sistema
@app.route('/api/status', methods=['GET'])
def get_status():
    """Endpoint para verificar el estado del sistema"""
    try:
        models_loaded = faceNet is not None and emotionModel is not None
        return jsonify({
            'status': 'running',
            'tensorflow_available': TENSORFLOW_AVAILABLE,
            'models_loaded': models_loaded,
            'face_detector_loaded': faceNet is not None,
            'emotion_model_loaded': emotionModel is not None
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint para registro de psicólogos
@app.route('/api/register', methods=['POST'])
def register_psicologo():
    try:
        data = request.json
        
        # Verificar si el email o nombre de usuario ya existen
        existing_email = Psicologo.query.filter_by(email=data['email']).first()
        existing_username = Psicologo.query.filter_by(nombre_usuario=data['nombreUsuario']).first()
        
        if existing_email:
            return jsonify({'error': 'El email ya está registrado'}), 400
        if existing_username:
            return jsonify({'error': 'El nombre de usuario ya está en uso'}), 400
        
        # Crear nuevo psicólogo
        psicologo = Psicologo(
            nombre_completo=data['nombreCompleto'],
            cedula_profesional=data['cedulaProfesional'],
            especializacion=data['especializacion'],
            telefono=data['telefono'],
            email=data['email'],
            nombre_usuario=data['nombreUsuario']
        )
        psicologo.set_password(data['password'])
        
        db.session.add(psicologo)
        db.session.commit()
        
        return jsonify({'message': 'Psicólogo registrado exitosamente', 'psicologo': psicologo.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Endpoint para login de psicólogos
@app.route('/api/login', methods=['POST'])
def login_psicologo():
    try:
        data = request.json
        
        # Validar datos requeridos
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username y password son requeridos'}), 400
        
        username = data.get('username')
        password = data.get('password')
        
        logger.info(f"Intento de login para usuario: {username}")
        
        # Buscar psicólogo por nombre de usuario o email
        psicologo = Psicologo.query.filter(
            (Psicologo.nombre_usuario == username) | (Psicologo.email == username)
        ).first()
        
        if psicologo and psicologo.check_password(password):
            # Generar token JWT
            token = generate_token(psicologo.id)
            if token:
                logger.info(f"Login exitoso para: {psicologo.email}")
                return jsonify({
                    'message': 'Login exitoso',
                    'token': token,
                    'psicologo': psicologo.to_dict()
                }), 200
            else:
                logger.error("Error generando token")
                return jsonify({'error': 'Error interno del servidor'}), 500
        else:
            logger.warning(f"Credenciales inválidas para: {username}")
            return jsonify({'error': 'Credenciales inválidas'}), 401
            
    except Exception as e:
        logger.error(f"Error en login: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

# Endpoint para obtener psicólogo por ID
@app.route('/api/psicologo/<int:psicologo_id>', methods=['GET'])
def get_psicologo(psicologo_id):
    try:
        psicologo = Psicologo.query.get_or_404(psicologo_id)
        return jsonify({'psicologo': psicologo.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint para crear un nuevo paciente
@app.route('/api/pacientes', methods=['POST'])
@token_required
def crear_paciente():
    try:
        data = request.json
        print(f"📝 Datos recibidos para crear paciente: {data}")
        
        # Validar datos requeridos
        if not data.get('nombre') or not data.get('apellido_paterno'):
            print("❌ Error: Faltan datos requeridos")
            return jsonify({'error': 'Nombre y apellido paterno son requeridos'}), 400
        
        if not data.get('edad') or data.get('edad') <= 0:
            return jsonify({'error': 'La edad es requerida y debe ser mayor a 0'}), 400
        
        if not data.get('genero'):
            return jsonify({'error': 'El género es requerido'}), 400
        
        # Obtener el psicólogo_id del token de autenticación
        psicologo = get_current_psicologo()
        if not psicologo:
            return jsonify({'error': 'No autorizado'}), 401
        
        psicologo_id = psicologo.id
        
        # Crear el nombre completo
        nombre_completo = f"{data['nombre']} {data['apellido_paterno']}"
        if data.get('apellido_materno'):
            nombre_completo += f" {data['apellido_materno']}"
        
        # Calcular fecha de nacimiento aproximada (asumiendo edad actual)
        from datetime import date
        today = date.today()
        birth_year = today.year - data['edad']
        fecha_nacimiento = date(birth_year, 1, 1)  # Usamos 1 de enero como fecha aproximada
        
        # Crear nuevo paciente
        paciente = Paciente(
            nombre_completo=nombre_completo,
            fecha_nacimiento=fecha_nacimiento,
            telefono=data.get('telefono', ''),
            email=data.get('email', ''),
            genero=data.get('genero', 'No especificado'),
            psicologo_id=psicologo_id
        )
        
        db.session.add(paciente)
        db.session.commit()
        
        # Calcular edad y agregar género al response
        from datetime import date
        today = date.today()
        birth_year = today.year - data['edad']
        edad_calculada = data['edad']
        genero = data.get('genero', 'No especificado')
        
        paciente_dict = paciente.to_dict()
        paciente_dict['edad'] = edad_calculada
        paciente_dict['genero'] = genero
        
        return jsonify({
            'message': 'Paciente creado exitosamente',
            'paciente': paciente_dict
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Endpoint para obtener pacientes de un psicólogo
@app.route('/api/pacientes/psicologo/<int:psicologo_id>', methods=['GET'])
@token_required
def get_pacientes_psicologo(psicologo_id):
    try:
        pacientes = Paciente.query.filter_by(psicologo_id=psicologo_id).all()
        
        # Agregar edad y género calculados a cada paciente
        from datetime import date
        today = date.today()
        
        pacientes_con_datos = []
        for paciente in pacientes:
            paciente_dict = paciente.to_dict()
            
            # Calcular edad desde fecha_nacimiento
            birth_date = datetime.strptime(paciente_dict['fecha_nacimiento'], '%Y-%m-%d').date()
            edad = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            
            paciente_dict['edad'] = edad
            # El género ya viene del to_dict() del modelo
            
            pacientes_con_datos.append(paciente_dict)
        
        return jsonify({
            'pacientes': pacientes_con_datos
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint para actualizar un paciente
@app.route('/api/pacientes/<int:paciente_id>', methods=['PUT'])
@token_required
def actualizar_paciente(paciente_id):
    try:
        paciente = Paciente.query.get(paciente_id)
        if not paciente:
            return jsonify({'error': 'Paciente no encontrado'}), 404
        
        data = request.json
        
        # Validar datos requeridos
        if not data.get('nombre') or not data.get('apellido_paterno'):
            return jsonify({'error': 'Nombre y apellido paterno son requeridos'}), 400
        
        # Crear el nombre completo
        nombre_completo = f"{data['nombre']} {data['apellido_paterno']}"
        if data.get('apellido_materno'):
            nombre_completo += f" {data['apellido_materno']}"
        
        # Calcular fecha de nacimiento aproximada (asumiendo edad actual)
        from datetime import date
        today = date.today()
        birth_year = today.year - data['edad']
        fecha_nacimiento = date(birth_year, 1, 1)  # Usamos 1 de enero como fecha aproximada
        
        # Actualizar los datos del paciente
        paciente.nombre_completo = nombre_completo
        paciente.fecha_nacimiento = fecha_nacimiento
        paciente.telefono = data.get('telefono', paciente.telefono)
        paciente.email = data.get('email', paciente.email)
        paciente.genero = data.get('genero', paciente.genero)
        
        db.session.commit()
        
        # Calcular edad y agregar género al response
        edad_calculada = data['edad']
        genero = data.get('genero', 'No especificado')
        
        paciente_dict = paciente.to_dict()
        paciente_dict['edad'] = edad_calculada
        paciente_dict['genero'] = genero
        
        return jsonify({
            'message': 'Paciente actualizado exitosamente',
            'paciente': paciente_dict
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Endpoint para eliminar un paciente
@app.route('/api/pacientes/<int:paciente_id>', methods=['DELETE'])
@token_required
def eliminar_paciente(paciente_id):
    try:
        paciente = Paciente.query.get(paciente_id)
        if not paciente:
            return jsonify({'error': 'Paciente no encontrado'}), 404
        
        db.session.delete(paciente)
        db.session.commit()
        
        return jsonify({'message': 'Paciente eliminado exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Endpoint para obtener todos los psicólogos
@app.route('/api/psicologos', methods=['GET'])
def get_psicologos():
    try:
        psicologos = Psicologo.query.all()
        psicologos_data = []
        for psicologo in psicologos:
            psicologos_data.append({
                'id': psicologo.id,
                'nombre_completo': psicologo.nombre_completo,
                'cedula_profesional': psicologo.cedula_profesional,
                'especializacion': psicologo.especializacion,
                'telefono': psicologo.telefono,
                'email': psicologo.email,
                'nombre_usuario': psicologo.nombre_usuario,
                'fecha_registro': psicologo.fecha_registro.isoformat()
            })
        
        return jsonify({
            'psicologos': psicologos_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoints para sesiones
@app.route('/api/sesiones', methods=['POST'])
@token_required
def crear_sesion():
    try:
        data = request.json
        
        # Validar datos requeridos
        if not data.get('paciente_id'):
            return jsonify({'error': 'ID del paciente es requerido'}), 400
        
        # Obtener psicólogo del token
        psicologo = get_current_psicologo()
        if not psicologo:
            return jsonify({'error': 'No autorizado'}), 401
        
        # Crear nueva sesión
        sesion = Sesion(
            paciente_id=data['paciente_id'],
            psicologo_id=psicologo.id,
            fecha_sesion=datetime.utcnow(),
            duracion_minutos=data.get('duracion_minutos', 0),
            notas=data.get('notas', ''),
            emocion_predominante=data.get('emocion_predominante', ''),
            confianza_promedio=data.get('confianza_promedio', 0.0)
        )
        
        db.session.add(sesion)
        db.session.commit()
        
        return jsonify({
            'message': 'Sesión creada exitosamente',
            'sesion': {
                'id': sesion.id,
                'paciente_id': sesion.paciente_id,
                'psicologo_id': sesion.psicologo_id,
                'fecha_sesion': sesion.fecha_sesion.isoformat(),
                'duracion_minutos': sesion.duracion_minutos,
                'notas': sesion.notas,
                'emocion_predominante': sesion.emocion_predominante,
                'confianza_promedio': sesion.confianza_promedio
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/sesiones/psicologo/<int:psicologo_id>', methods=['GET'])
@token_required
def get_sesiones_psicologo(psicologo_id):
    try:
        sesiones = Sesion.query.filter_by(psicologo_id=psicologo_id).order_by(Sesion.fecha_sesion.desc()).all()
        
        sesiones_con_datos = []
        for sesion in sesiones:
            sesion_dict = {
                'id': sesion.id,
                'paciente_id': sesion.paciente_id,
                'psicologo_id': sesion.psicologo_id,
                'fecha_sesion': sesion.fecha_sesion.isoformat(),
                'duracion_minutos': sesion.duracion_minutos,
                'notas': sesion.notas,
                'emocion_predominante': sesion.emocion_predominante,
                'confianza_promedio': sesion.confianza_promedio
            }
            
            # Obtener datos del paciente
            paciente = Paciente.query.get(sesion.paciente_id)
            if paciente:
                sesion_dict['paciente_nombre'] = paciente.nombre_completo
            else:
                sesion_dict['paciente_nombre'] = 'Paciente no encontrado'
            
            sesiones_con_datos.append(sesion_dict)
        
        return jsonify({
            'sesiones': sesiones_con_datos
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sesiones/<int:sesion_id>', methods=['GET'])
@token_required
def get_sesion_detalle(sesion_id):
    try:
        sesion = Sesion.query.get(sesion_id)
        if not sesion:
            return jsonify({'error': 'Sesión no encontrada'}), 404
        
        # Obtener datos del paciente
        paciente = Paciente.query.get(sesion.paciente_id)
        paciente_nombre = paciente.nombre_completo if paciente else 'Paciente no encontrado'
        
        # Obtener emociones detectadas de esta sesión
        emociones = EmocionDetectada.query.filter_by(sesion_id=sesion_id).all()
        emociones_data = []
        for emocion in emociones:
            emociones_data.append({
                'id': emocion.id,
                'emotion': emocion.emotion,
                'confidence': emocion.confidence,
                'timestamp': emocion.timestamp.isoformat()
            })
        
        sesion_dict = {
            'id': sesion.id,
            'paciente_id': sesion.paciente_id,
            'paciente_nombre': paciente_nombre,
            'psicologo_id': sesion.psicologo_id,
            'fecha_sesion': sesion.fecha_sesion.isoformat(),
            'duracion_minutos': sesion.duracion_minutos,
            'notas': sesion.notas,
            'emocion_predominante': sesion.emocion_predominante,
            'confianza_promedio': sesion.confianza_promedio,
            'emociones_detectadas': emociones_data
        }
        
        return jsonify({'sesion': sesion_dict}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint para estadísticas del dashboard
@app.route('/api/dashboard/stats/<int:psicologo_id>', methods=['GET'])
@token_required
def get_dashboard_stats(psicologo_id):
    try:
        from datetime import datetime, timedelta
        
        # Estadísticas básicas
        total_pacientes = Paciente.query.filter_by(psicologo_id=psicologo_id).count()
        total_sesiones = Sesion.query.filter_by(psicologo_id=psicologo_id).count()
        
        # Pacientes nuevos en los últimos 30 días
        hace_30_dias = datetime.utcnow() - timedelta(days=30)
        nuevos_pacientes = Paciente.query.filter(
            Paciente.psicologo_id == psicologo_id,
            Paciente.fecha_registro >= hace_30_dias
        ).count()
        
        # Sesiones de hoy
        hoy = datetime.utcnow().date()
        sesiones_hoy = Sesion.query.filter(
            Sesion.psicologo_id == psicologo_id,
            db.func.date(Sesion.fecha_sesion) == hoy
        ).count()
        
        # Total de emociones detectadas
        total_emociones = EmocionDetectada.query.join(Sesion).filter(
            Sesion.psicologo_id == psicologo_id
        ).count()
        
        # Emociones de hoy
        emociones_hoy = EmocionDetectada.query.join(Sesion).filter(
            Sesion.psicologo_id == psicologo_id,
            db.func.date(EmocionDetectada.timestamp) == hoy
        ).count()
        
        # Calcular satisfacción promedio (basado en emociones positivas)
        emociones_positivas = EmocionDetectada.query.join(Sesion).filter(
            Sesion.psicologo_id == psicologo_id,
            EmocionDetectada.emotion.in_(['happy', 'neutral'])
        ).count()
        
        satisfaccion_promedio = 0
        if total_emociones > 0:
            satisfaccion_promedio = round((emociones_positivas / total_emociones) * 100, 1)
        
        # Datos de emociones por mes (últimos 6 meses)
        hace_6_meses = datetime.utcnow() - timedelta(days=180)
        emociones_por_mes = db.session.query(
            db.func.date_trunc('month', EmocionDetectada.timestamp).label('mes'),
            EmocionDetectada.emotion,
            db.func.count(EmocionDetectada.id).label('cantidad')
        ).join(Sesion).filter(
            Sesion.psicologo_id == psicologo_id,
            EmocionDetectada.timestamp >= hace_6_meses
        ).group_by(
            db.func.date_trunc('month', EmocionDetectada.timestamp),
            EmocionDetectada.emotion
        ).all()
        
        # Procesar datos de emociones por mes
        chart_data = {}
        for row in emociones_por_mes:
            mes = row.mes.strftime('%b')
            if mes not in chart_data:
                chart_data[mes] = {'feliz': 0, 'triste': 0, 'enojado': 0, 'neutral': 0}
            
            if row.emotion == 'happy':
                chart_data[mes]['feliz'] = row.cantidad
            elif row.emotion == 'sad':
                chart_data[mes]['triste'] = row.cantidad
            elif row.emotion == 'angry':
                chart_data[mes]['enojado'] = row.cantidad
            elif row.emotion == 'neutral':
                chart_data[mes]['neutral'] = row.cantidad
        
        # Convertir a lista para el frontend
        chart_list = []
        for mes, datos in chart_data.items():
            chart_list.append({
                'month': mes,
                'feliz': datos['feliz'],
                'triste': datos['triste'],
                'enojado': datos['enojado'],
                'neutral': datos['neutral']
            })
        
        # Actividad reciente (últimas 5 sesiones)
        sesiones_recientes = Sesion.query.filter_by(psicologo_id=psicologo_id).order_by(
            Sesion.fecha_sesion.desc()
        ).limit(5).all()
        
        actividad_reciente = []
        for sesion in sesiones_recientes:
            paciente = Paciente.query.get(sesion.paciente_id)
            actividad_reciente.append({
                'id': sesion.id,
                'titulo': f'Sesión con {paciente.nombre_completo if paciente else "Paciente desconocido"}',
                'descripcion': f'Emoción predominante: {sesion.emocion_predominante or "No detectada"}',
                'tiempo': sesion.fecha_sesion.strftime('%d %b %Y'),
                'tipo': 'sesion',
                'estado': 'completada',
                'estado_texto': 'Completada'
            })
        
        return jsonify({
            'estadisticas': {
                'total_pacientes': total_pacientes,
                'nuevos_pacientes': nuevos_pacientes,
                'total_sesiones': total_sesiones,
                'sesiones_hoy': sesiones_hoy,
                'total_emociones': total_emociones,
                'emociones_hoy': emociones_hoy,
                'satisfaccion_promedio': satisfaccion_promedio
            },
            'chart_data': chart_list,
            'actividad_reciente': actividad_reciente
        }), 200
        
    except Exception as e:
        print(f"Error en dashboard stats: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
@token_required
def predict():
    """Endpoint para predecir emociones en una imagen"""
    try:
        data = request.json
        
        # Validar datos requeridos
        if not data or not data.get('image'):
            return jsonify({'error': 'Imagen requerida'}), 400
        
        # Verificar que los modelos están disponibles
        if not TENSORFLOW_AVAILABLE or faceNet is None or emotionModel is None:
            return jsonify({'error': 'Modelos de IA no disponibles'}), 503
        
        image_data = data['image']
        
        # Decodificar la imagen base64 usando OpenCV
        try:
            image_bytes = base64.b64decode(image_data.split(',')[1])
            np_arr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        except Exception as e:
            logger.error(f"Error decodificando imagen: {e}")
            return jsonify({'error': 'Formato de imagen inválido'}), 400

        if frame is None:
            logger.error("No se pudo decodificar la imagen")
            return jsonify({'error': 'No se pudo decodificar la imagen'}), 400

        # Procesar la imagen y obtener resultados de emociones
        emotion_results = process_image_for_emotion(frame, faceNet, emotionModel)
        
        logger.info(f"Procesamiento completado. Rostros detectados: {len(emotion_results)}")
        
        return jsonify(emotion_results)

    except Exception as e:
        logger.error(f"Error en predicción: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Error interno del servidor'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Base de datos inicializada")
    app.run(debug=True, port=5000) 