import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmotionService } from '../../services/emotion.service';

@Component({
  selector: 'app-psicologo-registro',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './psicologo-registro.component.html',
  styleUrls: ['./psicologo-registro.component.css']
})
export class PsicologoRegistroComponent {
  // Propiedades del formulario
  nombres: string = '';
  apellidoPaterno: string = '';
  apellidoMaterno: string = '';
  cedulaProfesional: string = '';
  especializacion: string = '';
  correoElectronico: string = '';
  telefono: string = '';
  nombreUsuario: string = '';
  contrasena: string = '';
  confirmarContrasena: string = '';
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Lista de especializaciones
  especializaciones = [
    'Psicología Clínica',
    'Psicología Educativa',
    'Psicología Social',
    'Neuropsicología',
    'Psicología Organizacional',
    'Psicología Infantil',
    'Psicología Forense',
    'Terapia Familiar',
    'Otra'
  ];

  constructor(
    private emotionService: EmotionService,
    private router: Router
  ) {}

  onSubmit() {
    // Validaciones básicas
    if (!this.nombres || !this.apellidoPaterno || !this.apellidoMaterno || 
        !this.cedulaProfesional || !this.especializacion || 
        !this.correoElectronico || !this.telefono || !this.nombreUsuario || 
        !this.contrasena || !this.confirmarContrasena) {
      this.errorMessage = 'Por favor, complete todos los campos';
      return;
    }

    if (this.contrasena !== this.confirmarContrasena) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (this.contrasena.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Combinar nombres para enviar al backend
    const nombreCompleto = `${this.nombres} ${this.apellidoPaterno} ${this.apellidoMaterno}`.trim();

    // Preparar datos para el registro
    const psicologoData = {
      nombreCompleto: nombreCompleto,
      cedulaProfesional: this.cedulaProfesional,
      especializacion: this.especializacion,
      email: this.correoElectronico,
      telefono: this.telefono,
      nombreUsuario: this.nombreUsuario,
      password: this.contrasena
    };

    // Llamar al servicio de registro
    this.emotionService.registerPsicologo(psicologoData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.isLoading = false;
        this.successMessage = '¡Registro exitoso! Redirigiendo al inicio de sesión...';
        
        // Redirigir al login después de 2 segundos para que el usuario vea el mensaje
        setTimeout(() => {
          this.router.navigate(['/inicio-sesion']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error en el registro:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Error al registrar el psicólogo';
      }
    });
  }
}