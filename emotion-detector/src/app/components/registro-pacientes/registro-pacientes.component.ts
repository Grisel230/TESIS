import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { EmotionService, EmotionPrediction } from '../../services/emotion.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-registro-pacientes',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, RouterModule],
  providers: [EmotionService],
  templateUrl: './registro-pacientes.component.html',
  styleUrls: ['./registro-pacientes.component.css']
})
export class RegistroPacientesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') videoElement!: ElementRef;
  @ViewChild('canvas') canvasElement!: ElementRef;

  private stream: MediaStream | null = null;
  isCapturingInChild = false;
  predictions: EmotionPrediction[] = [];
  strongestPrediction: EmotionPrediction | null = null;
  error: string | null = null;
  isLoading = false;
  private captureInterval: any;
  private animationFrameId: number | null = null;

  nombreCompletoPaciente: string = '';
  edadPaciente: number | null = null;
  diagnosticoPreliminar: string = '';
  generoPaciente: string = '';
  notasSesion: string = '';

  sessionDuration: string = '00:00';
  predominantEmotion: string = '-';
  private sessionStartTime: number | null = null;
  private emotionCounts: { [key: string]: number } = {};

  constructor(private emotionService: EmotionService) { }

  ngAfterViewInit() { }

  ngOnDestroy() {
    this.stopCamera();
    this.stopContinuousCapture();
  }

  async startCamera() {
    if (this.isCapturingInChild) return;

    this.resetSessionSummary();
    this.sessionStartTime = Date.now();

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = this.stream;
      this.isCapturingInChild = true;

      this.videoElement.nativeElement.onloadedmetadata = () => {
        this.videoElement.nativeElement.play();
      };
      this.videoElement.nativeElement.onplay = () => {
         console.log('Video is playing, starting continuous capture.');
         this.startContinuousCapture();
      };

    } catch (err) {
      this.error = 'Error al acceder a la cámara';
      console.error(err);
      this.stopCamera();
    }
  }

  stopCamera() {
    if (!this.isCapturingInChild) return;

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.isCapturingInChild = false;
    this.stopContinuousCapture();
    this.predictions = [];
    this.strongestPrediction = null;
    this.error = null;

    if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.onloadedmetadata = null;
        this.videoElement.nativeElement.onplay = null;
    }

    this.updateSessionSummary();
  }

  startContinuousCapture() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!video || !canvas || !context) {
      console.error('Elementos de video o canvas no encontrados.');
      return;
    }

    const drawFrame = () => {
      if (!this.isCapturingInChild || !video.videoWidth || !video.videoHeight) {
         this.animationFrameId = null;
         console.log('Deteniendo drawFrame.');
         return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      this.animationFrameId = requestAnimationFrame(drawFrame);
    };

    this.animationFrameId = requestAnimationFrame(drawFrame);

    this.captureInterval = setInterval(() => {
      if (!this.isCapturingInChild || !canvas || !video || !video.videoWidth || this.isLoading) {
        return;
      }

      this.isLoading = true;

      const imageData = canvas.toDataURL('image/jpeg');
      this.emotionService.predictEmotion(imageData)
        .pipe(finalize(() => {
            this.isLoading = false;
        }))
        .subscribe({
          next: (response: EmotionPrediction[]) => {
            this.predictions = response;
            this.error = null;

            if (this.predictions && this.predictions.length > 0) {
              this.strongestPrediction = this.predictions.reduce((prev, current) => {
                return (prev.confidence > current.confidence) ? prev : current;
              });

              if (this.strongestPrediction) {
                const emotion = this.strongestPrediction.emotion;
                this.emotionCounts[emotion] = (this.emotionCounts[emotion] || 0) + 1;
              }

            } else {
              this.strongestPrediction = null;
            }
          },
          error: (err) => {
            this.error = 'Error al procesar la imagen';
            console.error('Error en la predicción:', err);
            this.predictions = [];
            this.strongestPrediction = null;
            this.stopCamera();
          }
        });
    }, 500);
  }

  stopContinuousCapture() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
    this.isLoading = false;
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

  updateSessionSummary() {
    if (this.sessionStartTime === null) return;

    const sessionEndTime = Date.now();
    const durationMs = sessionEndTime - this.sessionStartTime;

    const seconds = Math.floor((durationMs / 1000) % 60);
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    const formattedDuration = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
    this.sessionDuration = formattedDuration;

    let maxCount = 0;
    let predominant = '-';
    for (const emotion in this.emotionCounts) {
      if (this.emotionCounts[emotion] > maxCount) {
        maxCount = this.emotionCounts[emotion];
        predominant = emotion;
      }
    }
    this.predominantEmotion = predominant;

    console.log('Resumen de la sesión:', { duration: this.sessionDuration, predominantEmotion: this.predominantEmotion });
  }

  resetSessionSummary() {
    this.sessionStartTime = null;
    this.emotionCounts = {};
    this.sessionDuration = '00:00';
    this.predominantEmotion = '-';
    console.log('Resumen de la sesión reiniciado.');
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  guardarPaciente() {
    console.log('Guardando paciente y sesión...');
    console.log('Datos del paciente:', { nombreCompletoPaciente: this.nombreCompletoPaciente, edadPaciente: this.edadPaciente, diagnosticoPreliminar: this.diagnosticoPreliminar, generoPaciente: this.generoPaciente, notasSesion: this.notasSesion });
    console.log('Resultados de emociones (última predicción):', this.predictions);
    console.log('Resumen de la sesión:', { duration: this.sessionDuration, predominantEmotion: this.predominantEmotion });
    alert('Datos y resumen de sesión guardados (simulado).');
  }
} 