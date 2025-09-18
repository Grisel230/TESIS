import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
    FormsModule
  ],
  templateUrl: './informes-estadisticas.component.html',
  styleUrls: ['./informes-estadisticas.component.css']
})
export class InformesEstadisticasComponent implements OnInit {
  sidebarVisible = true;
  selectedPeriod = 'month';
  chartType = 'bar';

  emotionData: EmotionData[] = [
    { label: 'Felicidad', value: 45, color: '#10b981' },
    { label: 'Tristeza', value: 25, color: '#3b82f6' },
    { label: 'Sorpresa', value: 15, color: '#f59e0b' },
    { label: 'Enojo', value: 10, color: '#ef4444' },
    { label: 'Miedo', value: 5, color: '#8b5cf6' }
  ];

  sessionData: SessionData[] = [
    { month: 'Ene', sessions: 12 },
    { month: 'Feb', sessions: 15 },
    { month: 'Mar', sessions: 8 },
    { month: 'Abr', sessions: 20 },
    { month: 'May', sessions: 18 },
    { month: 'Jun', sessions: 14 },
    { month: 'Jul', sessions: 22 },
    { month: 'Ago', sessions: 16 }
  ];

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('InformesEstadisticasComponent inicializado');
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
    console.log('Exportando reporte...');
    // Aquí implementarías la lógica para exportar el reporte
    alert('Funcionalidad de exportación en desarrollo');
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
    console.log('Generando nuevo reporte...');
    // Aquí implementarías la lógica para generar un reporte
    alert('Generando reporte personalizado...');
  }

  viewReport(report: Report): void {
    console.log('Viendo reporte:', report.title);
    // Aquí implementarías la lógica para ver el reporte
    alert(`Abriendo reporte: ${report.title}`);
  }

  downloadReport(report: Report): void {
    console.log('Descargando reporte:', report.title);
    // Aquí implementarías la lógica para descargar el reporte
    alert(`Descargando reporte: ${report.title}`);
  }

  viewAllActivity(): void {
    console.log('Viendo toda la actividad...');
    // Aquí implementarías la lógica para ver toda la actividad
    alert('Mostrando historial completo de actividad');
  }
}