# 🧠 Sistema de Detección de Emociones para Psicólogos

Un sistema completo que permite a los psicólogos detectar emociones en tiempo real durante las sesiones con sus pacientes, utilizando inteligencia artificial y machine learning.

## ✨ Características

- **Detección de Emociones en Tiempo Real**: Utiliza TensorFlow y OpenCV para detectar 7 emociones básicas
- **Gestión de Pacientes**: CRUD completo para administrar pacientes
- **Sesiones de Terapia**: Registro y seguimiento de sesiones
- **Dashboard Estadístico**: Visualización de datos y métricas
- **Autenticación Segura**: Sistema JWT para proteger las rutas
- **Interfaz Moderna**: Frontend en Angular con Material Design

## 🏗️ Arquitectura

- **Backend**: Flask (Python) con SQLAlchemy
- **Frontend**: Angular 19 con TypeScript
- **Base de Datos**: PostgreSQL
- **IA**: TensorFlow + OpenCV para detección facial
- **Autenticación**: JWT (JSON Web Tokens)

## 🚀 Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd PROTOTIPO
```

### 2. Instalar dependencias automáticamente
```bash
python install_dependencies.py
```

### 3. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar .env con tus configuraciones
nano .env
```

### 4. Configurar base de datos PostgreSQL
```sql
CREATE DATABASE emociones;
CREATE USER postgres WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE emociones TO postgres;
```

### 5. Verificar instalación
```bash
python check_setup.py
```

## 🎯 Uso

### Iniciar Backend
```bash
python app.py
```

### Iniciar Frontend
```bash
cd emotion-detector
npm start
```

### Acceder a la aplicación
- Frontend: http://localhost:4200
- Backend API: http://localhost:5000

## 📁 Estructura del Proyecto

```
PROTOTIPO/
├── 📁 emotion-detector/          # Frontend Angular
│   ├── src/app/
│   │   ├── components/           # Componentes de la UI
│   │   ├── services/            # Servicios (API, Auth)
│   │   ├── guards/              # Guards de autenticación
│   │   └── interceptors/        # Interceptores HTTP
│   └── package.json
├── 📁 face_detector/            # Modelos de detección facial
├── 📄 app.py                    # Aplicación Flask principal
├── 📄 models.py                 # Modelos de base de datos
├── 📄 config.py                 # Configuración
├── 📄 auth_utils.py             # Utilidades de autenticación JWT
├── 📄 requirements.txt          # Dependencias Python
├── 📄 install_dependencies.py   # Script de instalación
├── 📄 check_setup.py           # Script de verificación
└── 📄 README.md                # Este archivo
```

## 🔧 Configuración Detallada

### Variables de Entorno (.env)
```env
# Base de datos
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/emociones

# Seguridad
SECRET_KEY=tu-clave-secreta-muy-segura
JWT_SECRET_KEY=tu-jwt-secret-key

# CORS
CORS_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
```

### Dependencias Python
- Flask 3.1.2
- TensorFlow 2.16.1
- OpenCV 4.10.0
- SQLAlchemy 3.1.1
- PyJWT 2.9.0

### Dependencias Angular
- Angular 19.2.0
- Angular Material 19.2.19
- Chart.js 4.5.0
- RxJS 7.8.0

## 🔐 Seguridad

- **Autenticación JWT**: Tokens seguros con expiración
- **Validación de Datos**: Validación en frontend y backend
- **CORS Configurado**: Orígenes permitidos específicos
- **Manejo de Errores**: Logging y manejo seguro de errores
- **Variables de Entorno**: Credenciales no hardcodeadas

## 🧪 API Endpoints

### Autenticación
- `POST /api/register` - Registro de psicólogos
- `POST /api/login` - Login con JWT

### Pacientes (Requiere autenticación)
- `GET /api/pacientes/psicologo/{id}` - Listar pacientes
- `POST /api/pacientes` - Crear paciente
- `PUT /api/pacientes/{id}` - Actualizar paciente
- `DELETE /api/pacientes/{id}` - Eliminar paciente

### Sesiones (Requiere autenticación)
- `GET /api/sesiones/psicologo/{id}` - Listar sesiones
- `POST /api/sesiones` - Crear sesión
- `GET /api/sesiones/{id}` - Detalle de sesión

### IA
- `POST /predict` - Detectar emociones en imagen

## 🐛 Solución de Problemas

### Error: "Modelos de IA no disponibles"
- Verifica que `modelFEC.h5` existe en la raíz
- Verifica que los archivos en `face_detector/` están presentes
- Revisa los logs del servidor

### Error: "No se puede conectar con el servidor"
- Verifica que PostgreSQL esté ejecutándose
- Revisa la configuración de `DATABASE_URL`
- Verifica que el puerto 5000 esté libre

### Error: "Token inválido o expirado"
- Haz logout y vuelve a hacer login
- Verifica que el token se esté enviando correctamente

## 📊 Monitoreo

El sistema incluye logging detallado para:
- Intentos de login
- Errores de autenticación
- Procesamiento de imágenes
- Errores de base de datos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si encuentras algún problema:
1. Revisa la sección de solución de problemas
2. Ejecuta `python check_setup.py` para verificar la configuración
3. Revisa los logs del servidor
4. Abre un issue en GitHub

---

**Desarrollado con ❤️ para mejorar la práctica psicológica**