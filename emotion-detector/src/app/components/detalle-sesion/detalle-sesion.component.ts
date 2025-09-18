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
}

@Component({
  selector: 'app-detalle-sesion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-sesion.component.html',
  styleUrls: ['./detalle-sesion.component.css']
})
export class DetalleSesionComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('emotionChartCanvas') emotionChartCanvas!: ElementRef;
  private chart: Chart | undefined;

  sessionId: string | null = null;
  sessionDetails: SessionWithTemporalData | undefined;
  private routeSub: Subscription | undefined;

  private allSessions: SessionWithTemporalData[] = [
    {
      id: 'sesion-1', fecha: '5/06/2025', hora: '10:30 a. m.', paciente: 'Juan Pérez', edad: 25, diagnostico: 'Ansiedad', duracion: '20 segundos', emocionPredominante: 'neutral', confianza: 0.85,
      temporalEmotions: [
        { time: '0:00', emotion: 'neutral', confidence: 0.8 }, { time: '5:00', emotion: 'neutral', confidence: 0.75 }, { time: '10:00', emotion: 'happy', confidence: 0.6 },
        { time: '15:00', emotion: 'neutral', confidence: 0.7 }, { time: '20:00', emotion: 'sad', confidence: 0.4 }, { time: '25:00', emotion: 'neutral', confidence: 0.65 }
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
    if (this.sessionDetails) {
      this.renderEmotionGraph();
    }
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  loadSessionDetails(): void {
    if (this.sessionId) {
      this.sessionDetails = this.allSessions.find(session => session.id === this.sessionId);

      if (this.sessionDetails) {
        console.log('Detalles de la sesión cargados:', this.sessionDetails);
      } else {
        console.warn('Sesión no encontrada con ID:', this.sessionId);
      }
    } else {
      console.warn('No se proporcionó ID de sesión en la ruta.');
    }
  }

  getEmotionEmoji(emotion: string): string {
    const emojis: { [key: string]: string } = {
      'angry': '😠',
      'disgust': '🤢',
      'fear': '😨',
      'happy': '��',
      'neutral': '😐',
      'sad': '😢',
      'surprise': '😲'
    };
    return emojis[emotion] || '❓';
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

  logout() {
    console.log('Usuario ha cerrado sesión desde Detalle Sesión');
    this.router.navigate(['/inicio-sesion']);
  }

} 