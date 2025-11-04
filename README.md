# 🎭 Sistema de Detección de Emociones

Sistema completo de detección de emociones faciales para psicólogos, desarrollado con Flask (Python) y Angular (TypeScript).

## 📋 Descripción

Este sistema permite a los psicólogos registrar pacientes, realizar sesiones de terapia con detección automática de emociones faciales, y generar informes estadísticos. Utiliza inteligencia artificial para detectar emociones en tiempo real durante las sesiones.

## 🏗️ Arquitectura

### Backend (Flask)
- **Framework**: Flask con SQLAlchemy ORM
- **Base de Datos**: PostgreSQL (producción) / SQLite (desarrollo)
- **Autenticación**: JWT (JSON Web Tokens)
- **IA**: TensorFlow/Keras para detección de emociones
- **Procesamiento**: OpenCV para detección facial

### Frontend (Angular)
- **Framework**: Angular 18
- **Lenguaje**: TypeScript
- **Estilos**: SCSS
- **Servicios**: HTTP Client para comunicación con API

## 🚀 Características Principales

### 👨‍⚕️ Gestión de Psicólogos
- Registro e inicio de sesión
- Dashboard con estadísticas
- Gestión de perfil

### 👥 Gestión de Pacientes
- Registro de pacientes
- Lista de pacientes por psicólogo
- Historial de sesiones

### 🎯 Sesiones de Terapia
- Detección de emociones en tiempo real
- Grabación de sesiones
- Historial de emociones detectadas
- Generación de informes

### 📊 Dashboard y Estadísticas
- Estadísticas generales
- Gráficos de emociones por sesión
- Métricas de rendimiento

## 🛠️ Instalación y Configuración

### Requisitos del Sistema
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (para producción)
- Redis (opcional, para caché)

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd emotion-detection
```

### 2. Configurar Backend (Flask)

#### Instalar Dependencias
```bash
pip install -r requirements.txt
```

#### Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar configuración
nano .env
```

#### Inicializar Base de Datos
```bash
python init_db.py
```

#### Ejecutar Backend
```bash
python app.py
```

### 3. Configurar Frontend (Angular)

#### Instalar Dependencias
```bash
cd emotion-detector
npm install
```

#### Ejecutar Frontend
```bash
npm start
```

## 📁 Estructura del Proyecto

```
emotion-detection/
├── app.py                 # Aplicación principal Flask
├── models.py             # Modelos de base de datos
├── config.py             # Configuración de la aplicación
├── requirements.txt      # Dependencias Python
├── init_db.py           # Script de inicialización de BD
├── modelFEC.h5          # Modelo de IA para emociones
├── face_detector/       # Modelos de detección facial
├── emotion-detector/    # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Componentes Angular
│   │   │   ├── services/     # Servicios Angular
│   │   │   ├── guards/       # Guards de autenticación
│   │   │   └── interceptors/ # Interceptores HTTP
│   │   └── environments/     # Configuración de entornos
│   └── package.json
└── README.md
```

## 🔧 Configuración de Producción

### Variables de Entorno
```bash
# Base de Datos
DATABASE_URL=postgresql://user:password@localhost:5432/emotion_detection_prod

# Seguridad
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_key_here

# CORS
CORS_ORIGINS=https://yourdomain.com

# Modelos de IA
MODEL_PATH=./modelFEC.h5
FACE_DETECTOR_PROTOTXT=./face_detector/deploy.prototxt
FACE_DETECTOR_MODEL=./face_detector/res10_300x300_ssd_iter_140000.caffemodel
```

### Despliegue con Docker
```bash
# Construir imagen
docker build -t emotion-detection .

# Ejecutar con Docker Compose
docker-compose up -d
```

### Despliegue Manual
```bash
# Configurar PostgreSQL
sudo -u postgres psql << EOF
CREATE USER emotion_app WITH PASSWORD 'secure_password';
CREATE DATABASE emotion_detection_prod OWNER emotion_app;
GRANT ALL PRIVILEGES ON DATABASE emotion_detection_prod TO emotion_app;
\q
EOF

# Configurar Nginx
sudo cp nginx.conf /etc/nginx/sites-available/emotion-detection
sudo ln -s /etc/nginx/sites-available/emotion-detection /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# Configurar PM2
pm2 start ecosystem.config.js --env production
pm2 startup
pm2 save
```

## 📚 API Endpoints

### Autenticación
- `POST /api/register` - Registro de psicólogo
- `POST /api/login` - Inicio de sesión
- `POST /api/logout` - Cerrar sesión

### Pacientes
- `GET /api/pacientes/psicologo/<id>` - Lista de pacientes
- `POST /api/pacientes` - Crear paciente
- `PUT /api/pacientes/<id>` - Actualizar paciente
- `DELETE /api/pacientes/<id>` - Eliminar paciente

### Sesiones
- `GET /api/sesiones/psicologo/<id>` - Lista de sesiones
- `POST /api/sesiones` - Crear sesión
- `PUT /api/sesiones/<id>/finalizar` - Finalizar sesión
- `DELETE /api/sesiones/<id>` - Eliminar sesión

### Emociones
- `POST /api/sesiones/<id>/emociones` - Guardar emoción detectada
- `GET /api/sesiones/<id>/emociones` - Obtener emociones de sesión

### Dashboard
- `GET /api/dashboard/stats/<id>` - Estadísticas del psicólogo

### Detección de Emociones
- `POST /predict` - Detectar emociones en imagen

## 🎯 Uso del Sistema

### 1. Registro e Inicio de Sesión
- Acceder a `http://localhost:4200`
- Registrar nuevo psicólogo o iniciar sesión

### 2. Gestión de Pacientes
- Ir a "Lista de Pacientes"
- Agregar nuevos pacientes
- Ver historial de sesiones

### 3. Realizar Sesión
- Ir a "Registro de Pacientes"
- Seleccionar paciente
- Iniciar sesión con detección de emociones
- La cámara detectará emociones automáticamente

### 4. Ver Estadísticas
- Ir a "Dashboard"
- Ver estadísticas generales
- Revisar gráficos de emociones

## 🔒 Seguridad

### Medidas Implementadas
- Autenticación JWT
- Validación de entrada
- CORS configurado
- Headers de seguridad
- Rate limiting
- Logging de seguridad

### Recomendaciones
- Cambiar contraseñas por defecto
- Usar HTTPS en producción
- Configurar firewall
- Realizar backups regulares

## 📊 Monitoreo y Logs

### Logs del Sistema
- **Aplicación**: `logs/app.log`
- **Errores**: `logs/error.log`
- **Nginx**: `/var/log/nginx/`

### Métricas Importantes
- Latencia de API < 200ms
- Disponibilidad > 99.9%
- Uso de CPU < 80%
- Uso de memoria < 85%

## 🐛 Solución de Problemas

### Error de Base de Datos
```bash
# Recrear base de datos
python init_db.py
```

### Error de Modelos de IA
```bash
# Verificar que los archivos existan
ls -la modelFEC.h5
ls -la face_detector/
```

### Error de CORS
```bash
# Verificar configuración en config.py
CORS_ORIGINS = ['http://localhost:4200']
```

### Error de Permisos
```bash
# Verificar permisos de archivos
chmod 755 uploads/
chmod 755 logs/
```

## 🔄 Actualizaciones

### Actualizar Código
```bash
git pull origin main
pip install -r requirements.txt
cd emotion-detector && npm install
```

### Actualizar Base de Datos
```bash
# Hacer backup
pg_dump emotion_detection > backup.sql

# Aplicar migraciones
python init_db.py
```

## 📞 Soporte

### Contacto
- **Desarrollador**: [Tu email]
- **Documentación**: [Enlace a docs]
- **Issues**: [Enlace a GitHub Issues]

### Recursos
- [Documentación Flask](https://flask.palletsprojects.com/)
- [Documentación Angular](https://angular.io/docs)
- [Documentación TensorFlow](https://tensorflow.org/docs)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- TensorFlow/Keras por el modelo de detección de emociones
- OpenCV por la detección facial
- Flask y Angular por los frameworks
- Comunidad de desarrolladores por el soporte

---

**¡Sistema listo para usar!** 🎉

Para más información técnica, consulta los archivos de configuración y la documentación del código.