import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Paciente {
  id?: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  edad: number;
  genero: string;
  email: string;
  telefono: string;
  direccion: string;
  diagnostico_preliminar: string;
  notas_generales: string;
}

export interface PacienteResponse {
  id: number;
  nombre_completo: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  psicologo_id: number;
  fecha_registro: string;
  edad?: number;
  genero?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Crear un nuevo paciente
  crearPaciente(paciente: Paciente, psicologoId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    // No enviar psicologo_id en el cuerpo, el backend lo obtiene del token JWT
    return this.http.post(`${this.apiUrl}/pacientes`, paciente, { headers });
  }

  // Obtener pacientes de un psicólogo
  obtenerPacientes(psicologoId: number): Observable<any> {
    console.log('Solicitando pacientes para psicólogo ID:', psicologoId);
    console.log('URL completa:', `${this.apiUrl}/pacientes/psicologo/${psicologoId}`);
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get(`${this.apiUrl}/pacientes/psicologo/${psicologoId}`, { headers });
  }

  // Obtener un paciente específico por ID
  obtenerPaciente(pacienteId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get(`${this.apiUrl}/pacientes/${pacienteId}`, { headers });
  }

  // Actualizar un paciente
  actualizarPaciente(pacienteId: number, paciente: Paciente): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.apiUrl}/pacientes/${pacienteId}`, paciente, { headers });
  }

  // Eliminar un paciente
  eliminarPaciente(pacienteId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.delete(`${this.apiUrl}/pacientes/${pacienteId}`, { headers });
  }

  // Método de utilidad para manejo de errores
  private handleError(error: any): string {
    if (error.error?.error) {
      return error.error.error;
    } else if (error.error?.message) {
      return error.error.message;
    } else if (error.message) {
      return error.message;
    } else if (error.status === 0) {
      return 'Error de conexión. Verifica que el servidor esté funcionando.';
    } else if (error.status === 500) {
      return 'Error interno del servidor. Intenta nuevamente.';
    } else {
      return 'Error desconocido. Intenta nuevamente.';
    }
  }
}
