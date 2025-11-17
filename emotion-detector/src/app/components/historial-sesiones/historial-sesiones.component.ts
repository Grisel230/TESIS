import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService, Sesion } from '../../services/session.service';
import { Psicologo } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

// Definir una interfaz para la estructura de datos de la sesión
export interface Session {
  id: string;
  fecha: string;
  hora: string;
  paciente: string;
  edad: number;
  diagnostico: string;
  duracion: string;
  emocionPredominante: string;
  confianza: number;
  notasSesion?: string;
  // Puedes añadir más propiedades según necesites (ej: id de paciente, id de sesion, etc.)
}


@Component({
  selector: 'app-historial-sesiones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-sesiones.component.html',
  styleUrls: ['./historial-sesiones.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HistorialSesionesComponent implements OnInit {
  // Datos del psicólogo logueado
  psicologo: Psicologo | null = null;
  sidebarVisible: boolean = true; // Control de visibilidad del sidebar
  isDarkMode: boolean = false; // Control del modo oscuro

  // Propiedades para los filtros
  filterFechaDesde: string = '';
  filterFechaHasta: string = '';
  filterPaciente: string = '';
  filterEmocion: string = 'Todas las emociones'; // Valor por defecto para el selector

  // Lista de emociones disponibles para el filtro
  emotions: string[] = ['Todas las emociones', 'angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise'];

  // Datos de sesiones desde el backend
  allSessions: Session[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  // Sesiones que se muestran en la tabla después de aplicar filtros
  filteredSessions: Session[] = [];

  // Propiedades para la paginación
  currentPage: number = 1;
  itemsPerPage: number = 10; // Valor por defecto
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    // Suscribirse a los cambios de tema
    this.themeService.darkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });

    // Cargar datos del psicólogo desde localStorage
    const psicologoData = localStorage.getItem('psicologo');
    if (psicologoData) {
      this.psicologo = JSON.parse(psicologoData);
      this.loadSessions();
    } else {
      this.errorMessage = 'No se encontró información del psicólogo';
    }
  }

  loadSessions(): void {
    if (!this.psicologo?.id) {
      this.errorMessage = 'ID del psicólogo no disponible';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.sessionService.obtenerSesiones(this.psicologo.id).subscribe({
      next: (response) => {
        console.log('Sesiones cargadas del backend:', response);
        
        let backendSessions: Session[] = [];
        if (response.sesiones && Array.isArray(response.sesiones)) {
          backendSessions = response.sesiones.map((sesion: Sesion) => {
            const fecha = new Date(sesion.fecha_sesion);
            return {
              id: sesion.id?.toString() || '',
              fecha: fecha.toLocaleDateString('es-ES'),
              hora: fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              paciente: sesion.paciente_nombre || 'Paciente desconocido',
              edad: 0, // No disponible en el backend actual
              diagnostico: 'No especificado', // No disponible en el backend actual
              duracion: `${sesion.duracion_minutos} minutos`,
              emocionPredominante: sesion.emocion_predominante || 'neutral',
              confianza: sesion.confianza_promedio || 0
            };
          });
        }

        // Cargar sesiones guardadas desde localStorage
        const savedSessions = this.loadSavedSessions();
        
        // Combinar ambas listas
        this.allSessions = [...backendSessions, ...savedSessions];
        this.applyFilters();
        this.isLoading = false;
        
        console.log('Total de sesiones cargadas:', this.allSessions.length);
      },
      error: (error) => {
        console.error('Error al cargar sesiones del backend:', error);
        
        // Si hay error en el backend, cargar solo las sesiones guardadas
        const savedSessions = this.loadSavedSessions();
        this.allSessions = savedSessions;
        this.applyFilters();
        this.isLoading = false;
        
        if (savedSessions.length === 0) {
          this.errorMessage = 'No se pudieron cargar las sesiones';
        }
      }
    });
  }

  // Método para obtener el primer nombre del psicólogo
  getFirstName(): string {
    if (this.psicologo?.nombre_completo) {
      return this.psicologo.nombre_completo.split(' ')[0];
    }
    return 'Doctor';
  }

  private loadSavedSessions(): Session[] {
    try {
      const savedSessionsData = localStorage.getItem('sesiones_guardadas');
      if (!savedSessionsData) return [];

      const savedSessions = JSON.parse(savedSessionsData);
      return savedSessions.map((session: any) => {
        const fecha = new Date(session.fecha);
        return {
          id: session.id?.toString() || '',
          fecha: fecha.toLocaleDateString('es-ES'),
          hora: fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          paciente: session.paciente?.nombre || 'Paciente desconocido',
          edad: session.paciente?.edad || 0,
          diagnostico: session.diagnostico || 'No especificado',
          duracion: session.duracion || '0:00',
          emocionPredominante: session.emocionPredominante || 'neutral',
          confianza: 0, // No disponible en sesiones guardadas
          notasSesion: session.notas || ''
        };
      });
    } catch (error) {
      console.error('Error al cargar sesiones guardadas:', error);
      return [];
    }
  }

  // Método para cerrar sesión
  logout() {
    // Limpiar datos del localStorage
    localStorage.removeItem('psicologo');
    console.log('Usuario ha cerrado sesión desde Historial');
    // Redirigir a la página de inicio de sesión
    this.router.navigate(['/inicio-sesion']);
  }

  // Método para navegar al dashboard
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  // Método para navegar a la lista de pacientes
  goToPacientes() {
    this.router.navigate(['/pacientes']);
  }

  // Método para navegar a agregar nuevo paciente
  goToNuevoPaciente() {
    this.router.navigate(['/nuevo-paciente']);
  }

  // Método para toggle del sidebar
  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  // Navegación
  goToSesiones(): void {
    this.router.navigate(['/historial-sesiones']);
  }


  goToSettings(): void {
    this.router.navigate(['/configuracion']);
  }

  goToReports(): void {
    this.router.navigate(['/informes-estadisticas']);
  }

  goToResources(): void {
    this.router.navigate(['/recursos']);
  }

  // Método para obtener el índice final de la paginación
  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  // Método para aplicar los filtros y actualizar la tabla (ahora con paginación)
  applyFilters(): void {
    let tempSessions = this.allSessions;

    // Filtrar por nombre del paciente (búsqueda parcial, insensible a mayúsculas/minúsculas)
    if (this.filterPaciente) {
      tempSessions = tempSessions.filter(session =>
        session.paciente.toLowerCase().includes(this.filterPaciente.toLowerCase())
      );
    }

    // Filtrar por emoción predominante
    if (this.filterEmocion !== 'Todas las emociones') {
      tempSessions = tempSessions.filter(session =>
        session.emocionPredominante.toLowerCase() === this.filterEmocion.toLowerCase()
      );
    }

    // Filtrar por rango de fechas
    if (this.filterFechaDesde || this.filterFechaHasta) {
      tempSessions = tempSessions.filter(session => {
        // Parsear la fecha de la sesión (formato: "dd/mm/yyyy" o similar)
        const sessionDate = this.parseDateString(session.fecha);
        
        if (!sessionDate) return true; // Si no se puede parsear, incluir la sesión

        // Comparar con fecha desde
        if (this.filterFechaDesde) {
          const fechaDesde = new Date(this.filterFechaDesde);
          fechaDesde.setHours(0, 0, 0, 0);
          if (sessionDate < fechaDesde) return false;
        }

        // Comparar con fecha hasta
        if (this.filterFechaHasta) {
          const fechaHasta = new Date(this.filterFechaHasta);
          fechaHasta.setHours(23, 59, 59, 999);
          if (sessionDate > fechaHasta) return false;
        }

        return true;
      });
    }

    // Después de aplicar filtros, configurar la paginación
    this.totalItems = tempSessions.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Asegurarse de que la página actual sea válida
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages;
    } else if (this.currentPage <= 0 && this.totalPages > 0) {
        this.currentPage = 1;
    }
    if(this.totalPages === 0) {
        this.currentPage = 1; // Si no hay ítems, mostrar página 1 (vacía)
    }

    // Calcular el rango de ítems para la página actual
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    // Actualizar las sesiones mostradas (aplicando paginación)
    this.filteredSessions = tempSessions.slice(startIndex, endIndex);
  }

  // Método auxiliar para parsear fechas en formato español
  private parseDateString(dateStr: string): Date | null {
    try {
      // Intentar parsear formato "dd/mm/yyyy" o "d/m/yyyy"
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Los meses en JS van de 0-11
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
      
      // Si no funciona, intentar parsear directamente
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error('Error al parsear fecha:', dateStr, error);
      return null;
    }
  }

  // Método para limpiar todos los filtros
  clearFilters(): void {
    this.filterFechaDesde = '';
    this.filterFechaHasta = '';
    this.filterPaciente = '';
    this.filterEmocion = 'Todas las emociones';
    this.currentPage = 1;
    this.applyFilters();
  }

  // Métodos para cambiar de página
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters(); // Re-aplicar filtros (y paginación) para la nueva página
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters(); // Re-aplicar filtros (y paginación) para la nueva página
    }
  }

  goToPage(page: number): void {
      if (page >= 1 && page <= this.totalPages) {
          this.currentPage = page;
          this.applyFilters();
      }
  }

  // Método para cambiar la cantidad de ítems por página
  onItemsPerPageChange(): void {
      this.currentPage = 1; // Volver a la primera página al cambiar la cantidad de ítems
      this.applyFilters(); // Re-aplicar filtros con la nueva cantidad de ítems por página
  }

  // Método para obtener emoji (puedes reutilizar el del componente de registro)
  getEmotionEmoji(emotion: string): string {
    const emojis: { [key: string]: string } = {
      'angry': '😠',
      'disgust': '🤢',
      'fear': '😨',
      'happy': '😊',
      'neutral': '😐',
      'sad': '😢',
      'surprise': '😲'
    };
    return emojis[emotion] || '❓';
  }

  // TODO: Implementar lógica para los botones de 'ver detalle' y 'descargar'
  viewDetails(session: Session): void {
    console.log('Navegando a detalles de la sesión:', session.id);
    // Navegar a la página de detalle de sesión, pasando el ID de la sesión
    this.router.navigate(['/detalle-sesion', session.id]);
  }

  downloadSession(session: Session): void {
    console.log('Preparando descarga para la sesión:', session.id);
    // Lógica para generar y descargar un archivo (ej: CSV simple)
    const sessionDetails = `Fecha: ${session.fecha}\nHora: ${session.hora}\nPaciente: ${session.paciente}\nEdad: ${session.edad}\nDiagnóstico: ${session.diagnostico}\nDuración: ${session.duracion}\nEmoción Predominante: ${session.emocionPredominante} (${(session.confianza * 100).toFixed(1)}%)`;
    
    const blob = new Blob([sessionDetails], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_sesion_${session.id}.txt`; // Nombre del archivo de descarga
    a.click();
    window.URL.revokeObjectURL(url); // Limpiar el objeto URL
    
    alert(`Reporte de sesión ${session.id} descargado (ejemplo).`);
  }

  goToLogin(): void {
    this.router.navigate(['/inicio-sesion']);
  }

} 