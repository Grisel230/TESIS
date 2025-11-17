import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { SessionService, SesionDetalle, EmocionDetectada } from '../../services/session.service';

type EmotionKey = 'angry' | 'disgust' | 'fear' | 'happy' | 'neutral' | 'sad' | 'surprise';

interface TemporalEmotionPoint {
  time: string;
  emotion: EmotionKey;
  confidence: number;
}

interface SessionDetailView {
  id: string;
  fecha: string;
  fechaISO: string; // Fecha en formato ISO para uso en nombres de archivo
  hora: string;
  paciente: string;
  edadTexto: string;
  diagnosticoTexto: string;
  duracion: string;
  emocionPredominante: EmotionKey;
  confianza: number;
  notasSesion: string;
  temporalEmotions: TemporalEmotionPoint[];
  recomendaciones: string[];
}

const EMOTION_LABELS: Record<EmotionKey, string> = {
  angry: 'Enojo',
  disgust: 'Asco',
  fear: 'Miedo',
  happy: 'Alegría',
  neutral: 'Neutral',
  sad: 'Tristeza',
  surprise: 'Sorpresa'
};

const EMOTION_COLORS: Record<EmotionKey, string> = {
  angry: '#dc3545',
  disgust: '#28a745',
  fear: '#f97316',
  happy: '#22c55e',
  neutral: '#64748b',
  sad: '#0ea5e9',
  surprise: '#a855f7'
};

@Component({
  selector: 'app-detalle-sesion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-sesion.component.html',
  styleUrls: ['./detalle-sesion.component.css']
})
export class DetalleSesionComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('emotionChartCanvas') emotionChartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private routeSub?: Subscription;

  sessionId: string | null = null;
  sessionDetails?: SessionDetailView;
  sidebarVisible = true;
  psicologoName = '';
  isLoading = false;
  errorMessage = '';
  emotionSummary: Array<{ key: EmotionKey; name: string; percentage: number }> = [];
  private chartRenderTimeout: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {
    // Load psychologist name from localStorage
    const psicologoData = localStorage.getItem('psicologo');
    if (psicologoData) {
      try {
        const psicologo = JSON.parse(psicologoData);
        this.psicologoName = psicologo.nombre_completo || psicologo.nombre_usuario || 'Usuario';
      } catch (error) {
        console.error('Error loading psychologist data:', error);
        this.psicologoName = 'Usuario';
      }
    } else {
      this.psicologoName = 'Usuario';
    }

    this.routeSub = this.route.paramMap.subscribe(params => {
      this.sessionId = params.get('id');
      this.loadSessionDetails();
    });
  }

  ngAfterViewInit(): void {
    // Esperar a que la vista esté completamente inicializada
    setTimeout(() => {
      if (this.sessionDetails) {
        this.scheduleChartRender();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.chartRenderTimeout) {
      clearTimeout(this.chartRenderTimeout);
    }
  }

  loadSessionDetails(): void {
    console.log('🔍 Cargando sesión con ID:', this.sessionId);

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    this.sessionDetails = undefined;
    this.isLoading = true;
    this.errorMessage = '';

    if (!this.sessionId) {
      this.errorMessage = 'No se proporcionó un identificador de sesión válido.';
      this.useFallbackSession('sin-id');
      return;
    }

    const numericId = Number(this.sessionId);
    const canRequestApi = !Number.isNaN(numericId);

    if (canRequestApi) {
      this.sessionService.obtenerSesionDetalle(numericId).subscribe({
        next: (response) => {
          console.log('📥 Datos recibidos del backend:', response);
          this.sessionDetails = this.buildSessionDetail(response, this.sessionId!);
          this.updateEmotionSummary();
          this.isLoading = false;
          this.errorMessage = '';
          this.scheduleChartRender();
        },
        error: (error) => {
          console.error('❌ Error al cargar detalles desde el backend:', error);
          this.errorMessage = 'No se pudo cargar la información desde el servidor. Intentando con datos guardados.';
          this.loadFromStorageOrFallback();
        }
      });
    } else {
      this.errorMessage = 'El identificador de la sesión no es numérico. Intentando con datos guardados.';
      this.loadFromStorageOrFallback();
    }
  }

  private loadFromStorageOrFallback(): void {
    if (!this.sessionId) {
      this.useFallbackSession('sin-id');
      return;
    }

    const stored = this.loadSessionFromStorage(this.sessionId);
    if (stored) {
      console.log('💾 Cargando detalles desde almacenamiento local.');
      this.sessionDetails = stored;
      this.updateEmotionSummary();
      this.isLoading = false;
      this.scheduleChartRender();
      return;
    }

    this.useFallbackSession(this.sessionId);
  }

  private useFallbackSession(sessionId: string): void {
    console.warn('🆘 Utilizando datos simulados para la sesión:', sessionId);
    this.sessionDetails = this.createFallbackSession(sessionId);
    this.updateEmotionSummary();
    this.isLoading = false;
    this.scheduleChartRender();
  }

  private loadSessionFromStorage(sessionId: string): SessionDetailView | undefined {
    try {
      const savedSessionsData = localStorage.getItem('sesiones_guardadas');
      if (!savedSessionsData) {
        return undefined;
      }

      const savedSessions = JSON.parse(savedSessionsData);
      const savedSession = savedSessions.find((s: any) => s.id?.toString() === sessionId);
      if (!savedSession) {
        return undefined;
      }

      return this.buildSessionDetail(savedSession, sessionId);
    } catch (error) {
      console.error('Error al cargar sesión desde localStorage:', error);
      return undefined;
    }
  }

  private createFallbackSession(sessionId: string): SessionDetailView {
    const now = new Date();
    const fechaISO = now.toISOString().split('T')[0];
    return {
      id: sessionId,
      fecha: now.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
      fechaISO: fechaISO,
      hora: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      paciente: 'Información no disponible',
      edadTexto: 'No disponible',
      diagnosticoTexto: 'No especificado',
      duracion: '0 minutos',
      emocionPredominante: 'neutral',
      confianza: 0.5,
      notasSesion: 'No se encontraron datos guardados para esta sesión. Mostrando información simulada.',
      temporalEmotions: this.generateMockTemporalData('neutral'),
      recomendaciones: [
        'Verificar la conexión con el servicio de sesiones.',
        'Reintentar la carga de datos en unos minutos.'
      ]
    };
  }

  private buildSessionDetail(source: Partial<SesionDetalle> & Record<string, any>, fallbackId: string): SessionDetailView {
    const fechaRaw = source.fecha_sesion || source['fecha'] || source['created_at'] || new Date().toISOString();
    const fechaObj = new Date(fechaRaw);
    const fechaValida = !Number.isNaN(fechaObj.getTime()) ? fechaObj : new Date();

    const pacienteNombre = source.paciente_nombre || source['paciente']?.nombre || source['paciente'] || 'Paciente desconocido';
    const edad = source['paciente']?.edad ?? source['edad'] ?? null;
    const diagnostico = source['diagnostico'] || source['diagnostico_principal'] || 'No especificado';
    const duracion = source.duracion_minutos ?? source['duracion'] ?? 0;
    const emocionPredominante = this.normalizeEmotion(source.emocion_predominante);
    const confianza = this.normalizeConfidence(source.confianza_promedio ?? source['confianza']);
    const notas = source.notas || source['observaciones'] || 'Sin notas registradas para esta sesión.';

    const rawTemporal: Array<Partial<EmocionDetectada> & Record<string, any>> = Array.isArray(source.emociones_detectadas)
      ? source.emociones_detectadas
      : Array.isArray(source['emotionsHistory'])
        ? source['emotionsHistory']
        : Array.isArray(source['temporalEmotions'])
          ? source['temporalEmotions']
          : [];

    const temporalEmotions = rawTemporal
      .map((item, index) => this.mapTemporalEmotion(item, index))
      .filter((value): value is TemporalEmotionPoint => !!value)
      .sort((a, b) => this.parseTemporalOrder(a.time) - this.parseTemporalOrder(b.time));

    const recomendaciones: string[] = Array.isArray(source['recomendaciones']) && source['recomendaciones'].length > 0
      ? source['recomendaciones']
      : this.buildRecommendations(emocionPredominante, notas);

    // Formatear fecha ISO para nombres de archivo (YYYY-MM-DD)
    const fechaISO = fechaValida.toISOString().split('T')[0];
    
    return {
      id: (source.id?.toString() || fallbackId) ?? fallbackId,
      fecha: fechaValida.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
      fechaISO: fechaISO,
      hora: fechaValida.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      paciente: pacienteNombre,
      edadTexto: typeof edad === 'number' && edad > 0 ? `${edad} ${edad === 1 ? 'año' : 'años'}` : 'No disponible',
      diagnosticoTexto: diagnostico,
      duracion: typeof duracion === 'number' && duracion > 0 ? `${duracion} ${duracion === 1 ? 'minuto' : 'minutos'}` : 'No disponible',
      emocionPredominante: emocionPredominante,
      confianza: confianza,
      notasSesion: notas,
      temporalEmotions: temporalEmotions.length > 0 ? temporalEmotions : this.generateMockTemporalData(emocionPredominante),
      recomendaciones
    };
  }

  private mapTemporalEmotion(item: Partial<EmocionDetectada> & Record<string, any>, index: number): TemporalEmotionPoint | undefined {
    const emotion = this.normalizeEmotion(item.emotion || item['nombre'] || item['label']);
    const confidence = this.normalizeConfidence(item.confidence ?? item['score'] ?? item['valor']);
    const timestamp = item.timestamp ?? item['time'] ?? item['fecha_registro'] ?? index;

    return {
      time: this.formatTimestamp(timestamp, index),
      emotion,
      confidence
    };
  }

  private parseTemporalOrder(time: string): number {
    if (!time) {
      return 0;
    }

    const dateValue = new Date(time).getTime();
    if (!Number.isNaN(dateValue)) {
      return dateValue;
    }

    const parts = time.split(':').map(part => Number(part));
    if (parts.every(value => !Number.isNaN(value))) {
      if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
      if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      }
    }

    return 0;
  }

  private scheduleChartRender(): void {
    // Cancelar cualquier timeout pendiente
    if (this.chartRenderTimeout) {
      clearTimeout(this.chartRenderTimeout);
    }
    
    this.chartRenderTimeout = setTimeout(() => {
      if (this.sessionDetails && this.emotionChartCanvas?.nativeElement) {
        this.renderEmotionGraph();
      }
      this.chartRenderTimeout = null;
    }, 300);
  }

  private updateEmotionSummary(): void {
    this.emotionSummary = this.getEmotionSummary();
  }

  private normalizeEmotion(value: any): EmotionKey {
    const normalized = (value || '').toString().trim().toLowerCase();
    if (['angry', 'enojo'].includes(normalized)) { return 'angry'; }
    if (['disgust', 'asco'].includes(normalized)) { return 'disgust'; }
    if (['fear', 'miedo'].includes(normalized)) { return 'fear'; }
    if (['happy', 'feliz', 'alegria', 'alegría'].includes(normalized)) { return 'happy'; }
    if (['sad', 'triste', 'tristeza'].includes(normalized)) { return 'sad'; }
    if (['surprise', 'sorpresa'].includes(normalized)) { return 'surprise'; }
    return 'neutral';
  }

  private normalizeConfidence(value: any): number {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return 0;
    }
    if (numeric > 1) {
      return Math.min(numeric / 100, 1);
    }
    if (numeric < 0) {
      return 0;
    }
    return Math.min(Math.max(numeric, 0), 1);
  }

  private formatTimestamp(value: unknown, index: number): string {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      const totalSeconds = Math.max(0, Math.floor(value));
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return this.formatTimestamp(index * 10, index);
      }

      const parsedDate = new Date(trimmed);
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }

      const parts = trimmed.split(':');
      if (parts.length === 2 || parts.length === 3) {
        return parts.map(part => part.padStart(2, '0')).join(':');
      }

      return trimmed;
    }

    return this.formatTimestamp(index * 10, index);
  }

  private generateMockTemporalData(emotion: EmotionKey): TemporalEmotionPoint[] {
    const intervals = [0, 60, 120, 180, 240, 300];
    return intervals.map((seconds) => ({
      time: this.formatTimestamp(seconds, seconds / 10),
      emotion,
      confidence: 0.6 + Math.random() * 0.3
    }));
  }

  private buildRecommendations(emotion: EmotionKey, notes: string): string[] {
    const base = notes && notes.length > 120 ? [`Resumen de notas: ${notes.slice(0, 120)}...`] : [];

    switch (emotion) {
      case 'angry':
        return [...base, 'Planificar ejercicios de respiración y relajación.', 'Evaluar detonantes emocionales para próximas sesiones.'];
      case 'disgust':
        return [...base, 'Explorar situaciones que generan rechazo.', 'Trabajar en técnicas de reestructuración cognitiva.'];
      case 'fear':
        return [...base, 'Reforzar estrategias de afrontamiento y seguridad.', 'Considerar exposición gradual a factores de miedo.'];
      case 'happy':
        return [...base, 'Refuerza los factores positivos identificados.', 'Registrar eventos que motivaron emociones positivas.'];
      case 'sad':
        return [...base, 'Promover actividades gratificantes entre sesiones.', 'Monitorear pensamientos recurrentes asociados a la tristeza.'];
      case 'surprise':
        return [...base, 'Indagar sobre estímulos que generaron sorpresa.', 'Analizar si la sorpresa se percibió como positiva o negativa.'];
      default:
        return [...base, 'Continuar monitoreando la respuesta emocional en siguientes sesiones.'];
    }
  }

  getEmotionEmoji(emotion: EmotionKey): string {
    const emojis: Record<EmotionKey, string> = {
      angry: '😠',
      disgust: '🤢',
      fear: '😨',
      happy: '😊',
      neutral: '😐',
      sad: '😢',
      surprise: '😲'
    };
    return emojis[emotion] || '😐';
  }

  getEmotionLabel(emotion: EmotionKey): string {
    return EMOTION_LABELS[emotion] || 'Desconocido';
  }

  getEmotionSummary(): Array<{ key: EmotionKey; name: string; percentage: number }> {
    if (!this.sessionDetails || !this.sessionDetails.temporalEmotions) {
      return [];
    }

    const totals = new Map<EmotionKey, number>();
    this.sessionDetails.temporalEmotions.forEach(point => {
      totals.set(point.emotion, (totals.get(point.emotion) || 0) + point.confidence);
    });

    const totalConfidence = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);
    if (totalConfidence === 0) {
      return [];
    }

    return Array.from(totals.entries())
      .map(([emotion, value]) => ({
        key: emotion,
        name: this.getEmotionLabel(emotion),
        percentage: Math.round((value / totalConfidence) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);
  }

  renderEmotionGraph(): void {
    console.log('🎨 Intentando renderizar gráfico...');

    if (!this.sessionDetails || !this.sessionDetails.temporalEmotions || this.sessionDetails.temporalEmotions.length === 0) {
      console.warn('No hay datos temporales para renderizar el gráfico.');
      return;
    }

    if (!this.emotionChartCanvas) {
      console.warn('Canvas no disponible aún.');
      return;
    }

    try {
      if (this.chart) {
        this.chart.destroy();
      }

      const labels = this.sessionDetails.temporalEmotions.map(point => point.time);
      const datasets = (Object.keys(EMOTION_COLORS) as EmotionKey[]).map(emotion => {
        const dataPoints = labels.map(label => {
          const match = this.sessionDetails!.temporalEmotions.find(point => point.time === label && point.emotion === emotion);
          return match ? match.confidence * 100 : 0;
        });

        return {
          label: this.getEmotionLabel(emotion),
          data: dataPoints,
          borderColor: EMOTION_COLORS[emotion],
          backgroundColor: EMOTION_COLORS[emotion],
          fill: false,
          tension: 0.35,
          borderWidth: 2
        };
      }).filter(dataset => dataset.data.some(value => value > 0));

      if (datasets.length === 0) {
        console.warn('Los datos temporales no contienen variaciones suficientes para el gráfico.');
        return;
      }

      const context = this.emotionChartCanvas.nativeElement.getContext('2d');
      if (!context) {
        console.warn('No se pudo obtener el contexto del canvas.');
        return;
      }

      this.chart = new Chart(context, {
        type: 'line',
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'nearest'
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: (value) => `${value}%`
              },
              title: {
                display: true,
                text: 'Confianza (%)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Tiempo de la sesión'
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'bottom'
            },
            title: {
              display: true,
              text: 'Evolución temporal de las emociones'
            }
          }
        }
      });

      console.log('✅ Gráfico renderizado exitosamente');
    } catch (error) {
      console.error('❌ Error al renderizar gráfico:', error);
    }
  }

  private sanitizeFileName(name: string): string {
    // Limpiar el nombre para que sea válido en nombres de archivo
    return name
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]/g, '') // Eliminar caracteres especiales excepto espacios, guiones y acentos
      .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
      .replace(/_{2,}/g, '_') // Reemplazar múltiples guiones bajos con uno solo
      .trim();
  }

  private formatDateForFileName(fechaISO?: string, fecha?: string): string {
    // Priorizar fechaISO si está disponible (formato YYYY-MM-DD)
    if (fechaISO) {
      return fechaISO;
    }
    
    // Si no hay fechaISO, intentar parsear la fecha formateada
    if (fecha) {
      try {
        const fechaObj = new Date(fecha);
        if (!isNaN(fechaObj.getTime())) {
          const year = fechaObj.getFullYear();
          const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
          const day = String(fechaObj.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
        
        // Intentar parsear formato español "15 de enero de 2024"
        const meses: { [key: string]: string } = {
          'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
          'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
          'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
        };
        
        const fechaLower = fecha.toLowerCase();
        for (const mes in meses) {
          if (fechaLower.includes(mes)) {
            const partes = fecha.match(/\d+/g);
            if (partes && partes.length >= 2) {
              const dia = partes[0].padStart(2, '0');
              const año = partes[1].length === 4 ? partes[1] : `20${partes[1]}`;
              return `${año}-${meses[mes]}-${dia}`;
            }
          }
        }
        
        // Si no se puede parsear, extraer números
        const numbers = fecha.match(/\d+/g);
        if (numbers && numbers.length >= 3) {
          const day = numbers[0].padStart(2, '0');
          const month = numbers[1].padStart(2, '0');
          const year = numbers[2].length === 4 ? numbers[2] : `20${numbers[2]}`;
          return `${year}-${month}-${day}`;
        }
      } catch (error) {
        console.warn('Error al formatear fecha para nombre de archivo:', error);
      }
    }
    
    // Fallback: usar fecha actual
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  downloadReport(): void {
    if (!this.sessionDetails) {
      alert('No hay datos disponibles para generar el reporte.');
      return;
    }

    // Obtener el elemento del contenido principal para el reporte
    const element = document.querySelector('.main-content') as HTMLElement;
    if (!element) {
      console.error('No se encontró el contenedor del reporte.');
      alert('Error al generar el reporte.');
      return;
    }

    html2canvas(element, { scale: 2 }).then(canvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generar nombre de archivo con paciente y fecha
      if (!this.sessionDetails) {
        console.error('sessionDetails no está disponible');
        return;
      }
      
      const pacienteNombre = this.sanitizeFileName(this.sessionDetails.paciente || 'Paciente');
      const fechaFormateada = this.formatDateForFileName(
        this.sessionDetails.fechaISO, 
        this.sessionDetails.fecha
      );
      const filename = `Reporte_Sesion_${pacienteNombre}_${fechaFormateada}.pdf`;
      
      pdf.save(filename);
      console.log('Reporte PDF generado y descargado:', filename);
    }).catch(error => {
      console.error('Error al generar el reporte PDF:', error);
      alert('No se pudo generar el reporte en PDF.');
    });
  }

  printReport(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/historial-sesiones']);
  }

  // Navigation methods
  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToNuevoPaciente(): void {
    this.router.navigate(['/nuevo-paciente']);
  }

  goToPacientes(): void {
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

  // Método para obtener el primer nombre del psicólogo
  getFirstName(): string {
    if (this.psicologoName) {
      return this.psicologoName.split(' ')[0];
    }
    return 'Doctor';
  }

} 