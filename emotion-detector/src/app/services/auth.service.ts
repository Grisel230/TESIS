import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface Psicologo {
  id: number;
  nombre_completo: string;
  cedula_profesional: string;
  especializacion: string;
  telefono: string;
  email: string;
  nombre_usuario: string;
  fecha_registro: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  psicologo: Psicologo;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private psicologoSubject = new BehaviorSubject<Psicologo | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public psicologo$ = this.psicologoSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Cargar datos del psicólogo y token desde localStorage al inicializar
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    // Verificar si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const psicologoData = localStorage.getItem('psicologo');
      const tokenData = localStorage.getItem('token');
      
      if (psicologoData && tokenData) {
        try {
          const psicologo = JSON.parse(psicologoData);
          // Validar que el psicólogo tenga los campos requeridos
          if (this.isValidPsicologo(psicologo)) {
            this.psicologoSubject.next(psicologo);
            this.tokenSubject.next(tokenData);
          } else {
            console.warn('Datos del psicólogo inválidos, limpiando...');
            this.clearAll();
          }
        } catch (error) {
          console.error('Error loading data from storage:', error);
          this.clearAll();
        }
      }
    }
  }

  private isValidPsicologo(psicologo: any): boolean {
    return psicologo && 
           typeof psicologo.id === 'number' && 
           typeof psicologo.nombre_completo === 'string' &&
           typeof psicologo.email === 'string';
  }

  login(loginResponse: LoginResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('psicologo', JSON.stringify(loginResponse.psicologo));
      localStorage.setItem('token', loginResponse.token);
    }
    this.psicologoSubject.next(loginResponse.psicologo);
    this.tokenSubject.next(loginResponse.token);
  }

  logout(): void {
    this.clearAll();
    this.router.navigate(['/inicio-sesion']);
  }

  private clearAll(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('psicologo');
      localStorage.removeItem('token');
    }
    this.psicologoSubject.next(null);
    this.tokenSubject.next(null);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getPsicologo(): Psicologo | null {
    return this.psicologoSubject.value;
  }

  isAuthenticated(): boolean {
    return this.psicologoSubject.value !== null;
  }

  getPsicologoId(): number | null {
    const psicologo = this.getPsicologo();
    return psicologo ? psicologo.id : null;
  }
}
