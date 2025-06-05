import { Component, ElementRef, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmotionService, EmotionPrediction } from '../../services/emotion.service';
import { finalize } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-emotion-detector',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './emotion-detector.component.html',
  styleUrls: ['./emotion-detector.component.scss']
})
export class EmotionDetectorComponent implements OnDestroy {
  @ViewChild('video') videoElement!: ElementRef;
  @ViewChild('canvas') canvasElement!: ElementRef;

  @Output() predictionsChange = new EventEmitter<EmotionPrediction[]>();
  @Output() strongestPredictionChange = new EventEmitter<EmotionPrediction | null>();
  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() errorChange = new EventEmitter<string | null>();
  @Output() isCapturingChange = new EventEmitter<boolean>();

  private stream: MediaStream | null = null;
  isCapturing = false;
  predictions: EmotionPrediction[] = [];
  strongestPrediction: EmotionPrediction | null = null;
  error: string | null = null;
  isLoading = false;
  private captureInterval: any;
  private animationFrameId: number | null = null;

  constructor(private emotionService: EmotionService) {}

  ngOnDestroy() {
    this.stopCamera();
  }

  async startCamera() {
    if (this.isCapturing) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = this.stream;
      this.isCapturing = true;
      this.isCapturingChange.emit(this.isCapturing);

      this.videoElement.nativeElement.onloadedmetadata = () => {
        this.videoElement.nativeElement.play();
      };
      this.videoElement.nativeElement.onplay = () => {
         console.log('Video is playing, starting continuous capture.');
         this.startContinuousCapture();
      };

    } catch (err) {
      this.error = 'Error al acceder a la cámara';
      this.errorChange.emit(this.error);
      console.error(err);
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isCapturing = false;
    this.isCapturingChange.emit(this.isCapturing);
    this.stopContinuousCapture();
    this.predictions = [];
    this.predictionsChange.emit(this.predictions);
    this.strongestPrediction = null;
    this.strongestPredictionChange.emit(this.strongestPrediction);
    this.error = null;
    this.errorChange.emit(this.error);

    if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.onloadedmetadata = null;
        this.videoElement.nativeElement.onplay = null;
    }
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
      if (!this.isCapturing || !video.videoWidth || !video.videoHeight) {
         this.animationFrameId = null;
         console.log('Deteniendo drawFrame.');
         return;
      }

      console.log(`Video Dimensions: ${video.videoWidth}x${video.videoHeight}`);
      console.log(`Canvas Dimensions (before): ${canvas.width}x${canvas.height}`);

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      console.log(`Canvas Dimensions (after): ${canvas.width}x${canvas.height}`);

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      this.animationFrameId = requestAnimationFrame(drawFrame);
    };

    this.animationFrameId = requestAnimationFrame(drawFrame);

    // --- Reactivado: Intervalo para enviar imagen al backend ---
    this.captureInterval = setInterval(() => {
      if (!this.isCapturing || !canvas || !video || !video.videoWidth || this.isLoading) {
        return;
      }

      this.isLoading = true;
      this.loadingChange.emit(this.isLoading);

      const imageData = canvas.toDataURL('image/jpeg');
      this.emotionService.predictEmotion(imageData)
        .pipe(finalize(() => {
            this.isLoading = false;
            this.loadingChange.emit(this.isLoading);
        }))
        .subscribe({
          next: (response: EmotionPrediction[]) => {
            this.predictions = response;
            this.predictionsChange.emit(this.predictions);

            this.error = null;
            this.errorChange.emit(this.error);

            if (this.predictions && this.predictions.length > 0) {
              this.strongestPrediction = this.predictions.reduce((prev, current) => {
                return (prev.confidence > current.confidence) ? prev : current;
              });
            } else {
              this.strongestPrediction = null;
            }
            this.strongestPredictionChange.emit(this.strongestPrediction);
          },
          error: (err) => {
            this.error = 'Error al procesar la imagen';
            this.errorChange.emit(this.error);
            console.error('Error en la predicción:', err);

            this.predictions = [];
            this.predictionsChange.emit(this.predictions);

            this.strongestPrediction = null;
            this.strongestPredictionChange.emit(this.strongestPrediction);
          }
        });
    }, 500); // Ajusta el intervalo según sea necesario
    // --- Fin: Reactivado ---
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
    this.loadingChange.emit(this.isLoading);
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
} 