import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmotionService } from '../../services/emotion.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.css']
})
export class InicioSesionComponent implements OnInit {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = false;
  showForgotPasswordModal: boolean = false;
  resetEmail: string = '';
  resetMessage: string = '';
  resetError: string = '';
  isResetting: boolean = false;

  constructor(
    private router: Router,
    private emotionService: EmotionService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    console.log('InicioSesionComponent inicializado');
    
    // Solo acceder a localStorage en el navegador (no en SSR)
    if (isPlatformBrowser(this.platformId)) {
      const savedEmail = localStorage.getItem('rememberedEmail');
      const savedPassword = localStorage.getItem('rememberedPassword');
      
      if (savedEmail) {
        this.email = savedEmail;
        this.rememberMe = true;
        console.log('Email recuperado de localStorage:', savedEmail);
      }
      
      if (savedPassword) {
        // Decodificar la contraseña guardada
        this.password = atob(savedPassword);
        console.log('Contraseña recuperada de localStorage');
      }
    }
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Por favor, ingresa un correo electrónico válido';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('Intentando login con:', { email: this.email, password: '***' });

    this.emotionService.loginPsicologo(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.isLoading = false;
        
        // Guardar o eliminar credenciales según el checkbox "Recuérdame" (solo en navegador)
        if (isPlatformBrowser(this.platformId)) {
          if (this.rememberMe) {
            localStorage.setItem('rememberedEmail', this.email);
            // Codificar contraseña en base64 para ofuscación básica
            localStorage.setItem('rememberedPassword', btoa(this.password));
            console.log('Credenciales guardadas en localStorage');
          } else {
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('rememberedPassword');
            console.log('Credenciales eliminadas de localStorage');
          }
        }
        
        // Usar el servicio de autenticación para guardar y manejar el login
        this.authService.login(response);
        
        // Redirigir al dashboard de bienvenida
        console.log('Redirigiendo al dashboard...');
        this.router.navigate(['/dashboard']).then(success => {
          console.log('Navegación exitosa:', success);
        }).catch(error => {
          console.error('Error en navegación:', error);
        });
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.isLoading = false;
        
        // Manejo más detallado de errores
        if (error.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.';
        } else if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        } else if (error.status === 500) {
          this.errorMessage = 'Error interno del servidor. Intenta nuevamente.';
        } else {
          this.errorMessage = error.error?.message || error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  openForgotPasswordModal(): void {
    this.showForgotPasswordModal = true;
    this.resetEmail = this.email; // Pre-llenar con el email actual si existe
    this.resetMessage = '';
    this.resetError = '';
  }

  closeForgotPasswordModal(): void {
    this.showForgotPasswordModal = false;
    this.resetEmail = '';
    this.resetMessage = '';
    this.resetError = '';
  }

  sendPasswordReset(): void {
    if (!this.resetEmail) {
      this.resetError = 'Por favor, ingresa tu correo electrónico';
      return;
    }

    if (!this.isValidEmail(this.resetEmail)) {
      this.resetError = 'Por favor, ingresa un correo electrónico válido';
      return;
    }

    this.isResetting = true;
    this.resetError = '';
    this.resetMessage = '';

    console.log('Enviando solicitud de recuperación para:', this.resetEmail);

    // Llamar al servicio real
    this.emotionService.forgotPassword(this.resetEmail).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.isResetting = false;
        this.resetMessage = response.message || `Se ha enviado un enlace de recuperación a ${this.resetEmail}. Por favor, revisa tu bandeja de entrada y tu carpeta de spam.`;
        
        // Cerrar modal automáticamente después de 4 segundos
        setTimeout(() => {
          this.closeForgotPasswordModal();
        }, 4000);
      },
      error: (error) => {
        console.error('Error al solicitar recuperación:', error);
        this.isResetting = false;
        
        if (error.status === 0) {
          this.resetError = 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.';
        } else if (error.status === 429) {
          this.resetError = 'Demasiadas solicitudes. Por favor, intenta nuevamente más tarde.';
        } else {
          this.resetError = error.error?.error || 'Error al enviar el correo. Intenta nuevamente.';
        }
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}