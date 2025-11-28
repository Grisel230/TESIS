import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportData } from '../../services/report.service';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.css']
})
export class ReportModalComponent implements OnInit {
  @Input() isVisible = false;
  @Input() reportData: ReportData | null = null;
  @Input() reportType = '';
  @Output() closeModal = new EventEmitter<void>();
  @Output() downloadReport = new EventEmitter<{ data: ReportData, type: string }>();

  ngOnInit(): void {}

  onClose(): void {
    this.closeModal.emit();
  }

  onDownload(): void {
    if (this.reportData) {
      this.downloadReport.emit({ data: this.reportData, type: this.reportType });
    }
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getReportTitle(): string {
    const titles: { [key: string]: string } = {
      'monthly': 'Reporte Mensual de Análisis Emocional',
      'patient': 'Análisis Detallado por Paciente',
      'trends': 'Análisis de Tendencias Emocionales',
      'efficiency': 'Reporte de Eficiencia Terapéutica'
    };
    return titles[this.reportType] || 'Reporte de Análisis Emocional';
  }

  getEmotionIcon(emotion: string): string {
    const icons: { [key: string]: string } = {
      'Felicidad': '😊',
      'Tristeza': '😢',
      'Enojo': '😠',
      'Miedo': '😨',
      'Sorpresa': '😲',
      'Neutral': '😐'
    };
    return icons[emotion] || '😐';
  }

  getProgressColor(progress: number): string {
    if (progress >= 70) return '#10b981'; // Verde
    if (progress >= 50) return '#f59e0b'; // Amarillo
    return '#ef4444'; // Rojo
  }

  getTrendIcon(trend: string): string {
    const icons = {
      'up': '📈',
      'down': '📉',
      'stable': '➡️'
    };
    return icons[trend as keyof typeof icons] || '➡️';
  }
}
