import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  total_pacientes: number;
  nuevos_pacientes: number;
  total_sesiones: number;
  sesiones_hoy: number;
  total_emociones: number;
  emociones_hoy: number;
  satisfaccion_promedio: number;
}

export interface ChartData {
  month: string;
  feliz: number;
  triste: number;
  enojado: number;
  neutral: number;
}

export interface ActivityItem {
  id: number;
  titulo: string;
  descripcion: string;
  tiempo: string;
  tipo: string;
  estado: string;
  estado_texto: string;
}

export interface DashboardData {
  estadisticas: DashboardStats;
  chart_data: ChartData[];
  actividad_reciente: ActivityItem[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDashboardStats(psicologoId: number): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard/stats/${psicologoId}`);
  }
}
