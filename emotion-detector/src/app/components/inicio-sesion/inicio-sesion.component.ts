import { Component, OnInit } from '@angular/core';
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

  constructor(
    private router: Router,
    private emotionService: EmotionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('InicioSesionComponent inicializado');
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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}