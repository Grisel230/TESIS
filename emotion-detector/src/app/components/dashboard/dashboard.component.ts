import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, Psicologo } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { PatientService, PacienteResponse } from '../../services/patient.service';
import { ThemeService } from '../../services/theme.service';

// Interface Psicologo ahora se importa desde AuthService

interface Patient {
  id: number;
  nombre: string;
  edad: number;
  genero: string;
  telefono: string;
  email: string;
  sesiones: number;
}

interface ChartData {
  month: string;
  feliz: number;
  triste: number;
  enojado: number;
  neutral: number;
}

interface ActivityItem {
  id: number;
  titulo: string;
  descripcion: string;
  tiempo: string;
  tipo: string;
  estado: string;
  estado_texto: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  psicologo: Psicologo | null = null;
  userAvatar: string | null = null;
  sidebarVisible: boolean = true;
  isLoading: boolean = true;
  isDarkMode: boolean = false;
  
  // Stats - ahora se cargan desde la API
  totalPacientes: number = 0;
  nuevosPacientes: number = 0;
  totalSesiones: number = 0;
  sesionesHoy: number = 0;
  totalEmociones: number = 0;
  emocionesHoy: number = 0;
  satisfaccionPromedio: number = 0;
  
  // Chart data - ahora se cargan desde la API
  chartData: ChartData[] = [];
  emotionData: any[] = [];
  sessionData: any[] = [];
  
  // Patients data - datos de ejemplo para la sección de pacientes
  patients: Patient[] = [
    {
      id: 1,
      nombre: 'Britney Sanchez Guerrero',
      edad: 23,
      genero: 'Masculino',
      telefono: '6674534210',
      email: 'britney@gmail.com',
      sesiones: 0
    },
    {
      id: 2,
      nombre: 'María González López',
      edad: 28,
      genero: 'Femenino',
      telefono: '6641234567',
      email: 'maria.gonzalez@email.com',
      sesiones: 3
    },
    {
      id: 3,
      nombre: 'Carlos Rodríguez Pérez',
      edad: 35,
      genero: 'Masculino',
      telefono: '6659876543',
      email: 'carlos.rodriguez@email.com',
      sesiones: 1
    }
  ];

  // Recent activity - ahora se carga desde la API
  recentActivity: ActivityItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private dashboardService: DashboardService,
    private patientService: PatientService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    console.log('DashboardComponent inicializado');
    console.log('URL actual en dashboard:', window.location.href);
    
    // Inicializar modo oscuro
    this.isDarkMode = this.themeService.isDarkMode();
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    
    this.loadUserData();
    this.loadDashboardData();
    this.loadPatients();
  }

  private loadUserData(): void {
    this.psicologo = this.authService.getPsicologo();
  }

  private loadPatients(): void {
    const psicologoId = this.authService.getPsicologoId();
    if (!psicologoId) {
      console.error('❌ No se encontró ID del psicólogo para cargar pacientes');
      return;
    }

    console.log('🔍 Cargando pacientes del psicólogo:', psicologoId);
    this.patientService.obtenerPacientes(psicologoId).subscribe({
      next: (response) => {
        console.log('✅ Respuesta RAW de pacientes:', response);
        console.log('📊 Cantidad de pacientes recibidos:', response?.pacientes?.length || 0);
        
        if (!response || !response.pacientes || !Array.isArray(response.pacientes)) {
          console.error('❌ La respuesta no tiene el formato esperado:', response);
          return;
        }
        
        // Convertir PacienteResponse[] a Patient[]
        this.patients = response.pacientes.map((paciente: PacienteResponse) => ({
          id: paciente.id,
          nombre: paciente.nombre_completo,
          edad: paciente.edad || 0,
          genero: paciente.genero || 'No especificado',
          telefono: paciente.telefono,
          email: paciente.email,
          sesiones: 0 // Esto se puede calcular después si es necesario
        }));
        
        console.log('✅ Pacientes procesados para el dashboard:', this.patients);
        console.log('📋 Total de pacientes en el dashboard:', this.patients.length);
      },
      error: (error) => {
        console.error('❌ Error al cargar pacientes:', error);
        console.error('📄 Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        // Mantener los datos de ejemplo si hay error
        console.log('⚠️ Usando datos de ejemplo por error en la carga');
      }
    });
  }

  private loadDashboardData(): void {
    const psicologoId = this.authService.getPsicologoId();
    if (!psicologoId) {
      console.error('No se encontró ID del psicólogo');
      this.isLoading = false;
      this.loadDefaultData();
      return;
    }

    console.log('Cargando datos del dashboard para psicólogo ID:', psicologoId);
    this.dashboardService.getDashboardStats(psicologoId).subscribe({
      next: (data) => {
        console.log('✅ Datos del dashboard recibidos desde la BD:', data);
        
        // Cargar estadísticas
        this.totalPacientes = data.estadisticas.total_pacientes;
        this.nuevosPacientes = data.estadisticas.nuevos_pacientes;
        this.totalSesiones = data.estadisticas.total_sesiones;
        this.sesionesHoy = data.estadisticas.sesiones_hoy;
        this.totalEmociones = data.estadisticas.total_emociones;
        this.emocionesHoy = data.estadisticas.emociones_hoy;
        this.satisfaccionPromedio = data.estadisticas.satisfaccion_promedio;
        
        console.log('📊 Estadísticas cargadas:', {
          pacientes: this.totalPacientes,
          sesiones: this.totalSesiones,
          emociones: this.totalEmociones
        });
        
        // Cargar datos de gráficos
        this.chartData = data.chart_data;
        this.processChartData();
        
        // Cargar actividad reciente
        this.recentActivity = data.actividad_reciente;
        console.log('📋 Actividad reciente cargada:', this.recentActivity.length, 'items');
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar datos del dashboard desde la BD:', error);
        console.error('Detalles del error:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        this.isLoading = false;
        // Cargar datos por defecto en caso de error
        this.loadDefaultData();
        console.warn('⚠️ Usando datos por defecto debido al error');
      }
    });
  }

  private processChartData(): void {
    // Procesar datos de emociones para el gráfico circular
    const totalEmociones = this.chartData.reduce((sum, month) => 
      sum + month.feliz + month.triste + month.enojado + month.neutral, 0
    );
    
    if (totalEmociones > 0) {
      this.emotionData = [
        { 
          label: 'Felicidad', 
          value: Math.round((this.chartData.reduce((sum, month) => sum + month.feliz, 0) / totalEmociones) * 100),
          color: '#10b981' 
        },
        { 
          label: 'Tristeza', 
          value: Math.round((this.chartData.reduce((sum, month) => sum + month.triste, 0) / totalEmociones) * 100),
          color: '#3b82f6' 
        },
        { 
          label: 'Enojo', 
          value: Math.round((this.chartData.reduce((sum, month) => sum + month.enojado, 0) / totalEmociones) * 100),
          color: '#ef4444' 
        },
        { 
          label: 'Neutral', 
          value: Math.round((this.chartData.reduce((sum, month) => sum + month.neutral, 0) / totalEmociones) * 100),
          color: '#6b7280' 
        }
      ];
    } else {
      this.emotionData = [
        { label: 'Felicidad', value: 0, color: '#10b981' },
        { label: 'Tristeza', value: 0, color: '#3b82f6' },
        { label: 'Enojo', value: 0, color: '#ef4444' },
        { label: 'Neutral', value: 0, color: '#6b7280' }
      ];
    }

    // Procesar datos de sesiones
    this.sessionData = this.chartData.map(month => ({
      month: month.month,
      sessions: month.feliz + month.triste + month.enojado + month.neutral
    }));
  }

  private loadDefaultData(): void {
    // Datos por defecto en caso de error
    this.totalPacientes = 0;
    this.nuevosPacientes = 0;
    this.totalSesiones = 0;
    this.sesionesHoy = 0;
    this.totalEmociones = 0;
    this.emocionesHoy = 0;
    this.satisfaccionPromedio = 0;
    this.chartData = [];
    this.emotionData = [];
    this.sessionData = [];
    this.recentActivity = [];
  }

  // Método para toggle del sidebar
  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  // Navegación
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToNuevoPaciente(): void {
    this.router.navigate(['/nuevo-paciente']);
  }

  goToListaPacientes(): void {
    this.router.navigate(['/pacientes']);
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

  goToResources(): void {
    this.router.navigate(['/recursos']);
  }

  getFirstName(): string {
    if (this.psicologo?.nombre_completo) {
      return this.psicologo.nombre_completo.split(' ')[0];
    }
    return 'Doctor';
  }

  logout(): void {
    this.authService.logout();
  }
}