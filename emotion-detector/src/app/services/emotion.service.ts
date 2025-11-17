import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Psicologo } from './auth.service';

export interface EmotionPrediction {
  emotion: string;
  confidence: number;
  all_predictions: { [key: string]: number };
  box?: [number, number, number, number];
}

export interface LoginResponse {
  message: string;
  token: string;
  psicologo: Psicologo;
}

export interface RegisterResponse {
  message: string;
  psicologo: Psicologo;
}

@Injectable({
  providedIn: 'root'
})
export class EmotionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  predictEmotion(imageData: string): Observable<EmotionPrediction[]> {
    const url = `${this.apiUrl.replace('/api', '')}/predict`;
    console.log('🔮 Enviando predicción de emoción a:', url);
    console.log('📊 Tamaño de imagen:', imageData.length, 'caracteres');
    console.log('🔮 HttpClient configurado correctamente');
    
    const request = this.http.post<EmotionPrediction[]>(url, { image: imageData });
    
    request.subscribe({
      next: (response) => {
        console.log('✅ Respuesta del servidor recibida:', response);
      },
      error: (error) => {
        console.error('❌ Error en la request HTTP:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Message:', error.message);
        console.error('❌ URL:', error.url);
      }
    });
    
    return request;
  }

  registerPsicologo(psicologoData: any): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, psicologoData);
  }

  loginPsicologo(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { 
      username: email, 
      password: password 
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getPsicologo(id: number): Observable<{psicologo: Psicologo}> {
    return this.http.get<{psicologo: Psicologo}>(`${this.apiUrl}/psicologo/${id}`);
  }

  // Métodos de recuperación de contraseña
  forgotPassword(email: string): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrl}/forgot-password`, { email });
  }

  verifyResetToken(token: string): Observable<{valid: boolean, error?: string}> {
    return this.http.get<{valid: boolean, error?: string}>(`${this.apiUrl}/verify-reset-token/${token}`);
  }

  resetPassword(token: string, password: string): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrl}/reset-password`, { token, password });
  }
} 