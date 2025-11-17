import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ReportService, ReportData } from '../../services/report.service';
import { ReportModalComponent } from '../report-modal/report-modal.component';
import { HttpClientModule } from '@angular/common/http';

interface EmotionData {
  label: string;
  value: number;
  color: string;
}

interface SessionData {
  month: string;
  sessions: number;
}

interface Report {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  type: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
  status: string;
  statusText: string;
}

@Component({
  selector: 'app-informes-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    ReportModalComponent
  ],
  templateUrl: './informes-estadisticas.component.html',
  styleUrls: ['./informes-estadisticas.component.css']
})
export class InformesEstadisticasComponent implements OnInit {
  sidebarVisible = true;
  selectedPeriod = 'month';
  chartType = 'bar';
  isLoading = true;
  isDarkMode = false;

  // Modal de reportes
  isModalVisible = false;
  modalReportData: ReportData | null = null;
  modalReportType = '';

  // Estadísticas generales
  totalSessions = 0;
  totalPatients = 0;
  averageConfidence = 0;
  predominantEmotion = '-';

  emotionData: EmotionData[] = [];
  sessionData: SessionData[] = [];

  availableReports: Report[] = [
    {
      id: '1',
      title: 'Reporte Mensual',
      description: 'Análisis completo del mes actual',
      icon: 'M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2z',
      color: '#3b82f6',
      type: 'monthly'
    },
    {
      id: '2',
      title: 'Análisis de Pacientes',
      description: 'Estadísticas por paciente individual',
      icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
      color: '#10b981',
      type: 'patient'
    },
    {
      id: '3',
      title: 'Tendencias Emocionales',
      description: 'Evolución de emociones en el tiempo',
      icon: 'M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3',
      color: '#f59e0b',
      type: 'trends'
    },
    {
      id: '4',
      title: 'Eficiencia Terapéutica',
      description: 'Métricas de efectividad del tratamiento',
      icon: 'M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z',
      color: '#8b5cf6',
      type: 'efficiency'
    }
  ];

  recentActivity: Activity[] = [
    {
      id: '1',
      title: 'Nuevo Reporte Generado',
      description: 'Reporte mensual de septiembre completado',
      time: 'Hace 2 horas',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z',
      color: '#3b82f6',
      status: 'completed',
      statusText: 'Completado'
    },
    {
      id: '2',
      title: 'Análisis de Tendencias',
      description: 'Identificadas nuevas tendencias emocionales',
      time: 'Hace 5 horas',
      icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
      color: '#f59e0b',
      status: 'completed',
      statusText: 'Completado'
    },
    {
      id: '3',
      title: 'Exportación de Datos',
      description: 'Datos exportados en formato PDF',
      time: 'Ayer',
      icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z',
      color: '#10b981',
      status: 'completed',
      statusText: 'Completado'
    }
  ];

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private authService: AuthService,
    private themeService: ThemeService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    console.log('InformesEstadisticasComponent inicializado');
    
    // Inicializar con el valor actual del tema
    this.isDarkMode = this.themeService.isDarkMode();
    
    // Suscribirse a los cambios del tema
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    
    this.loadStatistics();
  }

  loadStatistics(): void {
    const psicologo = this.authService.getPsicologo();
    if (!psicologo || !psicologo.id) {
      console.error('No se encontró información del psicólogo');
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    // Cargar resumen de estadísticas
    console.log('Cargando estadísticas para psicólogo ID:', psicologo.id);
    this.sessionService.obtenerResumenEstadisticas(psicologo.id).subscribe({
      next: (resumen) => {
        console.log('Resumen de estadísticas recibido:', resumen);
        console.log('Total pacientes del backend:', resumen.total_pacientes);
        this.totalSessions = resumen.total_sesiones || 0;
        this.totalPatients = resumen.total_pacientes || 0;
        this.averageConfidence = resumen.confianza_promedio || 0;
        this.predominantEmotion = resumen.emocion_predominante || '-';
        console.log('Total pacientes asignado:', this.totalPatients);
      },
      error: (error) => {
        console.error('Error al cargar resumen de estadísticas:', error);
        console.error('Detalles del error:', error.error);
        this.totalSessions = 0;
        this.totalPatients = 0;
        this.averageConfidence = 0;
        this.predominantEmotion = '-';
      }
    });

    // Cargar estadísticas de emociones
    this.sessionService.obtenerEstadisticasEmociones(psicologo.id).subscribe({
      next: (emociones) => {
        console.log('Estadísticas de emociones:', emociones);
        this.emotionData = this.processEmotionData(emociones);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de emociones:', error);
        // Mantener datos vacíos si hay error
        this.emotionData = [];
      }
    });

    // Cargar estadísticas de sesiones mensuales
    this.sessionService.obtenerEstadisticasSesionesMensuales(psicologo.id).subscribe({
      next: (sesiones) => {
        console.log('Estadísticas de sesiones mensuales:', sesiones);
        this.sessionData = this.processSessionData(sesiones);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de sesiones:', error);
        // Mantener datos vacíos si hay error
        this.sessionData = [];
        this.isLoading = false;
      }
    });
  }

  processEmotionData(data: any[]): EmotionData[] {
    const emotionColors: { [key: string]: string } = {
      'happy': '#10b981',
      'sad': '#3b82f6',
      'surprise': '#f59e0b',
      'angry': '#ef4444',
      'fear': '#8b5cf6',
      'disgust': '#ec4899',
      'neutral': '#6b7280'
    };

    const emotionLabels: { [key: string]: string } = {
      'happy': 'Felicidad',
      'sad': 'Tristeza',
      'surprise': 'Sorpresa',
      'angry': 'Enojo',
      'fear': 'Miedo',
      'disgust': 'Disgusto',
      'neutral': 'Neutral'
    };

    return data.map(item => ({
      label: emotionLabels[item.emotion] || item.emotion,
      value: Math.round(item.percentage || 0),
      color: emotionColors[item.emotion] || '#6b7280'
    }));
  }

  processSessionData(data: any[]): SessionData[] {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    return data.map(item => ({
      month: monthNames[item.month - 1] || item.month,
      sessions: item.count || 0
    }));
  }

  getFirstName(): string {
    const psicologo = this.authService.getPsicologo();
    if (psicologo?.nombre_completo) {
      return psicologo.nombre_completo.split(' ')[0];
    }
    return 'Psicólogo';
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

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

  goToReports(): void {
    this.router.navigate(['/informes-estadisticas']);
  }

  goToResources(): void {
    this.router.navigate(['/recursos']);
  }

  goToSettings(): void {
    this.router.navigate(['/configuracion']);
  }

  exportReport(): void {
    console.log('Exportando reporte general...');
    
    // Obtener datos actuales para el reporte
    const reportData: ReportData = {
      title: 'Reporte General de Análisis Emocional',
      dateRange: 'Último mes',
      totalSessions: this.totalSessions,
      totalPatients: this.totalPatients,
      averageConfidence: this.averageConfidence,
      predominantEmotion: this.predominantEmotion,
      emotionData: this.emotionData.map(emotion => ({
        ...emotion,
        count: Math.round(emotion.value * this.totalSessions / 100)
      })),
      sessionData: this.sessionData.map(session => ({
        ...session,
        date: new Date().toISOString().split('T')[0] // Agregar fecha actual como ejemplo
      }))
    };

    // Mostrar opciones de exportación
    const format = confirm('¿Desea exportar en formato PDF? (Cancelar para Excel)');
    
    if (format) {
      this.reportService.generatePDFReport(reportData, 'monthly');
    } else {
      this.reportService.generateExcelReport(reportData, 'monthly');
    }
  }

  toggleChartType(): void {
    this.chartType = this.chartType === 'bar' ? 'line' : 'bar';
  }

  getLineChartPoints(): string {
    return this.sessionData.map((data, index) => {
      const x = (index * 50) + 25;
      const y = 200 - (data.sessions * 6);
      return `${x},${y}`;
    }).join(' ');
  }

  generateReport(): void {
    console.log('Generando nuevo reporte personalizado...');
    
    // Mostrar opciones de tipo de reporte
    const reportTypes = [
      { key: 'monthly', name: 'Reporte Mensual' },
      { key: 'patient', name: 'Análisis por Paciente' },
      { key: 'trends', name: 'Tendencias Emocionales' },
      { key: 'efficiency', name: 'Eficiencia Terapéutica' }
    ];
    
    let selection = prompt(
      'Seleccione el tipo de reporte:\n' +
      '1. Reporte Mensual\n' +
      '2. Análisis por Paciente\n' +
      '3. Tendencias Emocionales\n' +
      '4. Eficiencia Terapéutica\n\n' +
      'Ingrese el número (1-4):'
    );
    
    if (selection && ['1', '2', '3', '4'].includes(selection)) {
      const reportType = reportTypes[parseInt(selection) - 1].key;
      
      // Obtener datos del servicio
      this.reportService.getReportData(reportType).subscribe(reportData => {
        const format = confirm('¿Desea generar en formato PDF? (Cancelar para Excel)');
        
        if (format) {
          this.reportService.generatePDFReport(reportData, reportType);
        } else {
          this.reportService.generateExcelReport(reportData, reportType);
        }
      });
    }
  }

  viewReport(report: Report): void {
    console.log('Viendo reporte:', report.title);
    
    // Mostrar reporte en modal con datos reales
    this.reportService.getReportData(report.type).subscribe({
      next: (reportData) => {
        // Si no hay datos reales, usar los datos actuales del dashboard
        if (reportData.totalSessions === 0 && reportData.totalPatients === 0) {
          this.createReportFromCurrentDataAsync(report.type).then(fallbackData => {
            this.modalReportData = fallbackData;
            this.modalReportType = report.type;
            this.isModalVisible = true;
          });
        } else {
          this.modalReportData = reportData;
          this.modalReportType = report.type;
          this.isModalVisible = true;
        }
      },
      error: (error) => {
        console.error('Error obteniendo datos del reporte:', error);
        // Usar datos actuales como fallback
        this.createReportFromCurrentDataAsync(report.type).then(fallbackData => {
          this.modalReportData = fallbackData;
          this.modalReportType = report.type;
          this.isModalVisible = true;
        });
      }
    });
  }

  private createReportFromCurrentData(reportType: string): ReportData {
    const baseData: ReportData = {
      title: this.getReportTitleByType(reportType),
      dateRange: 'Datos actuales del dashboard',
      totalSessions: this.totalSessions,
      totalPatients: this.totalPatients,
      averageConfidence: this.averageConfidence,
      predominantEmotion: this.predominantEmotion,
      emotionData: this.emotionData.map(emotion => ({
        ...emotion,
        count: Math.round(emotion.value * this.totalSessions / 100)
      })),
      sessionData: this.sessionData.map(session => ({
        ...session,
        date: new Date().toISOString().split('T')[0]
      }))
    };

    // Agregar datos específicos según el tipo
    if (reportType === 'patient') {
      // Para el método síncrono, dejar vacío - usar el método asíncrono para datos reales
      baseData.patientData = [];
    }

    if (reportType === 'trends') {
      // Generar tendencias basadas en los datos de emociones actuales
      baseData.trendsData = this.generateSampleTrends();
    }

    return baseData;
  }

  private async createReportFromCurrentDataAsync(reportType: string): Promise<ReportData> {
    const baseData: ReportData = {
      title: this.getReportTitleByType(reportType),
      dateRange: 'Datos actuales del dashboard',
      totalSessions: this.totalSessions,
      totalPatients: this.totalPatients,
      averageConfidence: this.averageConfidence,
      predominantEmotion: this.predominantEmotion,
      emotionData: this.emotionData.map(emotion => ({
        ...emotion,
        count: Math.round(emotion.value * this.totalSessions / 100)
      })),
      sessionData: this.sessionData.map(session => ({
        ...session,
        date: new Date().toISOString().split('T')[0]
      }))
    };

    // Agregar datos específicos según el tipo
    if (reportType === 'patient') {
      try {
        baseData.patientData = await this.getRealPatients();
      } catch (error) {
        console.error('Error obteniendo pacientes reales:', error);
        baseData.patientData = [];
      }
    }

    if (reportType === 'trends') {
      baseData.trendsData = this.generateSampleTrends();
    }

    return baseData;
  }

  private getReportTitleByType(reportType: string): string {
    const titles: { [key: string]: string } = {
      'monthly': 'Reporte Mensual de Análisis Emocional',
      'patient': 'Análisis Detallado por Paciente',
      'trends': 'Análisis de Tendencias Emocionales',
      'efficiency': 'Reporte de Eficiencia Terapéutica'
    };
    return titles[reportType] || 'Reporte de Análisis Emocional';
  }

  private getRealPatients(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const psicologo = this.authService.getPsicologo();
      if (!psicologo || !psicologo.id) {
        resolve([]);
        return;
      }

      this.sessionService.obtenerSesiones(psicologo.id).subscribe({
        next: (sesiones) => {
          if (sesiones && Array.isArray(sesiones)) {
            const pacientesMap = new Map();
            
            sesiones.forEach((sesion: any) => {
              const pacienteId = sesion.paciente_id;
              const pacienteNombre = sesion.paciente_nombre || `Paciente ${pacienteId}`;
              
              if (!pacientesMap.has(pacienteId)) {
                pacientesMap.set(pacienteId, {
                  id: pacienteId.toString(),
                  name: pacienteNombre,
                  totalSessions: 0,
                  lastSession: sesion.fecha_sesion,
                  predominantEmotion: this.translateEmotion(sesion.emocion_predominante || 'neutral'),
                  progress: 0,
                  confidenceSum: 0
                });
              }
              
              const paciente = pacientesMap.get(pacienteId);
              paciente.totalSessions++;
              paciente.confidenceSum += parseFloat(sesion.confianza_promedio) || 0;
              
              // Actualizar última sesión si es más reciente
              if (new Date(sesion.fecha_sesion) > new Date(paciente.lastSession)) {
                paciente.lastSession = sesion.fecha_sesion;
                paciente.predominantEmotion = this.translateEmotion(sesion.emocion_predominante || 'neutral');
              }
            });
            
            // Calcular progreso basado en confianza promedio
            const pacientesReales = Array.from(pacientesMap.values()).map((patient: any) => ({
              ...patient,
              progress: Math.min(Math.max((patient.confidenceSum / patient.totalSessions) * 1.2, 0), 100)
            }));
            
            console.log('Pacientes reales encontrados:', pacientesReales);
            resolve(pacientesReales);
          } else {
            resolve([]);
          }
        },
        error: (error) => {
          console.error('Error obteniendo pacientes reales:', error);
          reject(error);
        }
      });
    });
  }

  private translateEmotion(emotion: string): string {
    const translations: { [key: string]: string } = {
      'happy': 'Felicidad',
      'sad': 'Tristeza',
      'angry': 'Enojo',
      'fear': 'Miedo',
      'surprise': 'Sorpresa',
      'disgust': 'Disgusto',
      'neutral': 'Neutral'
    };
    return translations[emotion?.toLowerCase()] || emotion || 'Neutral';
  }

  private generateSampleTrends(): any[] {
    return this.emotionData.slice(0, 4).map(emotion => ({
      period: 'Último mes',
      emotion: emotion.label,
      trend: Math.random() > 0.5 ? 'up' : (Math.random() > 0.5 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
      percentage: Math.floor(Math.random() * 20) - 10 // -10 a +10
    }));
  }

  downloadReport(report: Report): void {
    console.log('Descargando reporte:', report.title);
    
    // Descargar directamente en PDF
    this.reportService.getReportData(report.type).subscribe({
      next: async (reportData) => {
        // Si no hay datos reales, usar los datos actuales del dashboard
        if (reportData.totalSessions === 0 && reportData.totalPatients === 0) {
          reportData = await this.createReportFromCurrentDataAsync(report.type);
        }
        this.reportService.generatePDFReport(reportData, report.type);
      },
      error: async (error) => {
        console.error('Error obteniendo datos del reporte:', error);
        // Usar datos actuales como fallback
        const fallbackData = await this.createReportFromCurrentDataAsync(report.type);
        this.reportService.generatePDFReport(fallbackData, report.type);
      }
    });
  }

  viewAllActivity(): void {
    console.log('Viendo toda la actividad...');
    // Aquí implementarías la lógica para ver toda la actividad
    alert('Mostrando historial completo de actividad');
  }

  // Métodos para el modal
  closeModal(): void {
    this.isModalVisible = false;
    this.modalReportData = null;
    this.modalReportType = '';
  }

  onModalDownload(event: { data: ReportData, type: string }): void {
    this.reportService.generatePDFReport(event.data, event.type);
    this.closeModal();
  }
}