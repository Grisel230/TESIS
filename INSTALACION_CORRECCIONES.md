# 🔧 Guía de Instalación de Correcciones

## ✅ Correcciones Implementadas

### 1. Endpoints Faltantes Agregados
- ✅ `GET /api/pacientes/:id` - Obtener paciente individual
- ✅ `DELETE /api/sesiones/:id` - Eliminar sesión
- ✅ `GET /health` - Health check para Docker

### 2. Rate Limiting Implementado
- ✅ `/api/register` - Máximo 5 registros por hora
- ✅ `/api/login` - Máximo 10 intentos por minuto
- ✅ `/predict` - Máximo 120 predicciones por minuto (2 por segundo)
- ✅ Límite global: 200 requests por día, 50 por hora

### 3. Validaciones de Seguridad
- ✅ Verificación de propiedad de recursos (pacientes, sesiones, emociones)
- ✅ SECRET_KEY y JWT_SECRET_KEY mejoradas con warnings
- ✅ Validación obligatoria de claves en producción
- ✅ Códigos HTTP 403 (Forbidden) para acceso no autorizado
- ✅ URL corregida en SessionService

## 📦 Instalación

### Paso 1: Instalar nuevas dependencias

```bash
# Asegúrate de estar en el directorio del proyecto
cd "c:\Users\Grisel Laurean\Desktop\PROTOTIPO"

# Instalar Flask-Limiter
pip install flask-limiter==3.5.0
```

### Paso 2: Configurar variables de entorno

1. Copia el archivo `env.example` a `.env`:
```bash
Copy-Item env.example .env
```

2. Edita `.env` y configura tus claves seguras:
```bash
# Genera claves seguras con:
python -c "import secrets; print(secrets.token_hex(32))"
```

3. Actualiza el archivo `.env` con las claves generadas:
```env
SECRET_KEY=tu_clave_generada_aqui
JWT_SECRET_KEY=tu_otra_clave_generada_aqui
```

### Paso 3: Verificar instalación

```bash
# Ejecutar el servidor
python app.py
```

Deberías ver:
```
⚠️  ADVERTENCIA: Usando SECRET_KEY temporal...
```
Solo si NO configuraste las variables de entorno (está bien para desarrollo).

### Paso 4: Probar los nuevos endpoints

```bash
# Health check
curl http://localhost:5000/health

# Respuesta esperada:
{
  "status": "healthy",
  "database": "connected",
  "tensorflow": "available",
  "models": "loaded"
}
```

## 🔒 Validaciones de Seguridad

### Nuevos códigos de respuesta:

- **401 Unauthorized**: Token inválido o expirado
- **403 Forbidden**: Sin permiso para acceder al recurso
- **404 Not Found**: Recurso no encontrado
- **429 Too Many Requests**: Límite de rate limiting alcanzado

### Ejemplos de validación:

```python
# Intento de acceder a paciente de otro psicólogo:
GET /api/pacientes/123
Authorization: Bearer <token_psicologo_1>

# Si el paciente 123 pertenece a psicologo_2:
Response: 403 Forbidden
{
  "error": "No tienes permiso para acceder a este paciente"
}
```

## 📊 Rate Limiting

### Límites configurados:

| Endpoint | Límite | Descripción |
|----------|--------|-------------|
| `/api/register` | 5/hora | Previene spam de registros |
| `/api/login` | 10/minuto | Previene ataques de fuerza bruta |
| `/predict` | 120/minuto | Previene sobrecarga del modelo IA |
| Global | 200/día, 50/hora | Límite general para todos los endpoints |

### Manejo de errores:

```json
// Cuando se excede el límite:
Response: 429 Too Many Requests
{
  "error": "Rate limit exceeded"
}
```

## 🚨 Advertencias Importantes

### Para Desarrollo:
- ✅ Las claves temporales son aceptables
- ✅ Los warnings son informativos, no bloquean
- ✅ Rate limiting usa memoria (se reinicia al reiniciar el servidor)

### Para Producción:
- ❌ **NUNCA** uses las claves por defecto
- ✅ **SIEMPRE** define `SECRET_KEY` y `JWT_SECRET_KEY` en variables de entorno
- ✅ Considera usar Redis para rate limiting: `RATELIMIT_STORAGE_URL=redis://localhost:6379`
- ✅ Configura `FLASK_ENV=production` y `FLASK_DEBUG=False`

## 🧪 Pruebas

### Probar validación de propiedad:

```bash
# 1. Login como psicologo_1
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testpsico","password":"test123"}'

# 2. Obtener token del response
TOKEN="<token_obtenido>"

# 3. Intentar acceder a paciente que no es tuyo (debería fallar)
curl -X GET http://localhost:5000/api/pacientes/999 \
  -H "Authorization: Bearer $TOKEN"

# Respuesta esperada: 403 Forbidden
```

### Probar rate limiting:

```bash
# Ejecutar 11 requests rápidas al login (debería bloquear la 11va)
for ($i=1; $i -le 11; $i++) {
    Write-Host "Request $i"
    curl -X POST http://localhost:5000/api/login \
      -H "Content-Type: application/json" \
      -d '{"username":"test","password":"test"}'
}

# La request 11 debería retornar 429 Too Many Requests
```

## 📝 Próximos Pasos Recomendados

1. **Configurar Redis para rate limiting** (producción)
2. **Agregar tests unitarios** para las validaciones
3. **Implementar logs estructurados** (JSON)
4. **Configurar monitoreo** (Prometheus/Grafana)
5. **Agregar documentación Swagger/OpenAPI**

## 🐛 Troubleshooting

### Error: "Cannot find name 'environment'"
- ✅ Ya corregido en SessionService
- Verificar que Angular compile sin errores: `ng build`

### Error: "Rate limit exceeded" inmediatamente
- Reinicia el servidor Flask
- Verifica que no haya múltiples instancias corriendo

### Error: "SECRET_KEY debe estar definida en producción"
- Define las variables de entorno antes de ejecutar
- O cambia `FLASK_ENV=development` temporalmente

## ✨ Resumen

¡Todas las correcciones críticas han sido implementadas exitosamente! Tu aplicación ahora es:

- ✅ **Más completa**: Todos los endpoints necesarios
- ✅ **Más segura**: Validaciones de propiedad y claves mejoradas
- ✅ **Más robusta**: Rate limiting contra abusos
- ✅ **Más profesional**: Códigos HTTP correctos y mensajes claros

**¡Listo para desarrollo! Para producción, recuerda configurar las variables de entorno.**
