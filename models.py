from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Psicologo(db.Model):
    __tablename__ = 'psicologos'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre_completo = db.Column(db.String(100), nullable=False)
    cedula_profesional = db.Column(db.String(20), unique=True, nullable=False)
    especializacion = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    nombre_usuario = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con pacientes
    pacientes = db.relationship('Paciente', backref='psicologo', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre_completo': self.nombre_completo,
            'cedula_profesional': self.cedula_profesional,
            'especializacion': self.especializacion,
            'telefono': self.telefono,
            'email': self.email,
            'nombre_usuario': self.nombre_usuario,
            'fecha_registro': self.fecha_registro.isoformat()
        }

class Paciente(db.Model):
    __tablename__ = 'pacientes'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre_completo = db.Column(db.String(100), nullable=False)
    fecha_nacimiento = db.Column(db.Date, nullable=False)
    telefono = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    genero = db.Column(db.String(20), nullable=True)
    psicologo_id = db.Column(db.Integer, db.ForeignKey('psicologos.id'), nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con sesiones
    sesiones = db.relationship('Sesion', backref='paciente', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre_completo': self.nombre_completo,
            'fecha_nacimiento': self.fecha_nacimiento.isoformat(),
            'telefono': self.telefono,
            'email': self.email,
            'genero': self.genero,
            'psicologo_id': self.psicologo_id,
            'fecha_registro': self.fecha_registro.isoformat()
        }

class Sesion(db.Model):
    __tablename__ = 'sesiones'
    
    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('pacientes.id'), nullable=False)
    psicologo_id = db.Column(db.Integer, db.ForeignKey('psicologos.id'), nullable=False)
    fecha_sesion = db.Column(db.DateTime, default=datetime.utcnow)
    duracion_minutos = db.Column(db.Integer, default=0)
    notas = db.Column(db.Text)
    emocion_predominante = db.Column(db.String(50), nullable=True)
    confianza_promedio = db.Column(db.Float, default=0.0)
    
    # Relación con emociones detectadas
    emociones = db.relationship('EmocionDetectada', backref='sesion', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'paciente_id': self.paciente_id,
            'psicologo_id': self.psicologo_id,
            'fecha_sesion': self.fecha_sesion.isoformat(),
            'duracion_minutos': self.duracion_minutos,
            'notas': self.notas,
            'emocion_predominante': self.emocion_predominante,
            'confianza_promedio': self.confianza_promedio
        }

class EmocionDetectada(db.Model):
    __tablename__ = 'emociones_detectadas'
    
    id = db.Column(db.Integer, primary_key=True)
    sesion_id = db.Column(db.Integer, db.ForeignKey('sesiones.id'), nullable=False)
    emotion = db.Column(db.String(50), nullable=False)
    confianza = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'sesion_id': self.sesion_id,
            'emotion': self.emotion,
            'confianza': self.confianza,
            'timestamp': self.timestamp.isoformat()
        }
