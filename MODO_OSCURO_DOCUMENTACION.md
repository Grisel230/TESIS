# 🌙 Modo Oscuro Global - Documentación

## ✅ Implementación Completada

Se ha implementado un **sistema de modo oscuro global** que afecta a toda la aplicación de forma coherente y estética.

## 🎯 Características

### 1. **Modo Oscuro Global**
- El modo oscuro se aplica a **todas las páginas del sistema**
- La preferencia se guarda en localStorage y persiste entre sesiones
- El cambio es instantáneo y afecta todos los componentes

### 2. **Componentes Afectados**
El modo oscuro se aplica a:
- ✅ Dashboard principal
- ✅ Lista de pacientes
- ✅ Historial de sesiones
- ✅ Informes y estadísticas
- ✅ Recursos
- ✅ Configuración
- ✅ Todos los formularios
- ✅ Modales y popups
- ✅ Tablas de datos
- ✅ Gráficos y estadísticas
- ✅ Sidebar de navegación

### 3. **Paleta de Colores en Modo Oscuro**
```
Fondo principal:    #000000 (Negro puro)
Contenido:          #1a1a1a (Gris muy oscuro)
Secciones/Cards:    #252525 (Gris oscuro)
Texto principal:    #ffffff (Blanco)
Texto secundario:   #e5e5e5 (Gris claro)
Texto terciario:    #cccccc (Gris medio)
Bordes:             #333333 (Gris)
Sidebar:            #0f1f5c (Azul oscuro - mantiene identidad)
Links:              #60a5fa (Azul claro)
Inputs:             #1a1a1a con borde #444444
```

### 4. **Botones en Modo Oscuro**
```
Primario:   #1e40af → hover #1e3a8a
Secundario: #374151 → hover #4b5563
Éxito:      #059669 → hover #047857
Peligro:    #dc2626 → hover #b91c1c
```

## 📁 Archivos Modificados/Creados

### Nuevo Servicio
- **`src/app/services/theme.service.ts`**
  - Servicio global que maneja el estado del modo oscuro
  - Sincroniza con localStorage
  - Aplica/remueve la clase `dark-mode` del body
  - Compatible con SSR (Server Side Rendering)

### Archivos Modificados
1. **`src/styles.scss`**
   - Agregados ~400+ líneas de estilos globales para modo oscuro
   - Selectores con `body.dark-mode`
   - Cobertura completa de todos los elementos

2. **`src/app/app.component.ts`**
   - Inyecta ThemeService para inicializarlo
   - Se ejecuta al cargar la aplicación

3. **`src/app/components/configuracion/configuracion.component.ts`**
   - Usa ThemeService en lugar de localStorage directamente
   - Sincroniza el toggle con el servicio global

4. **`src/app/components/configuracion/configuracion.component.html`**
   - Toggle de modo oscuro llama a `toggleDarkMode()`
   - Removida sección de "Respaldo Automático"

5. **`src/app/components/configuracion/configuracion.component.css`**
   - Mantiene estilos locales específicos

## 🔧 Cómo Usar

### Para el Usuario
1. Ir a **Configuración** → **Configuración del Sistema**
2. Activar el toggle de **"Modo Oscuro"**
3. El cambio se aplica inmediatamente en toda la aplicación
4. La preferencia se guarda automáticamente

### Para Desarrolladores

#### Usar el Servicio de Tema
```typescript
import { ThemeService } from './services/theme.service';

constructor(private themeService: ThemeService) {}

// Activar modo oscuro
this.themeService.setDarkMode(true);

// Desactivar modo oscuro
this.themeService.setDarkMode(false);

// Alternar modo oscuro
this.themeService.toggleDarkMode();

// Obtener estado actual
const isDark = this.themeService.isDarkMode();

// Suscribirse a cambios
this.themeService.darkMode$.subscribe(isDark => {
  console.log('Modo oscuro:', isDark);
});
```

#### Agregar Estilos Personalizados para Modo Oscuro
En tu archivo de componente CSS/SCSS:
```css
/* Estilos normales */
.mi-elemento {
  background: white;
  color: black;
}

/* Estilos en modo oscuro - se agregan en styles.scss global */
body.dark-mode .mi-elemento {
  background: #1a1a1a;
  color: white;
}
```

## ✨ Beneficios

1. **Experiencia de Usuario Mejorada**
   - Reduce la fatiga visual en ambientes con poca luz
   - Apariencia moderna y profesional
   - Consistencia visual en toda la aplicación

2. **Accesibilidad**
   - Mejor para usuarios con sensibilidad a la luz
   - Alto contraste para mejor legibilidad
   - Reduce el brillo de la pantalla

3. **Profesionalismo**
   - Feature moderno esperado en aplicaciones actuales
   - Personalización según preferencias del usuario

## 🎨 Diseño Estético

El modo oscuro ha sido diseñado para:
- ✅ Mantener alta legibilidad con contraste adecuado
- ✅ Usar tonos de negro/gris que no cansen la vista
- ✅ Preservar la identidad visual (sidebar azul)
- ✅ Hacer que los elementos interactivos sean obvios
- ✅ Aplicar sombras sutiles que funcionen en fondo oscuro
- ✅ Mantener jerarquía visual clara

## 🔍 Verificación

Para verificar que el modo oscuro funciona correctamente:

1. Abrir la aplicación en el navegador
2. Ir a Configuración
3. Activar el modo oscuro
4. Navegar por todas las páginas:
   - Dashboard
   - Pacientes
   - Sesiones
   - Informes
   - Recursos
5. Verificar que todo se vea bien
6. Recargar la página - el modo oscuro debe persistir
7. Desactivar y verificar que vuelve al modo claro

## 📝 Notas Técnicas

- El servicio es **singleton** (`providedIn: 'root'`)
- Compatible con **Angular SSR** (verifica isPlatformBrowser)
- Usa **BehaviorSubject** para estado reactivo
- **localStorage** para persistencia
- Clase CSS **global** en body para fácil control

## 🚀 Próximas Mejoras Posibles

- [ ] Detección automática de preferencia del sistema (prefers-color-scheme)
- [ ] Transiciones suaves al cambiar de tema
- [ ] Temas personalizados adicionales
- [ ] Preview del tema antes de aplicar
- [ ] Modo automático (claro de día, oscuro de noche)
