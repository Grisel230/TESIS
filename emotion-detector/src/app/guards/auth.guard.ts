import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean {
    // Verificar si estamos en el navegador antes de acceder a localStorage
    if (isPlatformBrowser(this.platformId)) {
      const psicologo = localStorage.getItem('psicologo');
      
      if (psicologo) {
        try {
          const psicologoData = JSON.parse(psicologo);
          if (psicologoData && psicologoData.id) {
            return true;
          }
        } catch (error) {
          console.error('Error parsing psicologo data:', error);
        }
      }
    }
    
    // Si no hay psicólogo logueado, redirigir al login
    this.router.navigate(['/inicio-sesion']);
    return false;
  }
}
