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

## ⚡ Instalación Rápida

```bash
# Clona el repositorio
https://github.com/Grisel230/TESIS.git

# Instala dependencias backend
cd PROTOTIPO
pip install -r requirements.txt

# Instala dependencias frontend
cd emotion-detector
npm install
```

## 🧑‍💻 Ejemplo de Uso

1. Inicia el backend: `python run_server.py`
2. Inicia el frontend: `ng serve` en la carpeta `emotion-detector`
3. Accede a la app en `http://localhost:4200`

## 📄 Créditos

Desarrollado por Grisel Laurean y Britney Sanchez.

## 📚 Documentación y Enlaces
- [Documentación oficial Angular](https://angular.io/)
- [Documentación Flask](https://flask.palletsprojects.com/)
- [Repositorio en GitHub](https://github.com/Grisel230/TESIS)
