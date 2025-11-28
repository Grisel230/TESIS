import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Sesion {
  id?: number;
  paciente_id: number;
  psicologo_id: number;
  fecha_sesion: string;
  duracion_minutos: number;
  notas: string;
  emocion_predominante: string;
  confianza_promedio: number;
  paciente_nombre?: string;
}

export interface SesionDetalle extends Sesion {
  emociones_detectadas: EmocionDetectada[];
}

export interface EmocionDetectada {
  id: number;
  emotion: string;
  confidence: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Crear una nueva sesión
  crearSesion(sesion: Partial<Sesion>): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/sesiones`, sesion, { headers });
  }

  // Obtener sesiones de un psicólogo
  obtenerSesiones(psicologoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/sesiones/psicologo/${psicologoId}`);
  }

  // Obtener detalles de una sesión específica
  obtenerSesionDetalle(sesionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/sesiones/${sesionId}`);
  }

  // Eliminar una sesión
  eliminarSesion(sesionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sesiones/${sesionId}`);
  }

  // Obtener estadísticas de emociones
  obtenerEstadisticasEmociones(psicologoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas/emociones/${psicologoId}`);
  }

  // Obtener estadísticas de sesiones por mes
  obtenerEstadisticasSesionesMensuales(psicologoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas/sesiones-mensuales/${psicologoId}`);
  }

  // Obtener resumen general de estadísticas
  obtenerResumenEstadisticas(psicologoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas/resumen/${psicologoId}`);
  }
}
