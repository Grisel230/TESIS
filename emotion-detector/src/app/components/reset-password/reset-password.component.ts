import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmotionService } from '../../services/emotion.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  token: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isValidatingToken: boolean = true;
  tokenValid: boolean = false;
  private previousDarkMode: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private emotionService: EmotionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // FORZAR MODO CLARO - Eliminar clase dark-mode del body
    if (isPlatformBrowser(this.platformId)) {
      // Guardar el estado actual del modo oscuro
      this.previousDarkMode = document.body.classList.contains('dark-mode');
      // Forzar modo claro
      document.body.classList.remove('dark-mode');
    }

    // Obtener token de la URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      
      if (!this.token) {
        this.errorMessage = 'Token de recuperación no válido';
        this.isValidatingToken = false;
        return;
      }

      // Verificar si el token es válido
      this.verifyToken();
    });
  }

  ngOnDestroy(): void {
    // Restaurar el modo oscuro si estaba activado antes
    if (isPlatformBrowser(this.platformId) && this.previousDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }

  verifyToken(): void {
    this.emotionService.verifyResetToken(this.token).subscribe({
      next: (response) => {
        this.tokenValid = response.valid;
        this.isValidatingToken = false;
        
        if (!this.tokenValid) {
          this.errorMessage = response.error || 'Token inválido o expirado';
        }
      },
      error: (error) => {
        console.error('Error verificando token:', error);
        this.isValidatingToken = false;
        this.tokenValid = false;
        this.errorMessage = error.error?.error || 'Token inválido o expirado';
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validaciones
    if (!this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;

    this.emotionService.resetPassword(this.token, this.password).subscribe({
      next: (response) => {
        console.log('Contraseña restablecida:', response);
        this.isLoading = false;
        this.successMessage = response.message || 'Contraseña restablecida exitosamente';
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/inicio-sesion']);
        }, 3000);
      },
      error: (error) => {
        console.error('Error al restablecer contraseña:', error);
        this.isLoading = false;
        
        if (error.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor';
        } else if (error.status === 404) {
          this.errorMessage = 'Token inválido';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.error || 'Token expirado o ya utilizado';
        } else {
          this.errorMessage = error.error?.error || 'Error al restablecer la contraseña';
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
