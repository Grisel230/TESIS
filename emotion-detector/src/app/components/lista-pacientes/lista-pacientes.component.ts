import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService, PacienteResponse } from '../../services/patient.service';
import { AuthService, Psicologo } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

// Usar la interfaz del servicio
export interface Patient extends PacienteResponse {
  edad: number;
  genero: string;
  sesiones: number;
}

@Component({
  selector: 'app-lista-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-pacientes.component.html',
  styleUrls: ['./lista-pacientes.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ListaPacientesComponent implements OnInit {
  // Datos del psicólogo logueado
  psicologo: Psicologo | null = null;
  sidebarVisible: boolean = true;
  isDarkMode = false;

  // Propiedades para los filtros
  filterNombre: string = '';
  filterEdad: string = '';
  filterGenero: string = 'Todos';

  // Lista de géneros disponibles para el filtro
  generos: string[] = ['Todos', 'Masculino', 'Femenino', 'Otro'];

  // Lista de pacientes desde el backend
  allPatients: Patient[] = [];

  // Pacientes que se muestran en la tabla después de aplicar filtros
  filteredPatients: Patient[] = [];

  // Propiedades para la paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // Estados de carga
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  showDeleteModal: boolean = false;
  patientToDelete: Patient | null = null;

  constructor(
    private router: Router,
    private patientService: PatientService,
    private authService: AuthService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    // Configurar tema oscuro
    this.isDarkMode = this.themeService.isDarkMode();
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    
    // Verificar autenticación usando AuthService
    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'No estás autenticado. Redirigiendo al login...';
      console.error('Usuario no autenticado');
      setTimeout(() => {
        this.router.navigate(['/inicio-sesion']);
      }, 2000);
      return;
    }

    // Obtener datos del psicólogo desde AuthService
    this.psicologo = this.authService.getPsicologo();
    
    if (this.psicologo) {
      console.log('👤 Psicólogo autenticado:', this.psicologo);
      this.loadPatients();
      
      // Debug: Verificar datos en localStorage
      this.debugLocalStorageData();
      
      // Actualizar contadores de sesiones después de cargar pacientes
      setTimeout(() => {
        this.updateSessionCounts();
      }, 100);
    } else {
      this.errorMessage = 'No se encontró información del psicólogo';
      console.error('No hay datos del psicólogo disponibles');
    }
  }

  // Método para cargar pacientes desde el backend
  loadPatients(): void {
    if (!this.psicologo?.id) {
      this.errorMessage = 'ID del psicólogo no disponible';
      console.error('No hay ID del psicólogo disponible');
      return;
    }

    // Verificar que existe el token de autenticación usando AuthService
    const token = this.authService.getToken();
    if (!token) {
      this.errorMessage = 'No se encontró token de autenticación. Por favor, inicia sesión nuevamente.';
      console.error('No hay token de autenticación');
      // Redirigir al login después de un momento
      setTimeout(() => {
        this.authService.logout();
      }, 2000);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('🔑 Token encontrado, cargando pacientes...');
    console.log('📋 Token:', token.substring(0, 20) + '...');
    console.log('👤 Psicólogo ID:', this.psicologo.id);

    this.patientService.obtenerPacientes(this.psicologo.id).subscribe({
      next: (response) => {
        if (response.pacientes && Array.isArray(response.pacientes)) {
          // Mapear los datos del backend a la interfaz Patient
          this.allPatients = response.pacientes.map((paciente: PacienteResponse) => {
            return {
              ...paciente,
              sesiones: this.getSessionCountForPatient(paciente.id)
            };
          });
        } else {
          this.allPatients = [];
        }
        
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar pacientes:', error);
        
        // Manejo de errores más específico
        if (error.status === 401) {
          this.errorMessage = 'Sesión expirada. Redirigiendo al login...';
          console.error('Token inválido o expirado');
          // Cerrar sesión automáticamente
          setTimeout(() => {
            this.authService.logout();
          }, 2000);
        } else if (error.status === 403) {
          this.errorMessage = 'No tienes permisos para acceder a esta información.';
        } else if (error.status === 404) {
          this.errorMessage = 'No se encontraron pacientes registrados.';
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión. Verifica que el servidor esté funcionando.';
        } else {
          this.errorMessage = 'Error al cargar la lista de pacientes: ' + (error.error?.error || error.message || 'Error desconocido');
        }
        
        this.isLoading = false;
      }
    });
  }

  // Método para calcular la edad desde la fecha de nacimiento
  calculateAge(fechaNacimiento: string): number {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Método para obtener el número de sesiones de un paciente específico
  getSessionCountForPatient(patientId: number): number {
    try {
      // Obtener sesiones guardadas desde localStorage
      const savedSessionsData = localStorage.getItem('sesiones_guardadas');
      if (!savedSessionsData) {
        console.log('📊 No hay sesiones guardadas en localStorage');
        return 0;
      }

      const savedSessions = JSON.parse(savedSessionsData);
      if (!Array.isArray(savedSessions)) {
        console.log('📊 Datos de sesiones no son un array válido');
        return 0;
      }

      // Obtener el nombre del paciente desde la lista de pacientes
      const paciente = this.allPatients.find(p => p.id === patientId);
      const nombrePaciente = paciente?.nombre_completo || '';

      console.log(`🔍 Buscando sesiones para paciente ID: ${patientId}, Nombre: ${nombrePaciente}`);
      console.log('📋 Todas las sesiones guardadas:', savedSessions);

      // Contar sesiones que pertenecen a este paciente
      const sessionCount = savedSessions.filter((session: any) => {
        const hasPatientId = session.paciente && session.paciente.id === patientId;
        const hasPatientName = session.paciente && session.paciente.nombre && 
          session.paciente.nombre.toLowerCase() === nombrePaciente.toLowerCase();
        
        console.log(`  - Sesión ID ${session.id}:`);
        console.log(`    * paciente.id = ${session.paciente?.id}, coincide ID = ${hasPatientId}`);
        console.log(`    * paciente.nombre = ${session.paciente?.nombre}, coincide nombre = ${hasPatientName}`);
        console.log(`    * nombre buscado = ${nombrePaciente}`);
        
        return hasPatientId || hasPatientName;
      }).length;

      console.log(`📊 Paciente ID ${patientId} (${nombrePaciente}): ${sessionCount} sesiones encontradas`);
      return sessionCount;
    } catch (error) {
      console.error('Error al contar sesiones del paciente:', error);
      return 0;
    }
  }

  // Método de debugging para verificar datos en localStorage
  debugLocalStorageData(): void {
    console.log('🔍 === DEBUG LOCALSTORAGE ===');
    
    // Verificar sesiones guardadas
    const sesionesData = localStorage.getItem('sesiones_guardadas');
    console.log('📋 Datos de sesiones guardadas:', sesionesData);
    
    if (sesionesData) {
      try {
        const sesiones = JSON.parse(sesionesData);
        console.log('📊 Número total de sesiones:', sesiones.length);
        console.log('📋 Estructura de sesiones:', sesiones);
        
        // Mostrar cada sesión individualmente
        sesiones.forEach((sesion: any, index: number) => {
          console.log(`📝 Sesión ${index + 1}:`, {
            id: sesion.id,
            paciente: sesion.paciente,
            fecha: sesion.fecha,
            diagnostico: sesion.diagnostico
          });
        });
      } catch (error) {
        console.error('❌ Error al parsear sesiones:', error);
      }
    }
    
    // Verificar pacientes
    console.log('👥 Lista de pacientes cargados:');
    this.allPatients.forEach((paciente, index) => {
      console.log(`👤 Paciente ${index + 1}:`, {
        id: paciente.id,
        nombre: paciente.nombre_completo,
        sesiones: paciente.sesiones
      });
    });
    
    console.log('🔍 === FIN DEBUG ===');
  }

  // Método para obtener el primer nombre del psicólogo
  getFirstName(): string {
    if (this.psicologo?.nombre_completo) {
      return this.psicologo.nombre_completo.split(' ')[0];
    }
    return 'Doctor';
  }

  // Método para toggle del sidebar
  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  // Navegación
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToPacientes(): void {
    this.router.navigate(['/nuevo-paciente']);
  }

  goToSesiones(): void {
    this.router.navigate(['/historial-sesiones']);
  }


  goToSettings(): void {
    this.router.navigate(['/configuracion']);
  }

  goToReports(): void {
    this.router.navigate(['/informes-estadisticas']);
  }

  logout(): void {
    this.authService.logout();
  }

  goToResources(): void {
    this.router.navigate(['/recursos']);
  }

  goToLogin(): void {
    this.router.navigate(['/inicio-sesion']);
  }

  // Método para aplicar los filtros y actualizar la tabla
  applyFilters(): void {
    let tempPatients = this.allPatients;

    // Filtrar por nombre del paciente
    if (this.filterNombre) {
      tempPatients = tempPatients.filter(patient =>
        patient.nombre_completo.toLowerCase().includes(this.filterNombre.toLowerCase())
      );
    }

    // Filtrar por edad
    if (this.filterEdad) {
      const edad = parseInt(this.filterEdad);
      tempPatients = tempPatients.filter(patient => patient.edad === edad);
    }

    // Filtrar por género
    if (this.filterGenero !== 'Todos') {
      tempPatients = tempPatients.filter(patient =>
        patient.genero === this.filterGenero
      );
    }

    // Configurar la paginación
    this.totalItems = tempPatients.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Asegurarse de que la página actual sea válida
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages;
    } else if (this.currentPage <= 0 && this.totalPages > 0) {
        this.currentPage = 1;
    }
    if(this.totalPages === 0) {
        this.currentPage = 1;
    }

    // Calcular el rango de ítems para la página actual
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    // Actualizar los pacientes mostrados
    this.filteredPatients = tempPatients.slice(startIndex, endIndex);
  }

  // Métodos para cambiar de página
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
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
      this.currentPage = 1;
      this.applyFilters();
  }

  // Método para obtener el índice final de la paginación
  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  // Método para limpiar mensajes
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Métodos para las acciones de los pacientes
  viewPatient(patient: Patient): void {
    console.log('Ver detalles del paciente:', patient.id);
    // Por ahora redirigir a la vista de detalle de sesión
    // TODO: Implementar vista de detalles del paciente
    this.router.navigate(['/detalle-sesion', patient.id]);
  }

  editPatient(patient: Patient): void {
    console.log('Editar paciente:', patient.id);
    // Guardar el paciente en localStorage para edición
    localStorage.setItem('paciente_editando', JSON.stringify(patient));
    // Redirigir a la vista de edición (usaremos nuevo-paciente con modo edición)
    this.router.navigate(['/editar-paciente', patient.id]);
  }

  addSession(patient: Patient): void {
    console.log('📷 Agregar sesión para paciente:', patient.id);
    console.log('👤 Datos del paciente:', patient);
    
    // Guardar el paciente seleccionado en localStorage
    localStorage.setItem('paciente_sesion', JSON.stringify(patient));
    console.log('💾 Datos guardados en localStorage como "paciente_sesion"');
    
    // Verificar que se guardó correctamente
    const savedData = localStorage.getItem('paciente_sesion');
    console.log('✅ Verificación - Datos guardados:', savedData);
    
    // Redirigir a la vista de registro de sesión
    this.router.navigate(['/registro-pacientes']);
    console.log('🚀 Navegando a /registro-pacientes');
  }

  // Método para actualizar el contador de sesiones de todos los pacientes
  updateSessionCounts(): void {
    this.allPatients = this.allPatients.map(patient => ({
      ...patient,
      sesiones: this.getSessionCountForPatient(patient.id)
    }));
    this.applyFilters();
  }

  deletePatient(patient: Patient): void {
    console.log('Mostrar modal de eliminación para:', patient.nombre_completo);
    this.patientToDelete = patient;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.patientToDelete = null;
  }

  confirmDelete(): void {
    if (!this.patientToDelete) return;
    
    console.log('Confirmar eliminación de paciente:', this.patientToDelete.id);
    this.isLoading = true;
    
    this.patientService.eliminarPaciente(this.patientToDelete.id).subscribe({
      next: (response) => {
        console.log('Paciente eliminado:', response);
        this.successMessage = `Paciente ${this.patientToDelete!.nombre_completo} eliminado exitosamente`;
        this.loadPatients();
        this.isLoading = false;
        this.closeDeleteModal();
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error al eliminar paciente:', error);
        this.errorMessage = 'Error al eliminar el paciente: ' + (error.error?.error || error.message || 'Error desconocido');
        this.isLoading = false;
      }
    });
  }

}
