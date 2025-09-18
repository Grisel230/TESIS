import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PatientService, Paciente } from '../../services/patient.service';
import { Psicologo } from '../../services/auth.service';

// Usar la interfaz del servicio

@Component({
  selector: 'app-nuevo-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-paciente.component.html',
  styleUrls: ['./nuevo-paciente.component.css']
})
export class NuevoPacienteComponent implements OnInit {
  // Datos del psicólogo logueado
  psicologo: Psicologo | null = null;
  sidebarVisible: boolean = true;

  // Datos del formulario
  paciente: Paciente = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    edad: 0,
    genero: '',
    email: '',
    telefono: '',
    direccion: '',
    diagnostico_preliminar: '',
    notas_generales: ''
  };

  // Opciones para el género
  generos: string[] = ['Masculino', 'Femenino', 'Otro'];

  // Estados del formulario
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Modo de edición
  isEditMode: boolean = false;
  pacienteId: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private patientService: PatientService
  ) { }

  ngOnInit(): void {
    // Cargar datos del psicólogo desde localStorage
    this.loadPsicologo();
    
    // Verificar si estamos en modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.pacienteId = +params['id'];
        this.loadPacienteForEdit();
      }
    });
  }

  private loadPsicologo(): void {
    try {
      const psicologoData = localStorage.getItem('psicologo');
      console.log('Datos del psicólogo desde localStorage:', psicologoData);
      
      if (psicologoData) {
        this.psicologo = JSON.parse(psicologoData);
        console.log('Psicólogo cargado:', this.psicologo);
        console.log('ID del psicólogo:', this.psicologo?.id);
        
        if (!this.psicologo?.id) {
          console.error('El psicólogo no tiene ID válido');
          this.errorMessage = 'Error: Datos del psicólogo incompletos. Por favor, inicia sesión nuevamente.';
        }
      } else {
        console.error('No hay datos del psicólogo en localStorage');
        this.errorMessage = 'Error: No se encontró información del psicólogo. Por favor, inicia sesión.';
      }
    } catch (error) {
      console.error('Error al cargar psicólogo:', error);
      this.errorMessage = 'Error al cargar datos del psicólogo. Por favor, inicia sesión nuevamente.';
    }
  }

  private loadPacienteForEdit(): void {
    const pacienteData = localStorage.getItem('paciente_editando');
    if (pacienteData) {
      try {
        const paciente = JSON.parse(pacienteData);
        console.log('Datos del paciente desde localStorage:', paciente);
        
        // Mejorar la división del nombre completo
        const nombreCompleto = paciente.nombre_completo || '';
        const nombreParts = nombreCompleto.split(' ');
        
        // Asignar los nombres de manera más inteligente
        let nombre = '';
        let apellidoPaterno = '';
        let apellidoMaterno = '';
        
        if (nombreParts.length >= 1) {
          nombre = nombreParts[0];
        }
        if (nombreParts.length >= 2) {
          apellidoPaterno = nombreParts[1];
        }
        if (nombreParts.length >= 3) {
          // Unir todos los nombres restantes como apellido materno
          apellidoMaterno = nombreParts.slice(2).join(' ');
        }
        
        this.paciente = {
          nombre: nombre,
          apellido_paterno: apellidoPaterno,
          apellido_materno: apellidoMaterno,
          edad: paciente.edad || 0,
          genero: paciente.genero || '',
          email: paciente.email || '',
          telefono: paciente.telefono || '',
          direccion: '', // No disponible en el backend actual
          diagnostico_preliminar: '', // No disponible en el backend actual
          notas_generales: '' // No disponible en el backend actual
        };
        
        console.log('Paciente cargado para edición:');
        console.log('- Nombre completo original:', nombreCompleto);
        console.log('- Nombre:', nombre);
        console.log('- Apellido paterno:', apellidoPaterno);
        console.log('- Apellido materno:', apellidoMaterno);
        console.log('- Edad:', paciente.edad);
        console.log('- Género:', paciente.genero);
        console.log('- Email:', paciente.email);
        console.log('- Teléfono:', paciente.telefono);
        
      } catch (error) {
        console.error('Error al cargar paciente para edición:', error);
        this.errorMessage = 'Error al cargar datos del paciente para edición.';
      }
    } else {
      this.errorMessage = 'No se encontraron datos del paciente para editar.';
    }
  }

  // Método para obtener el primer nombre del psicólogo
  getFirstName(): string {
    if (this.psicologo?.nombre_completo) {
      return this.psicologo.nombre_completo.split(' ')[0];
    }
    return 'Doctor';
  }

  // Método para toggle del sidebar
  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  // Navegación
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToPacientes(): void {
    this.router.navigate(['/pacientes']);
  }

  goToSesiones(): void {
    this.router.navigate(['/historial-sesiones']);
  }

  goToSettings(): void {
    alert('Vista de configuración en desarrollo');
  }

  goToReports(): void {
    alert('Vista de reportes en desarrollo');
  }

  goToResources(): void {
    alert('Vista de recursos en desarrollo');
  }

  // Método para validar el formulario
  validateForm(): boolean {
    if (!this.paciente.nombre.trim()) {
      this.errorMessage = 'El nombre es requerido';
      return false;
    }
    if (!this.paciente.apellido_paterno.trim()) {
      this.errorMessage = 'El apellido paterno es requerido';
      return false;
    }
    if (!this.paciente.edad || this.paciente.edad <= 0) {
      this.errorMessage = 'La edad es requerida y debe ser mayor a 0';
      return false;
    }
    if (!this.paciente.genero) {
      this.errorMessage = 'El género es requerido';
      return false;
    }
    if (this.paciente.email && !this.isValidEmail(this.paciente.email)) {
      this.errorMessage = 'El formato del email no es válido';
      return false;
    }
    return true;
  }

  // Método para validar email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Método para limpiar mensajes
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Método para enviar el formulario
  onSubmit(): void {
    this.clearMessages();
    
    console.log('=== INICIANDO ENVÍO DEL FORMULARIO ===');
    console.log('Modo edición:', this.isEditMode);
    console.log('Datos del paciente:', this.paciente);
    console.log('Psicólogo actual:', this.psicologo);
    
    // Validar formulario
    if (!this.validateForm()) {
      console.log('❌ Validación del formulario falló');
      return;
    }

    // Verificar psicólogo
    if (!this.psicologo?.id) {
      console.error('❌ No hay ID del psicólogo disponible');
      this.errorMessage = 'Error: No se encontró información del psicólogo. Por favor, inicia sesión nuevamente.';
      return;
    }

    this.isLoading = true;

    if (this.isEditMode && this.pacienteId) {
      // Modo edición
      this.updatePaciente();
    } else {
      // Modo creación
      this.createPaciente();
    }
  }

  private createPaciente(): void {
    console.log('✅ Creando nuevo paciente con ID de psicólogo:', this.psicologo!.id);
    console.log('✅ Datos del paciente a enviar:', this.paciente);
    
    this.patientService.crearPaciente(this.paciente, this.psicologo!.id).subscribe({
      next: (response) => {
        console.log('✅ Paciente creado exitosamente:', response);
        this.successMessage = `¡Paciente "${this.paciente.nombre} ${this.paciente.apellido_paterno}" registrado exitosamente!`;
        this.resetForm();
        this.isLoading = false;
        
        // Redirigir a la lista de pacientes después de 3 segundos para que el usuario vea el mensaje
        setTimeout(() => {
          this.router.navigate(['/pacientes']);
        }, 3000);
      },
      error: (error) => {
        console.error('❌ Error al crear paciente:', error);
        console.error('❌ Error completo:', JSON.stringify(error, null, 2));
        this.handleError(error, 'crear');
      }
    });
  }

  private updatePaciente(): void {
    console.log('✅ Actualizando paciente ID:', this.pacienteId);
    console.log('Datos a actualizar:', this.paciente);
    
    // Crear el objeto de actualización con todas las propiedades requeridas por la interfaz Paciente
    const updateData: Paciente = {
      nombre: this.paciente.nombre,
      apellido_paterno: this.paciente.apellido_paterno,
      apellido_materno: this.paciente.apellido_materno,
      edad: this.paciente.edad,
      genero: this.paciente.genero,
      email: this.paciente.email,
      telefono: this.paciente.telefono,
      direccion: this.paciente.direccion,
      diagnostico_preliminar: this.paciente.diagnostico_preliminar,
      notas_generales: this.paciente.notas_generales
    };
    
    console.log('Datos formateados para actualización:', updateData);
    
    this.patientService.actualizarPaciente(this.pacienteId!, updateData).subscribe({
      next: (response) => {
        console.log('✅ Paciente actualizado exitosamente:', response);
        this.successMessage = `¡Paciente "${this.paciente.nombre} ${this.paciente.apellido_paterno}" editado exitosamente!`;
        this.isLoading = false;
        
        // Limpiar datos de edición
        localStorage.removeItem('paciente_editando');
        
        // Redirigir a la lista de pacientes después de 3 segundos para que el usuario vea el mensaje
        setTimeout(() => {
          this.router.navigate(['/pacientes']);
        }, 3000);
      },
      error: (error) => {
        console.error('❌ Error al actualizar paciente:', error);
        this.handleError(error, 'actualizar');
      }
    });
  }

  private handleError(error: any, action: string): void {
    let errorMsg = `Error al ${action} el paciente`;
    
    if (error.error?.error) {
      errorMsg = error.error.error;
    } else if (error.message) {
      errorMsg = error.message;
    } else if (error.status === 0) {
      errorMsg = 'Error de conexión. Verifica que el servidor esté funcionando.';
    } else if (error.status === 500) {
      errorMsg = 'Error interno del servidor. Intenta nuevamente.';
    }
    
    this.errorMessage = errorMsg;
    this.isLoading = false;
  }

  // Método para resetear el formulario
  resetForm(): void {
    this.paciente = {
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      edad: 0,
      genero: '',
      email: '',
      telefono: '',
      direccion: '',
      diagnostico_preliminar: '',
      notas_generales: ''
    };
  }

  // Método para cancelar
  onCancel(): void {
    // Limpiar datos de edición si estamos en modo edición
    if (this.isEditMode) {
      localStorage.removeItem('paciente_editando');
    }
    this.router.navigate(['/pacientes']);
  }

  // Método para volver a la lista de pacientes
  goBackToPacientes(): void {
    this.router.navigate(['/pacientes']);
  }

  // Método para configurar psicólogo manualmente (para debugging)
  setupPsicologoManually(): void {
    const psicologo: Psicologo = {
      id: 1,
      nombre_completo: "Dr. Juan Pérez",
      cedula_profesional: "12345678",
      especializacion: "Psicología Clínica",
      telefono: "5551234567",
      email: "juan.perez@test.com",
      nombre_usuario: "juanperez",
      fecha_registro: new Date().toISOString()
    };
    
    localStorage.setItem('psicologo', JSON.stringify(psicologo));
    this.psicologo = psicologo;
    this.errorMessage = '';
    this.successMessage = 'Psicólogo configurado manualmente. Ahora puedes registrar pacientes.';
    
    console.log('Psicólogo configurado manualmente:', psicologo);
  }
}
