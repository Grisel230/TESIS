# PALETA DE COLORES PROFESIONAL - MODO OSCURO
## Aplicada a TODO el proyecto emotion-detector

### 🎨 COLORES PRINCIPALES

#### **SIDEBAR (SIEMPRE IGUAL)**
- `background: #1e40af` - Azul profesional
- `border-right: rgba(255,255,255,0.1)` - Borde sutil blanco
- `color: white` - Texto blanco

#### **FONDOS**
```css
/* Fondo principal de la aplicación */
.dashboard-container.dark-mode {
  background: #0d1117;  /* GitHub Dark - Más oscuro */
}

/* Contenido principal */
.dark-mode .main-content {
  background: #0d1117;  /* Mismo que container */
}

/* Cards, formularios, contenedores */
.dark-mode .card,
.dark-mode .form-container,
.dark-mode .stat-card,
.dark-mode .report-card {
  background: #161b22;  /* Un tono más claro */
  border: 1px solid #30363d;
}

/* Inputs, selects, textareas */
.dark-mode input,
.dark-mode select,
.dark-mode textarea {
  background: #21262d;  /* Aún más claro para interacción */
  border: 1px solid #30363d;
  color: #f0f6fc;
}
```

#### **BORDES**
- `#30363d` - Bordes principales (cards, inputs)
- `#484f58` - Bordes hover/activos
- `rgba(255,255,255,0.1)` - Bordes sutiles (sidebar, headers)

#### **TEXTOS**
```css
/* Títulos principales */
h1 { color: #58a6ff !important; }  /* Azul brillante */

/* Títulos secundarios */
h2, h3 { color: #58a6ff !important; }

/* Texto normal */
p, span, label { color: #f0f6fc; }  /* Blanco suave */

/* Texto secundario */
.text-secondary { color: #8b949e; }  /* Gris */
```

#### **ACENTOS Y ESTADOS**
- `#58a6ff` - Azul (títulos, enlaces, acciones principales)
- `#238636` - Verde (success, confirmaciones)
- `#d29922` - Amarillo (warnings, pendiente)
- `#da3633` - Rojo (errores, eliminar)

### ✅ COMPONENTES ESTANDARIZADOS
- [x] Dashboard
- [x] Nuevo Paciente
- [x] Lista Pacientes
- [x] Recursos
- [x] Historial Sesiones
- [x] Informes y Estadísticas
- [x] Configuración
- [x] Registro Pacientes
- [x] Detalle Sesión

### 🎯 RESULTADO
- **Sidebar**: SIEMPRE azul #1e40af (no cambia entre páginas)
- **Fondos**: Consistentes en toda la app
- **Textos**: Legibles y uniformes
- **Visual**: Profesional y limpio estilo GitHub Dark
