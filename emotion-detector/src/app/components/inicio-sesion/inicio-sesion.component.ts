import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.css']
})
export class InicioSesionComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) { }

  onSubmit() {
    // Simulación de validación básica
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, complete todos los campos';
      return;
    }

    // Simulación de inicio de sesión exitoso
    if (this.email === 'test@test.com' && this.password === '123456') {
      console.log('Inicio de sesión exitoso');
      this.router.navigate(['/registro-pacientes']);
    } else {
      this.errorMessage = 'Credenciales inválidas';
    }
  }

  // Aquí puedes agregar propiedades y métodos para manejar el formulario
} 