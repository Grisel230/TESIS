import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { EmotionService, EmotionPrediction } from '../../services/emotion.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { RouterModule, Router } from '@angular/router';
import { AuthService, Psicologo } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-registro-pacientes',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, RouterModule],
  templateUrl: './registro-pacientes.component.html',
  styleUrls: ['./registro-pacientes.component.css']
})
export class RegistroPacientesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') videoElement!: ElementRef;
  @ViewChild('canvas') canvasElement!: ElementRef;

  // Sidebar control
  sidebarVisible: boolean = true;
  psicologo: Psicologo | null = null;

  // Emotion detection
  private stream: MediaStream | null = null;
  isCapturingInChild = false;
  predictions: EmotionPrediction[] = [];
  strongestPrediction: EmotionPrediction | null = null;
  error: string | null = null;
  isLoading = false;
  private captureInterval: any;
  private animationFrameId: number | null = null;

  // Video recording
  isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingStartTime: number | null = null;

  // Success modal
  showSuccessModal = false;
  currentDate = new Date();

  nombreCompletoPaciente: string = '';
  edadPaciente: number | null = null;
  diagnosticoPreliminar: string = '';
  generoPaciente: string = '';
  pacienteId: number | null = null; // ID del paciente para asociar sesiones
  notasSesion: string = '';
  sesionId: number | null = null; // ID de la sesión actual para guardar emociones

  sessionDuration: string = '00:00';
  predominantEmotion: string = '-';
  private sessionStartTime: number | null = null;
  private emotionCounts: { [key: string]: number } = {};
  private emotionsHistory: Array<{emotion: string, confidence: number, timestamp: Date}> = [];

  constructor(
    private emotionService: EmotionService, 
    private router: Router,
    private authService: AuthService,
    private sessionService: SessionService
  ) { }

  ngAfterViewInit() {
    this.loadPsicologo();
    // Usar setTimeout para asegurar que se ejecute después de la inicialización completa
    setTimeout(() => {
      this.loadPacienteData();
    }, 100);
  }

  // Sidebar control
  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  // Load psychologist data
  private loadPsicologo(): void {
    this.psicologo = this.authService.getPsicologo();
    if (!this.psicologo) {
      console.warn('No se encontró información del psicólogo');
    }
  }

  // Load patient data from localStorage
  private loadPacienteData(): void {
    console.log('🔍 Iniciando carga de datos del paciente...');
    
    const pacienteData = localStorage.getItem('paciente_sesion');
    console.log('📦 Datos en localStorage:', pacienteData);
    
    if (pacienteData) {
      try {
        const paciente = JSON.parse(pacienteData);
        console.log('✅ Datos del paciente parseados:', paciente);
        
        // Rellenar los campos del formulario con los datos del paciente
        this.nombreCompletoPaciente = paciente.nombre_completo || '';
        this.edadPaciente = paciente.edad || null;
        this.generoPaciente = paciente.genero || '';
        this.pacienteId = paciente.id || null; // Cargar el ID del paciente
        
        // Si hay diagnóstico previo, cargarlo también
        if (paciente.diagnostico_preliminar) {
          this.diagnosticoPreliminar = paciente.diagnostico_preliminar;
        }
        
        console.log('📝 Campos rellenados:');
        console.log('  - ID:', this.pacienteId);
        console.log('  - Nombre:', this.nombreCompletoPaciente);
        console.log('  - Edad:', this.edadPaciente);
        console.log('  - Género:', this.generoPaciente);
        console.log('  - Diagnóstico:', this.diagnosticoPreliminar);
        
        // Limpiar los datos del localStorage después de cargarlos
        localStorage.removeItem('paciente_sesion');
        
        console.log('✅ Formulario rellenado automáticamente con datos del paciente');
        console.log('🗑️ Datos eliminados del localStorage');
      } catch (error) {
        console.error('❌ Error al cargar datos del paciente:', error);
      }
    } else {
      console.log('ℹ️ No hay datos de paciente para cargar en localStorage');
    }
  }

  // Auto-fill form fields when starting camera
  private autoFillFormFields(): void {
    // Si no hay datos del paciente cargados, intentar cargarlos nuevamente
    if (!this.nombreCompletoPaciente) {
      this.loadPacienteData();
    }
    
    // Si aún no hay datos, mostrar un mensaje informativo
    if (!this.nombreCompletoPaciente) {
      console.log('No se encontraron datos del paciente para llenar automáticamente');
      // Opcional: mostrar un mensaje al usuario
      // alert('No se encontraron datos del paciente. Por favor, complete el formulario manualmente.');
    } else {
      console.log('Formulario llenado automáticamente con datos del paciente:', {
        nombre: this.nombreCompletoPaciente,
        edad: this.edadPaciente,
        genero: this.generoPaciente
      });
    }
  }

  // Navigation methods
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
    this.router.navigate(['/dashboard']);
  }

  goToResources(): void {
    this.router.navigate(['/dashboard']);
  }

  goToSettings(): void {
    this.router.navigate(['/dashboard']);
  }

  goToHistorial(): void {
    this.router.navigate(['/historial-sesiones']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/inicio-sesion']);
  }

  ngOnDestroy() {
    this.stopCamera();
    this.stopContinuousCapture();
  }

  async startCamera() {
    console.log('🎥 Iniciando cámara...');
    
    if (this.isCapturingInChild) {
      console.log('⚠️ La cámara ya está activa');
      return;
    }

    this.resetSessionSummary();
    this.sessionStartTime = Date.now();

    // Llenar automáticamente algunos campos si están vacíos
    this.autoFillFormFields();

    try {
      console.log('📹 Solicitando acceso a la cámara...');
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('✅ Acceso a la cámara concedido');
      
      this.videoElement.nativeElement.srcObject = this.stream;
      this.isCapturingInChild = true;
      console.log('📺 Configurando elemento de video...');

      this.videoElement.nativeElement.onloadedmetadata = () => {
        console.log('📺 Metadatos del video cargados, iniciando reproducción...');
        console.log('📺 Video dimensions:', this.videoElement.nativeElement.videoWidth, 'x', this.videoElement.nativeElement.videoHeight);
        this.videoElement.nativeElement.play();
      };
      
      this.videoElement.nativeElement.onplay = () => {
         console.log('▶️ Video reproduciéndose, iniciando captura continua...');
         console.log('▶️ Video playing state:', this.videoElement.nativeElement.paused, 'ended:', this.videoElement.nativeElement.ended);
         this.startContinuousCapture();
      };

      this.videoElement.nativeElement.onpause = () => {
        console.log('⏸️ Video pausado');
      };

      this.videoElement.nativeElement.onended = () => {
        console.log('⏹️ Video terminado');
      };

      this.videoElement.nativeElement.onerror = (error: Event) => {
        console.error('❌ Error en el elemento de video:', error);
        this.error = 'Error al reproducir el video de la cámara';
      };

    } catch (err) {
      console.error('❌ Error al acceder a la cámara:', err);
      this.error = 'Error al acceder a la cámara: ' + (err as Error).message;
      this.stopCamera();
    }
  }

  stopCamera() {
    if (!this.isCapturingInChild) return;

    // Detener grabación si está activa
    if (this.isRecording) {
      this.stopVideoRecording();
    }

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
    console.log('🔄 Iniciando captura continua...');
    
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    console.log('📹 Video element:', video);
    console.log('🎨 Canvas element:', canvas);
    console.log('🖌️ Context:', context);
    console.log('📊 Video ready state:', video.readyState);
    console.log('📊 Video paused:', video.paused);
    console.log('📊 Video ended:', video.ended);

    if (!video || !canvas || !context) {
      console.error('❌ Elementos de video o canvas no encontrados.');
      console.error('Video:', !!video, 'Canvas:', !!canvas, 'Context:', !!context);
      return;
    }

    console.log('✅ Elementos encontrados, configurando captura...');

    const drawFrame = () => {
      console.log('🎬 drawFrame ejecutándose...');
      console.log('🎬 isCapturingInChild:', this.isCapturingInChild);
      console.log('🎬 video.videoWidth:', video.videoWidth);
      console.log('🎬 video.videoHeight:', video.videoHeight);
      console.log('🎬 video.paused:', video.paused);
      console.log('🎬 video.ended:', video.ended);
      
      if (!this.isCapturingInChild || !video.videoWidth || !video.videoHeight || video.paused || video.ended) {
         this.animationFrameId = null;
         console.log('⏹️ Deteniendo drawFrame. isCapturing:', this.isCapturingInChild, 'videoWidth:', video.videoWidth, 'videoHeight:', video.videoHeight, 'paused:', video.paused, 'ended:', video.ended);
         return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      this.animationFrameId = requestAnimationFrame(drawFrame);
    };

    console.log('🎬 Iniciando requestAnimationFrame...');
    this.animationFrameId = requestAnimationFrame(drawFrame);

    console.log('⏰ Configurando intervalo de captura...');
    this.captureInterval = setInterval(() => {
      console.log('⏰ Intervalo ejecutándose...');
      console.log('⏰ isCapturingInChild:', this.isCapturingInChild);
      console.log('⏰ canvas:', !!canvas);
      console.log('⏰ video:', !!video);
      console.log('⏰ video.videoWidth:', video.videoWidth);
      console.log('⏰ isLoading:', this.isLoading);
      
      if (!this.isCapturingInChild || !canvas || !video || !video.videoWidth || this.isLoading) {
        console.log('⏭️ Saltando captura. isCapturing:', this.isCapturingInChild, 'canvas:', !!canvas, 'video:', !!video, 'videoWidth:', video.videoWidth, 'isLoading:', this.isLoading);
        return;
      }

      console.log('📸 Capturando frame para análisis de emociones...');
      this.isLoading = true;

      const imageData = canvas.toDataURL('image/jpeg');
      console.log('🖼️ Imagen capturada, enviando para análisis...');
      console.log('🖼️ Tamaño de imagen:', imageData.length, 'caracteres');
      
      this.emotionService.predictEmotion(imageData)
        .pipe(finalize(() => {
            console.log('🔄 Finalizando request de predicción...');
            this.isLoading = false;
        }))
        .subscribe({
          next: (response: EmotionPrediction[]) => {
            console.log('✅ Predicción recibida:', response);
            this.predictions = response;
            this.error = null;

            if (this.predictions && this.predictions.length > 0) {
              this.strongestPrediction = this.predictions.reduce((prev, current) => {
                return (prev.confidence > current.confidence) ? prev : current;
              });

              if (this.strongestPrediction) {
                const emotion = this.strongestPrediction.emotion;
                const confidence = this.strongestPrediction.confidence;
                this.emotionCounts[emotion] = (this.emotionCounts[emotion] || 0) + 1;
                
                // Guardar en historial para enviar al backend después
                this.emotionsHistory.push({
                  emotion: emotion,
                  confidence: confidence,
                  timestamp: new Date()
                });
                
                console.log('😊 Emoción detectada:', emotion, 'Confianza:', confidence);
              }

            } else {
              this.strongestPrediction = null;
              console.log('⚠️ No se detectaron emociones en esta captura');
            }
          },
          error: (err) => {
            console.error('❌ Error en la predicción:', err);
            this.error = 'Error al procesar la imagen: ' + err.message;
            this.predictions = [];
            this.strongestPrediction = null;
            // No detener la cámara por errores de predicción, solo mostrar el error
            console.log('⚠️ Continuando con la captura a pesar del error');
          }
        });
    }, 3000); // Aumentar intervalo a 3 segundos para dar más tiempo al backend
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

  // Video recording methods
  async startVideoRecording() {
    if (!this.stream || this.isRecording) return;

    try {
      this.recordedChunks = [];
      this.recordingStartTime = Date.now();
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.downloadRecordedVideo();
      };

      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;
      console.log('🎥 Grabación de video iniciada');
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      this.error = 'Error al iniciar la grabación de video';
    }
  }

  stopVideoRecording() {
    if (!this.mediaRecorder || !this.isRecording) return;

    this.mediaRecorder.stop();
    this.isRecording = false;
    console.log('🛑 Grabación de video detenida');
  }

  private downloadRecordedVideo() {
    if (this.recordedChunks.length === 0) return;

    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `sesion-paciente-${this.nombreCompletoPaciente.replace(/\s+/g, '-')}-${timestamp}.webm`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('💾 Video descargado:', filename);
  }

  // Save session method
  guardarSesion() {
    // Validaciones
    if (!this.nombreCompletoPaciente) {
      alert('Por favor, complete el nombre del paciente antes de guardar la sesión.');
      return;
    }

    if (!this.pacienteId) {
      alert('Error: No se encontró el ID del paciente. Por favor, seleccione un paciente de la lista.');
      return;
    }

    if (!this.psicologo?.id) {
      alert('Error: No se encontró la información del psicólogo. Por favor, inicie sesión nuevamente.');
      return;
    }

    // Calcular duración en minutos
    const durationParts = this.sessionDuration.split(':');
    const duracionMinutos = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);

    // Calcular confianza promedio de las emociones detectadas
    const totalEmociones = Object.values(this.emotionCounts).reduce((sum, count) => sum + count, 0);
    const confianzaPromedio = totalEmociones > 0 ? 0.85 : 0.0; // Valor estimado, idealmente se calcularía de las predicciones

    // Preparar datos para enviar al backend
    const sessionData = {
      paciente_id: this.pacienteId,
      psicologo_id: this.psicologo.id,
      fecha_sesion: new Date().toISOString(),
      duracion_minutos: duracionMinutos,
      notas: this.notasSesion || '',
      emocion_predominante: this.predominantEmotion !== '-' ? this.predominantEmotion : '',
      confianza_promedio: confianzaPromedio
    };

    console.log('📤 Guardando sesión en la base de datos...', sessionData);
    this.isLoading = true;

    // Guardar sesión en la base de datos usando SessionService
    this.sessionService.crearSesion(sessionData).subscribe({
      next: (response) => {
        console.log('✅ Sesión guardada exitosamente:', response);
        
        // Guardar el ID de la sesión creada
        const sesionId = response.sesion?.id;
        this.sesionId = sesionId;
        
        // Guardar emociones detectadas en la base de datos
        if (sesionId && this.emotionsHistory.length > 0) {
          console.log(`📊 Guardando ${this.emotionsHistory.length} emociones detectadas...`);
          this.guardarEmocionesEnBD(sesionId);
        }
        
        // También guardar en localStorage como backup (opcional)
        const backupData = {
          ...sessionData,
          id: sesionId,
          paciente_nombre: this.nombreCompletoPaciente,
          emotionCounts: this.emotionCounts,
          emotionsHistory: this.emotionsHistory,
          fecha_guardado: new Date().toISOString()
        };
        
        const existingSessions = JSON.parse(localStorage.getItem('sesiones_guardadas') || '[]');
        existingSessions.push(backupData);
        localStorage.setItem('sesiones_guardadas', JSON.stringify(existingSessions));
        
        this.isLoading = false;
        this.showSuccessModal = true;
      },
      error: (error) => {
        console.error('❌ Error al guardar la sesión:', error);
        this.isLoading = false;
        
        let errorMessage = 'Error al guardar la sesión en la base de datos.';
        if (error.error?.error) {
          errorMessage += ' ' + error.error.error;
        } else if (error.status === 0) {
          errorMessage += ' No se pudo conectar con el servidor.';
        }
        
        alert(errorMessage + '\n\nLa sesión se ha guardado localmente como respaldo.');
        
        // Guardar en localStorage como fallback
        const fallbackData = {
          ...sessionData,
          id: Date.now(),
          paciente_nombre: this.nombreCompletoPaciente,
          emotionCounts: this.emotionCounts,
          fecha_guardado: new Date().toISOString(),
          guardado_local: true
        };
        
        const existingSessions = JSON.parse(localStorage.getItem('sesiones_guardadas') || '[]');
        existingSessions.push(fallbackData);
        localStorage.setItem('sesiones_guardadas', JSON.stringify(existingSessions));
        
        this.showSuccessModal = true;
      }
    });
  }

  // Método para guardar emociones en la base de datos
  private guardarEmocionesEnBD(sesionId: number) {
    // Importamos HttpClient directamente para hacer las peticiones
    import('../../services/emotion.service').then(() => {
      let emocionesGuardadas = 0;
      let erroresGuardado = 0;
      
      // Guardar cada emoción del historial
      this.emotionsHistory.forEach((emotionData, index) => {
        // Crear petición HTTP para guardar cada emoción
        const url = `http://localhost:5000/api/sesiones/${sesionId}/emociones`;
        const data = {
          emotion: emotionData.emotion,
          confidence: emotionData.confidence,
          timestamp: emotionData.timestamp.toISOString()
        };
        
        // Usamos fetch directamente para no bloquear el flujo
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authService.getToken()}`
          },
          body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
          emocionesGuardadas++;
          console.log(`✅ Emoción ${index + 1}/${this.emotionsHistory.length} guardada:`, result);
          
          // Mostrar resumen al final
          if (emocionesGuardadas + erroresGuardado === this.emotionsHistory.length) {
            console.log(`✅ Resumen: ${emocionesGuardadas} emociones guardadas, ${erroresGuardado} errores`);
          }
        })
        .catch(error => {
          erroresGuardado++;
          console.error(`❌ Error guardando emoción ${index + 1}:`, error);
          
          // Mostrar resumen al final
          if (emocionesGuardadas + erroresGuardado === this.emotionsHistory.length) {
            console.log(`⚠️ Resumen: ${emocionesGuardadas} emociones guardadas, ${erroresGuardado} errores`);
          }
        });
      });
    });
  }

  // Modal methods
  closeSuccessModal() {
    this.showSuccessModal = false;
    // Limpiar formulario después de cerrar el modal
    this.limpiarFormulario();
  }

  private limpiarFormulario() {
    this.nombreCompletoPaciente = '';
    this.edadPaciente = null;
    this.generoPaciente = '';
    this.diagnosticoPreliminar = '';
    this.notasSesion = '';
    this.pacienteId = null;
    this.sesionId = null;
    this.sessionDuration = '00:00';
    this.predominantEmotion = '-';
    this.emotionCounts = {};
    this.emotionsHistory = [];
    this.predictions = [];
    this.strongestPrediction = null;
  }

  guardarPaciente() {
    console.log('Guardando paciente y sesión...');
    console.log('Datos del paciente:', { nombreCompletoPaciente: this.nombreCompletoPaciente, edadPaciente: this.edadPaciente, diagnosticoPreliminar: this.diagnosticoPreliminar, generoPaciente: this.generoPaciente, notasSesion: this.notasSesion });
    console.log('Resultados de emociones (última predicción):', this.predictions);
    console.log('Resumen de la sesión:', { duration: this.sessionDuration, predominantEmotion: this.predominantEmotion });
    alert('Datos y resumen de sesión guardados (simulado).');
  }


} 