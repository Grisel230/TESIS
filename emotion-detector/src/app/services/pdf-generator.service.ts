import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  constructor() { }

  async generateManualPDF(title: string, content: string, filename: string): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Configuración de fuente
    doc.setFont('helvetica');

    // Título principal
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(title, maxWidth);
    doc.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * 7 + 10;

    // Fecha
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, margin, yPosition);
    yPosition += 15;

    // Línea separadora
    doc.setDrawColor(59, 130, 246); // Azul
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Contenido
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal'); // Helvetica es más legible

    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Verificar si necesitamos una nueva página
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      // Detectar líneas especiales para dar formato
      if (line.includes('═══════════')) {
        // Línea decorativa gruesa
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(1);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      } else if (line.includes('━━━━━━━━━━━')) {
        // Línea decorativa delgada
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      } else if (line.trim().length === 0) {
        // Línea vacía
        yPosition += 4;
      } else {
        // Texto normal
        const textLines = doc.splitTextToSize(line, maxWidth);
        
        // Detectar títulos (líneas en mayúsculas o con ciertos patrones)
        if (line === line.toUpperCase() && line.trim().length > 0 && line.trim().length < 60) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(textLines, margin, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
        } else {
          doc.text(textLines, margin, yPosition);
        }
        
        yPosition += textLines.length * 5;
      }
    }

    // Pie de página en todas las páginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Página ${i} de ${totalPages} - Sistema de Análisis Emocional`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Descargar el PDF
    doc.save(filename);
  }

  async generateGuiaUso(): Promise<void> {
    const content = await this.loadTextFile('/resources/guia-uso.txt');
    await this.generateManualPDF(
      'GUÍA DE USO DEL SISTEMA - Sistema de Análisis Emocional',
      content,
      'Guia-Uso-Sistema.pdf'
    );
  }

  async generatePlantillaEvaluacion(): Promise<void> {
    const content = await this.loadTextFile('/resources/plantilla-evaluacion.txt');
    await this.generateManualPDF(
      'PLANTILLA DE EVALUACIÓN EMOCIONAL',
      content,
      'Plantilla-Evaluacion.pdf'
    );
  }

  async generateProtocoloAnalisis(): Promise<void> {
    const content = await this.loadTextFile('/resources/protocolo-analisis.txt');
    await this.generateManualPDF(
      'PROTOCOLO DE ANÁLISIS EMOCIONAL FACIAL',
      content,
      'Protocolo-Analisis.pdf'
    );
  }

  async generateTutorialPrimerosPasos(): Promise<void> {
    const content = await this.loadTextFile('/resources/tutorial-primeros-pasos.txt');
    await this.generateManualPDF(
      'TUTORIAL: PRIMEROS PASOS',
      content,
      'Tutorial-Primeros-Pasos.pdf'
    );
  }

  private async loadTextFile(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al cargar el archivo: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error cargando archivo:', error);
      return 'Error: No se pudo cargar el contenido del archivo.';
    }
  }
}
