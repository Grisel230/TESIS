/**
 * Script para generar manuales en PDF para el sistema de análisis emocional
 * Ejecutar con: npx ts-node generate-manuals.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Simulación de generación de PDFs (en un entorno real usarías jsPDF o pdfkit)
const manuales = {
  'guia-uso.pdf': {
    titulo: 'Guía de Uso del Sistema',
    contenido: `
SISTEMA DE ANÁLISIS EMOCIONAL
Guía Completa de Usuario

ÍNDICE
1. Introducción
2. Inicio de Sesión
3. Panel Principal (Dashboard)
4. Gestión de Pacientes
5. Registro de Sesiones
6. Análisis Emocional
7. Generación de Reportes
8. Configuración del Sistema

═══════════════════════════════════════════════════════

1. INTRODUCCIÓN

Bienvenido al Sistema de Análisis Emocional, una herramienta profesional 
diseñada para psicólogos que permite realizar un seguimiento detallado 
de las emociones de los pacientes mediante análisis facial en tiempo real.

Características principales:
✓ Detección automática de emociones en sesiones en vivo
✓ Historial completo de sesiones
✓ Reportes estadísticos avanzados
✓ Gestión integral de pacientes
✓ Modo oscuro para comodidad visual

═══════════════════════════════════════════════════════

2. INICIO DE SESIÓN

Para acceder al sistema:
1. Ingrese su correo electrónico registrado
2. Introduzca su contraseña
3. Haga clic en "Iniciar Sesión"

Si olvidó su contraseña:
- Haga clic en "¿Olvidaste tu contraseña?"
- Ingrese su correo electrónico
- Recibirá un enlace para restablecer su contraseña

═══════════════════════════════════════════════════════

3. PANEL PRINCIPAL (DASHBOARD)

El Dashboard muestra:
- Resumen de estadísticas: Total de pacientes, sesiones realizadas, 
  sesiones pendientes
- Lista de pacientes activos con información de su última sesión
- Gráficos de emociones predominantes
- Accesos rápidos a funciones principales

Navegación:
- Use el menú lateral (☰ Menú) para acceder a todas las secciones
- El botón hamburguesa oculta/muestra el menú
- Su perfil de usuario aparece en la esquina superior derecha

═══════════════════════════════════════════════════════

4. GESTIÓN DE PACIENTES

4.1 AGREGAR NUEVO PACIENTE
1. Clic en "Agregar Paciente" desde el menú o Dashboard
2. Complete el formulario:
   - Nombre completo
   - Apellidos (paterno y materno)
   - Edad
   - Género
   - Email (opcional)
   - Teléfono (opcional)
   - Dirección (opcional)
   - Diagnóstico preliminar
   - Notas generales
3. Haga clic en "Guardar Paciente"

4.2 LISTA DE PACIENTES
- Visualice todos sus pacientes registrados
- Use los filtros para buscar por nombre, edad o género
- Edite información haciendo clic en el ícono de lápiz
- Elimine pacientes (requiere confirmación)
- Vea el historial de sesiones de cada paciente

4.3 ACCIONES RÁPIDAS
- Ver detalles completos del paciente
- Iniciar nueva sesión
- Ver historial de sesiones
- Generar reporte individual

═══════════════════════════════════════════════════════

5. REGISTRO DE SESIONES

5.1 INICIAR NUEVA SESIÓN
1. Seleccione un paciente de la lista
2. Clic en "Registrar Sesión" o "Nueva Sesión"
3. El sistema activará su cámara automáticamente
4. Complete los datos de la sesión:
   - Fecha y hora (se llenan automáticamente)
   - Duración estimada
   - Notas de la sesión

5.2 DURANTE LA SESIÓN
- El sistema detecta emociones en tiempo real:
  * Felicidad
  * Tristeza
  * Enojo
  * Sorpresa
  * Miedo
  * Disgusto
  * Neutral
- Las emociones se registran con porcentajes de confianza
- Puede tomar notas durante la sesión
- Capture momentos importantes con capturas de pantalla

5.3 FINALIZAR SESIÓN
1. Haga clic en "Finalizar Sesión"
2. Revise el resumen de emociones detectadas
3. Agregue notas finales si es necesario
4. Guarde la sesión

═══════════════════════════════════════════════════════

6. ANÁLISIS EMOCIONAL

6.1 TECNOLOGÍA
El sistema utiliza:
- Algoritmos de Machine Learning avanzados
- Modelo FER (Facial Expression Recognition)
- Detección facial en tiempo real
- Análisis de 7 emociones básicas

6.2 INTERPRETACIÓN DE RESULTADOS
- Porcentaje de confianza: Indica la certeza del sistema
  * 0-50%: Baja confianza
  * 51-75%: Confianza media
  * 76-100%: Alta confianza
- Emoción predominante: La emoción más frecuente en la sesión
- Distribución temporal: Gráfico de cómo cambian las emociones

═══════════════════════════════════════════════════════

7. GENERACIÓN DE REPORTES

7.1 TIPOS DE REPORTES
- Reporte Individual: Análisis completo de un paciente
- Reporte de Sesión: Detalle de una sesión específica
- Reporte de Progreso: Evolución del paciente en el tiempo
- Estadísticas Generales: Resumen de todos los pacientes

7.2 GENERAR REPORTE
1. Vaya a "Informes y Estadísticas"
2. Seleccione el tipo de reporte
3. Configure filtros (fechas, paciente, tipo de emoción)
4. Haga clic en "Generar Reporte"
5. El reporte se puede:
   - Visualizar en pantalla
   - Descargar en PDF
   - Imprimir
   - Compartir por email

═══════════════════════════════════════════════════════

8. CONFIGURACIÓN DEL SISTEMA

8.1 PERFIL DE USUARIO
- Actualice sus datos personales
- Cambie su contraseña
- Configure su especialización

8.2 PREFERENCIAS DEL SISTEMA
- Modo Oscuro: Active/desactive el tema oscuro
- Notificaciones por Email: Configure alertas por correo
- Idioma: Seleccione su idioma preferido
- Duración de sesión por defecto

8.3 SEGURIDAD
- Inicio de sesión automático
- Tiempo de inactividad antes de cerrar sesión
- Autenticación de dos factores (recomendado)

8.4 PRIVACIDAD
- Todos los datos están encriptados
- Cumplimiento con normativas de protección de datos
- Gestión de consentimientos de pacientes

═══════════════════════════════════════════════════════

SOPORTE TÉCNICO

Si tiene dudas o problemas:
- Email: soporte@analisisemocional.com
- Teléfono: +52 (XXX) XXX-XXXX
- Horario: Lunes a Viernes, 9:00 - 18:00 hrs

═══════════════════════════════════════════════════════

VERSIÓN 1.0 - Noviembre 2025
© Sistema de Análisis Emocional - Todos los derechos reservados
`
  },
  'plantilla-evaluacion.pdf': {
    titulo: 'Plantilla de Evaluación Emocional',
    contenido: `
PLANTILLA DE EVALUACIÓN EMOCIONAL
Formato Estándar para Registro de Sesiones

═══════════════════════════════════════════════════════

DATOS DEL PACIENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nombre completo: _____________________________________________

Fecha de nacimiento: ___/___/______   Edad: _____

Género: ☐ Masculino  ☐ Femenino  ☐ Otro  ☐ Prefiero no decir

Ocupación: ___________________________________________________

Estado civil: ☐ Soltero  ☐ Casado  ☐ Divorciado  ☐ Viudo

═══════════════════════════════════════════════════════

DATOS DE LA SESIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fecha de sesión: ___/___/______   Hora: _____:_____

Número de sesión: _____   Duración: _____ minutos

Modalidad: ☐ Presencial  ☐ En línea

Psicólogo: ___________________________________________________

═══════════════════════════════════════════════════════

MOTIVO DE CONSULTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

═══════════════════════════════════════════════════════

ANÁLISIS EMOCIONAL AUTOMÁTICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMOCIONES DETECTADAS (marque las más frecuentes):

☐ Felicidad         Porcentaje: _____ %
☐ Tristeza          Porcentaje: _____ %
☐ Enojo             Porcentaje: _____ %
☐ Sorpresa          Porcentaje: _____ %
☐ Miedo             Porcentaje: _____ %
☐ Disgusto          Porcentaje: _____ %
☐ Neutral           Porcentaje: _____ %

Emoción predominante: _______________________________________

Nivel de confianza del análisis: ☐ Alto  ☐ Medio  ☐ Bajo

═══════════════════════════════════════════════════════

OBSERVACIONES DEL PSICÓLOGO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Estado general del paciente:
_____________________________________________________________
_____________________________________________________________

Lenguaje corporal observado:
_____________________________________________________________
_____________________________________________________________

Congruencia entre expresión verbal y facial:
☐ Alta  ☐ Media  ☐ Baja

Comentarios adicionales:
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

═══════════════════════════════════════════════════════

PLAN DE INTERVENCIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Técnicas aplicadas:
_____________________________________________________________
_____________________________________________________________

Ejercicios recomendados:
_____________________________________________________________
_____________________________________________________________

Tareas para la próxima sesión:
_____________________________________________________________
_____________________________________________________________

═══════════════════════════════════════════════════════

EVALUACIÓN DE PROGRESO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mejoría observada:  ☐ Significativa  ☐ Moderada  ☐ Leve  ☐ Ninguna

Comparación con sesión anterior:
_____________________________________________________________
_____________________________________________________________

═══════════════════════════════════════════════════════

PRÓXIMA SESIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fecha programada: ___/___/______   Hora: _____:_____

Objetivos para siguiente sesión:
_____________________________________________________________
_____________________________________________________________

═══════════════════════════════════════════════════════

FIRMA Y AUTORIZACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Firma del psicólogo: _________________________________________

Fecha: ___/___/______

═══════════════════════════════════════════════════════

NOTAS CONFIDENCIALES
Este documento contiene información confidencial protegida por 
el secreto profesional. Su uso está restringido exclusivamente 
al psicólogo tratante.

Versión 1.0 - Sistema de Análisis Emocional
`
  },
  'protocolo-analisis.pdf': {
    titulo: 'Protocolo de Análisis Emocional',
    contenido: `
PROTOCOLO TÉCNICO DE ANÁLISIS EMOCIONAL
Documento Técnico y Metodológico

═══════════════════════════════════════════════════════

ÍNDICE
1. Fundamento Teórico
2. Metodología de Análisis
3. Tecnología Implementada
4. Protocolo de Captura
5. Interpretación de Resultados
6. Consideraciones Éticas
7. Limitaciones y Alcances

═══════════════════════════════════════════════════════

1. FUNDAMENTO TEÓRICO

1.1 Base Científica
El sistema se fundamenta en la teoría de las emociones básicas 
de Paul Ekman, que identifica 7 emociones universales:

• Felicidad (Happiness)
• Tristeza (Sadness)
• Enojo (Anger)
• Sorpresa (Surprise)
• Miedo (Fear)
• Disgusto (Disgust)
• Neutral (Neutral)

1.2 Expresiones Faciales
Cada emoción se manifiesta mediante patrones específicos en:
- Movimiento de cejas
- Apertura de ojos
- Arrugas en frente
- Posición de boca
- Tensión muscular facial

═══════════════════════════════════════════════════════

2. METODOLOGÍA DE ANÁLISIS

2.1 Proceso de Detección
El análisis sigue estos pasos:

PASO 1: Captura de Imagen
- Frecuencia: 30 fps (frames por segundo)
- Resolución mínima: 640x480 píxeles
- Iluminación: Recomendada luz natural o artificial difusa

PASO 2: Detección Facial
- Localización del rostro en la imagen
- Identificación de puntos clave faciales (68 landmarks)
- Normalización de posición y escala

PASO 3: Extracción de Características
- Análisis de regiones específicas del rostro
- Cálculo de vectores de características
- Preprocesamiento de datos

PASO 4: Clasificación Emocional
- Aplicación del modelo de Machine Learning
- Cálculo de probabilidades para cada emoción
- Determinación de emoción predominante

2.2 Criterios de Validación
Para considerar una detección válida:
✓ Confianza mínima: 60%
✓ Rostro visible al menos 70%
✓ Condiciones de iluminación adecuadas
✓ Ausencia de oclusiones significativas

═══════════════════════════════════════════════════════

3. TECNOLOGÍA IMPLEMENTADA

3.1 Arquitectura del Sistema
- Frontend: Angular 18
- Backend: Python Flask
- Modelo IA: FER (Facial Expression Recognition)
- Base de datos: SQLite/PostgreSQL

3.2 Modelo de IA
Características del modelo FER:
- Arquitectura: CNN (Convolutional Neural Network)
- Entrenamiento: Dataset FER2013
- Precisión: ~70% en condiciones óptimas
- Tiempo de respuesta: <50ms por frame

3.3 Procesamiento
- Biblioteca: OpenCV para procesamiento de imagen
- Detección facial: Haarcascade / DNN
- Framework: TensorFlow/Keras

═══════════════════════════════════════════════════════

4. PROTOCOLO DE CAPTURA

4.1 Preparación del Entorno
Antes de iniciar una sesión:

□ Verificar iluminación adecuada
□ Posicionar cámara a la altura de los ojos
□ Distancia recomendada: 50-70 cm
□ Fondo preferiblemente neutro
□ Sin objetos que obstruyan el rostro

4.2 Instrucciones al Paciente
Indicar al paciente:
- Mantener el rostro visible a la cámara
- Evitar movimientos bruscos
- No tapar la cara con las manos
- Expresarse naturalmente

4.3 Durante la Sesión
El sistema registra:
- Emociones detectadas cada 2 segundos
- Porcentaje de confianza
- Marca temporal
- Contexto de la conversación (notas del psicólogo)

═══════════════════════════════════════════════════════

5. INTERPRETACIÓN DE RESULTADOS

5.1 Lectura de Datos
Porcentaje de Confianza:
• 0-50%: Baja confianza - Usar con precaución
• 51-75%: Confianza media - Considerar contexto
• 76-100%: Alta confianza - Dato confiable

5.2 Análisis de Patrones
Buscar:
- Emociones recurrentes
- Cambios súbitos de emoción
- Duración de estados emocionales
- Correlación con temas de conversación

5.3 Integración Clínica
Los datos del sistema DEBEN integrarse con:
✓ Observación clínica directa
✓ Expresiones verbales
✓ Lenguaje corporal
✓ Contexto del paciente
✓ Historial clínico

IMPORTANTE: El sistema es una herramienta de apoyo, 
NO reemplaza el juicio clínico profesional.

═══════════════════════════════════════════════════════

6. CONSIDERACIONES ÉTICAS

6.1 Consentimiento Informado
Antes de usar el sistema:
☑ Explicar funcionamiento al paciente
☑ Obtener consentimiento por escrito
☑ Informar sobre grabación y análisis
☑ Garantizar confidencialidad
☑ Derecho a rehusarse

6.2 Privacidad y Datos
- Encriptación de datos en tránsito y reposo
- Almacenamiento seguro
- Acceso restringido al psicólogo tratante
- Cumplimiento GDPR y legislación local
- Política de retención de datos

6.3 Uso Responsable
El psicólogo se compromete a:
- Usar datos solo con fines terapéuticos
- No compartir información sin autorización
- Mantener actualización profesional
- Reportar problemas técnicos
- Seguir código ético profesional

═══════════════════════════════════════════════════════

7. LIMITACIONES Y ALCANCES

7.1 Limitaciones Técnicas
• Dependencia de calidad de imagen
• Afectado por iluminación extrema
• Dificultad con barba densa o maquillaje
• Menor precisión con gafas oscuras
• Sesgos en ciertos grupos demográficos

7.2 Limitaciones Clínicas
• No detecta emociones complejas
• Puede confundir expresiones similares
• No considera contexto cultural
• No reemplaza evaluación clínica completa
• Requiere interpretación profesional

7.3 Mejores Prácticas
Para optimizar resultados:
✓ Calibrar sistema antes de cada sesión
✓ Verificar condiciones de captura
✓ Triangular con otras fuentes de información
✓ Documentar observaciones cualitativas
✓ Actualizar sistema regularmente

═══════════════════════════════════════════════════════

REFERENCIAS

[1] Ekman, P. (1992). An argument for basic emotions. 
    Cognition & Emotion, 6(3-4), 169-200.

[2] Goodfellow, I. J., et al. (2013). Challenges in 
    representation learning: A report on three machine 
    learning contests. Neural Networks, 64, 59-63.

[3] Facial Action Coding System (FACS). Paul Ekman Group.

═══════════════════════════════════════════════════════

ACTUALIZACIONES

Versión 1.0 - Noviembre 2025
- Primera versión del protocolo

Para consultas técnicas:
Email: soporte.tecnico@analisisemocional.com

═══════════════════════════════════════════════════════

© Sistema de Análisis Emocional - Documento Técnico
Clasificación: Confidencial - Uso Profesional
`
  }
};

// Crear archivos de texto con el contenido (simulación de PDFs)
Object.entries(manuales).forEach(([filename, data]) => {
  const outputPath = path.join(__dirname, 'public', 'resources', filename.replace('.pdf', '.txt'));
  
  const contenidoCompleto = `
${data.titulo.toUpperCase()}
${'='.repeat(data.titulo.length + 10)}

${data.contenido}
`;

  fs.writeFileSync(outputPath, contenidoCompleto, 'utf-8');
  console.log(`✓ Creado: ${filename}`);
});

console.log('\n✅ Todos los manuales han sido generados exitosamente');
console.log('📁 Ubicación: emotion-detector/public/resources/');
console.log('\n📌 Nota: Los archivos .txt contienen el contenido completo.');
console.log('   Para generar PDFs reales, instala jspdf: npm install jspdf');
