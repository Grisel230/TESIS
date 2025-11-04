import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { Session } from '../historial-sesiones/historial-sesiones.component';

interface SessionWithTemporalData extends Session {
  temporalEmotions?: { time: string; emotion: string; confidence: number; }[];
  recomendaciones?: string[];
}

import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-detalle-sesion',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './detalle-sesion.component.html',
  styleUrls: ['./detalle-sesion.component.css']
})
export class DetalleSesionComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('emotionChartCanvas') emotionChartCanvas!: ElementRef;
  private chart: Chart | undefined;

  sessionId: string | null = null;
  sessionDetails: SessionWithTemporalData | undefined;
  private routeSub: Subscription | undefined;
  sidebarVisible = true;

  private allSessions: SessionWithTemporalData[] = [
    {
      id: 'sesion-1', fecha: '5/06/2025', hora: '10:30 a. m.', paciente: 'Juan Pérez', edad: 25, diagnostico: 'Ansiedad', duracion: '20 segundos', emocionPredominante: 'neutral', confianza: 0.85,
      temporalEmotions: [
        { time: '0:00', emotion: 'neutral', confidence: 0.8 }, { time: '5:00', emotion: 'neutral', confidence: 0.75 }, { time: '10:00', emotion: 'happy', confidence: 0.6 },
        { time: '15:00', emotion: 'neutral', confidence: 0.7 }, { time: '20:00', emotion: 'sad', confidence: 0.4 }, { time: '25:00', emotion: 'neutral', confidence: 0.65 }
      ],
      recomendaciones: [
        'Profundizar en técnicas de respiración',
        'Revisar ejercicios de mindfulness',
        'Evaluar progreso en situaciones sociales'
      ]
    },
    {
      id: 'sesion-2', fecha: '4/06/2025', hora: '11:00 a. m.', paciente: 'Maria García', edad: 30, diagnostico: 'Depresión', duracion: '3 minutos', emocionPredominante: 'sad', confianza: 0.75,
      temporalEmotions: [
        { time: '0:00', emotion: 'sad', confidence: 0.7 }, { time: '10:00', emotion: 'sad', confidence: 0.6 }, { time: '20:00', emotion: 'neutral', confidence: 0.5 },
        { time: '30:00', emotion: 'sad', confidence: 0.65 }, { time: '40:00', emotion: 'fear', confidence: 0.3 }, { time: '50:00', emotion: 'sad', confidence: 0.7 }
      ]
    },
    {
      id: 'sesion-3', fecha: '5/06/2025', hora: '14:00 p. m.', paciente: 'Pedro López', edad: 40, diagnostico: 'Estrés', duracion: '1 minuto', emocionPredominante: 'happy', confianza: 0.90,
      temporalEmotions: [
        { time: '0:00', emotion: 'happy', confidence: 0.85 }, { time: '5:00', emotion: 'happy', confidence: 0.9 }, { time: '10:00', emotion: 'neutral', confidence: 0.7 },
        { time: '15:00', emotion: 'happy', confidence: 0.8 }, { time: '20:00', emotion: 'surprise', confidence: 0.5 }, { time: '25:00', emotion: 'happy', confidence: 0.88 }
      ]
    }
  ];

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      this.sessionId = params.get('id');
      this.loadSessionDetails();
    });
  }

  ngAfterViewInit(): void {
    // Delay para asegurar que el canvas esté renderizado
    setTimeout(() => {
      if (this.sessionDetails) {
        this.renderEmotionGraph();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  loadSessionDetails(): void {
    console.log('🔍 Cargando sesión con ID:', this.sessionId);
    
    if (this.sessionId) {
      // Intentar cargar desde allSessions (datos mock)
      let foundSession = this.allSessions.find(session => session.id === this.sessionId);
      console.log('📦 Sesión encontrada en datos mock:', foundSession);

      // Si no se encuentra, intentar cargar desde localStorage
      if (!foundSession) {
        console.log('🔄 Intentando cargar desde localStorage...');
        foundSession = this.loadSessionFromStorage(this.sessionId);
        console.log('💾 Sesión encontrada en localStorage:', foundSession);
      }

      if (!foundSession) {
        console.error('❌ Sesión no encontrada con ID:', this.sessionId);
        console.log('📋 Sesiones disponibles en mock:', this.allSessions.map(s => s.id));
        console.log('📋 Sesiones en localStorage:', this.getAllSessionIdsFromStorage());
        foundSession = this.createFallbackSession(this.sessionId);
      }

      this.sessionDetails = foundSession;
      console.log('✅ Detalles de la sesión listos para mostrar:', this.sessionDetails);

      // Renderizar el gráfico después de cargar los datos
      setTimeout(() => {
        this.renderEmotionGraph();
      }, 100);
    } else {
      console.warn('⚠️ No se proporcionó ID de sesión en la ruta.');
      this.sessionDetails = this.createFallbackSession('sin-id');
    }
  }

  private getAllSessionIdsFromStorage(): string[] {
    try {
      const savedSessionsData = localStorage.getItem('sesiones_guardadas');
      if (savedSessionsData) {
        const savedSessions = JSON.parse(savedSessionsData);
        return savedSessions.map((s: any) => s.id?.toString() || 'sin-id');
      }
    } catch (error) {
      console.error('Error al leer IDs de localStorage:', error);
    }
    return [];
  }

  private createFallbackSession(sessionId: string): SessionWithTemporalData {
    console.log('🆘 Creando sesión de respaldo para ID:', sessionId);
    return {
      id: sessionId,
      fecha: new Date().toLocaleDateString('es-ES'),
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      paciente: 'Información no disponible',
      edad: 0,
      diagnostico: 'No especificado',
      duracion: '0 minutos',
      emocionPredominante: 'neutral',
      confianza: 0.5,
      notasSesion: 'Esta sesión no tiene datos disponibles. Es posible que haya sido eliminada o que el ID sea incorrecto.',
      temporalEmotions: this.generateMockTemporalData('neutral'),
      recomendaciones: []
    };
  }

  private loadSessionFromStorage(sessionId: string): SessionWithTemporalData | undefined {
    try {
      // Cargar sesiones guardadas del localStorage
      const savedSessionsData = localStorage.getItem('sesiones_guardadas');
      if (savedSessionsData) {
        const savedSessions = JSON.parse(savedSessionsData);
        const savedSession = savedSessions.find((s: any) => s.id?.toString() === sessionId);
        
        if (savedSession) {
          const fecha = new Date(savedSession.fecha_sesion || savedSession.fecha);
          const duracionMinutos = savedSession.duracion_minutos || 0;
          
          // Convertir emotionsHistory a temporalEmotions
          let temporalEmotions: { time: string; emotion: string; confidence: number; }[] = [];
          if (savedSession.emotionsHistory && Array.isArray(savedSession.emotionsHistory)) {
            temporalEmotions = savedSession.emotionsHistory.map((emotion: any) => ({
              time: this.formatTimestamp(emotion.timestamp),
              emotion: emotion.emotion,
              confidence: emotion.confidence
            }));
          }
          
          // Si no hay datos temporales, generar datos mock
          if (temporalEmotions.length === 0) {
            temporalEmotions = this.generateMockTemporalData(savedSession.emocion_predominante || 'neutral');
          }
          
          return {
            id: savedSession.id?.toString() || '',
            fecha: fecha.toLocaleDateString('es-ES'),
            hora: fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            paciente: savedSession.paciente_nombre || 'Paciente desconocido',
            edad: savedSession.paciente?.edad || 0,
            diagnostico: savedSession.diagnostico || 'No especificado',
            duracion: `${duracionMinutos} minutos`,
            emocionPredominante: savedSession.emocion_predominante || 'neutral',
            confianza: savedSession.confianza_promedio || savedSession.confianza || 0,
            notasSesion: savedSession.notas || 'No hay notas disponibles para esta sesión.',
            temporalEmotions: temporalEmotions,
            recomendaciones: savedSession.recomendaciones || []
          };
        }
      }
    } catch (error) {
      console.error('Error al cargar sesión desde localStorage:', error);
    }
    return undefined;
  }

  private formatTimestamp(timestamp: string): string {
    // Convertir timestamp a formato de tiempo mm:ss
    const date = new Date(timestamp);
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private generateMockTemporalData(predominantEmotion: string): { time: string; emotion: string; confidence: number; }[] {
    // Generar datos temporales básicos si no existen
    const times = ['0:00', '5:00', '10:00', '15:00', '20:00', '25:00'];
    return times.map(time => ({
      time,
      emotion: predominantEmotion,
      confidence: 0.6 + Math.random() * 0.3 // Confianza entre 0.6 y 0.9
    }));
  }

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

  getEmotionSummary(): Array<{ key: string; name: string; percentage: number }> {
    if (!this.sessionDetails || !this.sessionDetails.temporalEmotions) {
      return [];
    }

    // Calcular el porcentaje de cada emoción basado en los datos temporales
    const emotionCounts: { [key: string]: number } = {};
    const emotionNames: { [key: string]: string } = {
      'neutral': 'Neutral',
      'fear': 'Feliz',
      'sad': 'Triste'
    };

    this.sessionDetails.temporalEmotions.forEach(temp => {
      if (!emotionCounts[temp.emotion]) {
        emotionCounts[temp.emotion] = 0;
      }
      emotionCounts[temp.emotion] += temp.confidence;
    });

    const total = Object.values(emotionCounts).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(emotionCounts)
      .map(([key, value]) => ({
        key,
        name: emotionNames[key] || key.charAt(0).toUpperCase() + key.slice(1),
        percentage: Math.round((value / total) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3); // Mostrar solo las 3 principales como en la imagen
  }

  renderEmotionGraph(): void {
    if (!this.sessionDetails || !this.sessionDetails.temporalEmotions || this.sessionDetails.temporalEmotions.length === 0) {
      console.warn('No hay datos temporales para renderizar el gráfico.');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.sessionDetails.temporalEmotions.map(data => data.time);
    const emotions = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise'];

    const datasets = emotions.map(emotion => {
      const dataForEmotion = labels.map(label => {
        const entry = this.sessionDetails!.temporalEmotions!.find(temp => temp.time === label && temp.emotion === emotion);
        return entry ? entry.confidence * 100 : 0;
      });

      const emotionColors: { [key: string]: string } = {
        'angry': '#dc3545', 'disgust': '#28a745', 'fear': '#ffc107', 'happy': '#20c997',
        'neutral': '#6c757d', 'sad': '#007bff', 'surprise': '#17a2b8'
      };

      return {
        label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        data: dataForEmotion,
        borderColor: emotionColors[emotion] || '#000',
        fill: false,
        tension: 0.1
      };
    }).filter(dataset => dataset.data.some(value => value > 0));

    const ctx = this.emotionChartCanvas.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Confianza (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Tiempo de Sesión'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Evolución Temporal de Emociones'
          }
        }
      }
    });
  }

  downloadReport(): void {
    console.log('Iniciando descarga de reporte PDF para:', this.sessionDetails?.id);
    const reportElement = document.querySelector('.report-container');

    if (!reportElement) {
      console.error('Elemento del reporte no encontrado.');
      alert('Error: No se pudo generar el reporte PDF. Elemento no encontrado.');
      return;
    }

    const options = {
      scale: 2
    };

    html2canvas(reportElement as HTMLElement, options).then(canvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `reporte_sesion_${this.sessionDetails?.id || ''}.pdf`;
      pdf.save(filename);
      console.log('Reporte PDF generado y descargado.', filename);
      alert(`Reporte PDF ${filename} generado y descargado.`);
    }).catch(err => {
      console.error('Error al generar el PDF:', err);
      alert('Error al generar el reporte PDF.');
    });
  }

  printReport(): void {
    console.log('Imprimiendo reporte para:', this.sessionDetails?.id);
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/historial-sesiones']);
  }

} 