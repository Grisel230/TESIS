import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSubject: BehaviorSubject<boolean>;
  public darkMode$: Observable<boolean>;
  private isBrowser: boolean;
  
  // Rutas donde NO se debe aplicar el modo oscuro
  private excludedRoutes: string[] = [
    '/',
    '/inicio-sesion',
    '/registro-psicologo'
  ];

  constructor(@Inject(PLATFORM_ID) platformId: Object, private router: Router) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Cargar la preferencia del modo oscuro desde localStorage solo en el navegador
    const savedDarkMode = this.isBrowser && localStorage.getItem('darkMode') === 'true';
    this.darkModeSubject = new BehaviorSubject<boolean>(savedDarkMode || false);
    this.darkMode$ = this.darkModeSubject.asObservable();

    // Aplicar el modo oscuro al inicializar solo en el navegador
    if (this.isBrowser) {
      this.applyTheme(savedDarkMode || false);
      
      // Suscribirse a los cambios de ruta para aplicar/remover el tema según la ruta
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.applyTheme(this.darkModeSubject.value);
      });
    }
  }

  /**
   * Activa o desactiva el modo oscuro
   */
  toggleDarkMode(): void {
    const newValue = !this.darkModeSubject.value;
    this.setDarkMode(newValue);
  }

  /**
   * Establece el modo oscuro
   */
  setDarkMode(isDark: boolean): void {
    this.darkModeSubject.next(isDark);
    if (this.isBrowser) {
      localStorage.setItem('darkMode', isDark.toString());
      this.applyTheme(isDark);
    }
  }

  /**
   * Obtiene el estado actual del modo oscuro
   */
  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }

  /**
   * Aplica el tema al documento
   */
  private applyTheme(isDark: boolean): void {
    if (!this.isBrowser) {
      return;
    }

    const currentUrl = this.router.url;
    const isExcludedRoute = this.excludedRoutes.includes(currentUrl);
    const shouldApplyDarkMode = isDark && !isExcludedRoute;

    if (shouldApplyDarkMode) {
      document.body.classList.add('dark-mode');
      this.applyButtonOverrides(true);
    } else {
      document.body.classList.remove('dark-mode');
      this.applyButtonOverrides(false);
    }
  }

  private applyButtonOverrides(enable: boolean): void {
    const styleId = 'dark-mode-button-overrides';
    const existingStyle = document.head.querySelector<HTMLStyleElement>(`#${styleId}`);

    if (!enable) {
      existingStyle?.remove();
      return;
    }

    if (existingStyle) {
      existingStyle.textContent = this.getButtonOverrideCss();
      existingStyle.remove();
      document.head.appendChild(existingStyle);
      return;
    }

    const styleTag = document.createElement('style');
    styleTag.setAttribute('id', styleId);
    styleTag.textContent = this.getButtonOverrideCss();
    document.head.appendChild(styleTag);
  }

  private getButtonOverrideCss(): string {
    return `
      /* Eliminar gradientes de TODOS los botones */
      body.dark-mode button,
      body.dark-mode [class*="btn"],
      body.dark-mode .btn,
      body.dark-mode button[class*="btn"] {
        background-image: none !important;
        filter: none !important;
      }

      /* BOTONES SUCCESS - VERDE - MÁXIMA PRIORIDAD */
      body.dark-mode button.btn-success,
      body.dark-mode button.btn.btn-success,
      body.dark-mode .btn-success,
      body.dark-mode .btn.btn-success,
      body.dark-mode [class~="btn-success"],
      body.dark-mode button[class~="btn-success"],
      body.dark-mode *[class*="btn-success"],
      body.dark-mode * button[class*="btn-success"] {
        background: #10b981 !important;
        background-color: #10b981 !important;
        background-image: none !important;
        border-color: #10b981 !important;
        color: #ffffff !important;
      }

      body.dark-mode button.btn-success:hover,
      body.dark-mode .btn-success:hover,
      body.dark-mode .btn.btn-success:hover,
      body.dark-mode [class~="btn-success"]:hover {
        background: #059669 !important;
        background-color: #059669 !important;
        border-color: #059669 !important;
      }

      /* BOTONES DANGER - ROJO - MÁXIMA PRIORIDAD */
      body.dark-mode button.btn-danger,
      body.dark-mode button.btn.btn-danger,
      body.dark-mode .btn-danger,
      body.dark-mode .btn.btn-danger,
      body.dark-mode [class~="btn-danger"],
      body.dark-mode button[class~="btn-danger"],
      body.dark-mode *[class*="btn-danger"],
      body.dark-mode * button[class*="btn-danger"],
      body.dark-mode .btn-delete,
      body.dark-mode button.btn-delete {
        background: #ef4444 !important;
        background-color: #ef4444 !important;
        background-image: none !important;
        border-color: #ef4444 !important;
        color: #ffffff !important;
      }

      body.dark-mode button.btn-danger:hover,
      body.dark-mode .btn-danger:hover,
      body.dark-mode .btn.btn-danger:hover,
      body.dark-mode [class~="btn-danger"]:hover,
      body.dark-mode .btn-delete:hover {
        background: #dc2626 !important;
        background-color: #dc2626 !important;
        border-color: #dc2626 !important;
      }

      /* BOTONES WARNING - NARANJA - MÁXIMA PRIORIDAD */
      body.dark-mode button.btn-warning,
      body.dark-mode button.btn.btn-warning,
      body.dark-mode .btn-warning,
      body.dark-mode .btn.btn-warning,
      body.dark-mode [class~="btn-warning"],
      body.dark-mode button[class~="btn-warning"],
      body.dark-mode *[class*="btn-warning"],
      body.dark-mode * button[class*="btn-warning"],
      body.dark-mode .btn-edit,
      body.dark-mode button.btn-edit {
        background: #f59e0b !important;
        background-color: #f59e0b !important;
        background-image: none !important;
        border-color: #f59e0b !important;
        color: #ffffff !important;
      }

      body.dark-mode button.btn-warning:hover,
      body.dark-mode .btn-warning:hover,
      body.dark-mode .btn.btn-warning:hover,
      body.dark-mode [class~="btn-warning"]:hover,
      body.dark-mode .btn-edit:hover {
        background: #d97706 !important;
        background-color: #d97706 !important;
        border-color: #d97706 !important;
      }

      /* BOTONES PRIMARY - AZUL */
      body.dark-mode button.btn-primary,
      body.dark-mode button.btn.btn-primary,
      body.dark-mode .btn-primary,
      body.dark-mode .btn.btn-primary,
      body.dark-mode [class~="btn-primary"],
      body.dark-mode button[class~="btn-primary"],
      body.dark-mode *[class*="btn-primary"],
      body.dark-mode * button[class*="btn-primary"] {
        background: #3b82f6 !important;
        background-color: #3b82f6 !important;
        background-image: none !important;
        border-color: #3b82f6 !important;
        color: #ffffff !important;
      }

      body.dark-mode button.btn-primary:hover,
      body.dark-mode .btn-primary:hover,
      body.dark-mode .btn.btn-primary:hover,
      body.dark-mode [class~="btn-primary"]:hover {
        background: #2563eb !important;
        background-color: #2563eb !important;
        border-color: #2563eb !important;
      }

      /* BOTONES SECONDARY - GRIS */
      body.dark-mode button.btn-secondary,
      body.dark-mode button.btn.btn-secondary,
      body.dark-mode .btn-secondary,
      body.dark-mode .btn.btn-secondary,
      body.dark-mode [class~="btn-secondary"],
      body.dark-mode button[class~="btn-secondary"],
      body.dark-mode *[class*="btn-secondary"],
      body.dark-mode * button[class*="btn-secondary"] {
        background: #374151 !important;
        background-color: #374151 !important;
        background-image: none !important;
        border-color: #4b5563 !important;
        color: #f0f6fc !important;
      }

      body.dark-mode button.btn-secondary:hover,
      body.dark-mode .btn-secondary:hover,
      body.dark-mode .btn.btn-secondary:hover,
      body.dark-mode [class~="btn-secondary"]:hover {
        background: #1f2937 !important;
        background-color: #1f2937 !important;
        border-color: #374151 !important;
      }

      /* BOTONES ESPECIALES */
      body.dark-mode .btn-view,
      body.dark-mode button.btn-view {
        background: #3b82f6 !important;
        background-color: #3b82f6 !important;
        background-image: none !important;
        border-color: #3b82f6 !important;
        color: #ffffff !important;
      }

      body.dark-mode .btn-save-session,
      body.dark-mode button.btn-save-session {
        background: #10b981 !important;
        background-color: #10b981 !important;
        background-image: none !important;
        border-color: #10b981 !important;
        color: #ffffff !important;
      }
    `;
  }

  /**
   * Verifica si la ruta actual está excluida del modo oscuro
   */
  isRouteExcluded(): boolean {
    if (!this.isBrowser) return false;
    const currentUrl = this.router.url;
    return this.excludedRoutes.includes(currentUrl);
  }
}
