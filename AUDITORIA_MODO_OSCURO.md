# AUDITORÍA COMPLETA DE MODO OSCURO

## 🎨 PALETA ESTANDARIZADA (GitHub Dark)

### Colores que DEBEN usarse:
```css
/* Fondos */
--bg-primary: #0d1117      /* Fondo principal del dashboard */
--bg-elevated: #161b22     /* Cards, paneles elevados */
--bg-hover: #21262d        /* Estados hover */
--bg-input: #0d1117        /* Inputs y controles */

/* Bordes */
--border-default: #30363d  /* Bordes principales */
--border-hover: #484f58    /* Bordes en hover */

/* Textos */
--text-primary: #f0f6fc    /* Texto principal */
--text-secondary: #8b949e  /* Texto secundario */
--text-muted: #6e7681      /* Texto atenuado */

/* Acentos */
--accent-blue: #58a6ff     /* Azul principal (títulos, enlaces) */
--accent-green: #238636    /* Verde (éxito, guardar) */
--accent-red: #da3633      /* Rojo (error, eliminar) */
--accent-yellow: #d29922   /* Amarillo (advertencia) */
```

## ❌ INCONSISTENCIAS ENCONTRADAS

### 1. **lista-pacientes.component.css**
- ❌ Usa: `background: #000000` (demasiado oscuro)
- ❌ Usa: `background: #1a1a1a` (incorrecto)
- ❌ Usa: `background: #252525` (incorrecto)
- ❌ Usa: `background: #333333` (incorrecto)
- ✅ Debería usar: #0d1117, #161b22, #21262d, #30363d

### 2. **historial-sesiones.component.css**
- ❌ Usa: `background: #1a1a1a` (incorrecto)
- ❌ Usa: `background: #252525` (incorrecto)
- ❌ Usa: `background: #333333` (incorrecto)
- ✅ Debería usar: #0d1117, #161b22, #21262d, #30363d

### 3. **configuracion.component.css**
- ❌ Usa: `background: #1a1a1a` (incorrecto)
- ❌ Usa: `background: #252525` (incorrecto)
- ❌ Usa: `background: #333333` (incorrecto)
- ✅ Debería usar: #0d1117, #161b22, #21262d, #30363d

### 4. **nuevo-paciente.component.css**
- ⚠️ No tiene estilos completos de modo oscuro
- Necesita implementación completa

### 5. **detalle-sesion.component.css**
- ⚠️ Revisar implementación de modo oscuro
- Verificar consistencia

## 📏 ESPACIADO ESTANDARIZADO

### Contenedores principales:
```css
.dashboard-container {
  padding: 0;  /* Sin padding en contenedor principal */
}

.main-content {
  padding: 0;  /* Sin padding directo */
}

.page-title {
  padding: 40px 32px 20px;  /* Top, Lateral, Bottom */
}

.patients-card, .sessions-card, etc {
  margin: 24px 32px 32px;  /* Top, Lateral, Bottom */
  padding: 0;  /* Sin padding interno directo */
}

.card-header {
  padding: 24px 32px;  /* Uniforme */
}

.card-body {
  padding: 24px 32px;  /* Uniforme */
}
```

### Formularios:
```css
.form-group {
  margin-bottom: 20px;  /* Espaciado uniforme */
}

input, select, textarea {
  padding: 12px 16px;  /* Uniforme */
}
```

## 🔧 CORRECCIONES NECESARIAS

### Prioridad ALTA:
1. ✅ Reemplazar todos los #1a1a1a → #161b22
2. ✅ Reemplazar todos los #252525 → #21262d  
3. ✅ Reemplazar todos los #333333 → #30363d
4. ✅ Reemplazar todos los #000000 → #0d1117
5. ✅ Estandarizar padding de .page-title
6. ✅ Estandarizar margin de cards principales
7. ✅ Estandarizar padding de .card-header y .card-body

### Prioridad MEDIA:
8. ⏳ Verificar estilos de inputs en todos los componentes
9. ⏳ Unificar estilos de botones
10. ⏳ Estandarizar efectos hover
11. ⏳ Verificar scrollbars personalizados

### Prioridad BAJA:
12. ⏳ Optimizar transiciones
13. ⏳ Revisar sombras (box-shadow)
14. ⏳ Verificar iconos y SVGs

## 📝 COMPONENTES ANALIZADOS

- ✅ lista-pacientes.component.css
- ✅ historial-sesiones.component.css  
- ✅ configuracion.component.css
- ✅ registro-pacientes.component.css
- ✅ recursos.component.css
- ✅ informes-estadisticas.component.css
- ⏳ nuevo-paciente.component.css (pendiente revisión completa)
- ⏳ detalle-sesion.component.css (pendiente revisión completa)
- ⏳ dashboard.component.css (pendiente revisión completa)
