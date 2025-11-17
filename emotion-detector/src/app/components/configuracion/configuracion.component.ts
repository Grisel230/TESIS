import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
}

interface SystemSettings {
  emailNotifications: boolean;
  darkMode: boolean;
  defaultSessionDuration: number;
  language: string;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  autoLogin: boolean;
  sessionTimeout: number;
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css', './force-styles.css'],
  encapsulation: ViewEncapsulation.None
})
export class ConfiguracionComponent implements OnInit {
  sidebarVisible = true;
  showModal = false;
  modalType: 'success' | 'error' | 'warning' = 'success';
  modalTitle = '';
  modalMessage = '';

  userProfile: UserProfile = {
    fullName: 'Grisel Laurean Valenzuela',
    email: 'grisel@gmail.com',
    phone: '6678765490',
    specialization: 'psicologia-clinica'
  };

  systemSettings: SystemSettings = {
    emailNotifications: true,
    darkMode: false,
    defaultSessionDuration: 60,
    language: 'es'
  };

  securitySettings: SecuritySettings = {
    twoFactorAuth: false,
    autoLogin: true,
    sessionTimeout: 30
  };

  passwordChange: PasswordChange = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    console.log('ConfiguracionComponent inicializado');
    this.cargarDatosUsuario();
    this.cargarPreferencias();
    
    // Suscribirse a los cambios del tema
    this.themeService.darkMode$.subscribe(isDark => {
      this.systemSettings.darkMode = isDark;
    });
  }

  cargarDatosUsuario(): void {
    const psicologo = this.authService.getPsicologo();
    if (psicologo) {
      this.userProfile.fullName = psicologo.nombre_completo;
      this.userProfile.email = psicologo.email;
      this.userProfile.phone = psicologo.telefono;
      this.userProfile.specialization = psicologo.especializacion;
    }
  }

  cargarPreferencias(): void {
    // Sincronizar con el servicio de tema global
    this.systemSettings.darkMode = this.themeService.isDarkMode();
  }

  toggleDarkMode(): void {
    // Actualizar el tema globalmente usando el servicio
    this.themeService.setDarkMode(this.systemSettings.darkMode);
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToNuevoPaciente(): void {
    this.router.navigate(['/nuevo-paciente']);
  }

  goToListaPacientes(): void {
    this.router.navigate(['/pacientes']);
  }

  goToSesiones(): void {
    this.router.navigate(['/historial-sesiones']);
  }

  goToReports(): void {
    this.router.navigate(['/informes-estadisticas']);
  }

  goToResources(): void {
    this.router.navigate(['/recursos']);
  }

  goToSettings(): void {
    this.router.navigate(['/configuracion']);
  }

  saveSettings(): void {
    console.log('Guardando configuración...');
    
    // Validaciones
    if (!this.userProfile.fullName || this.userProfile.fullName.trim() === '') {
      alert('❌ El nombre completo es requerido');
      return;
    }
    
    if (!this.userProfile.email || this.userProfile.email.trim() === '') {
      alert('❌ El correo electrónico es requerido');
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userProfile.email)) {
      alert('❌ El formato del correo electrónico no es válido');
      return;
    }
    
    if (!this.userProfile.phone || this.userProfile.phone.trim() === '') {
      alert('❌ El teléfono es requerido');
      return;
    }
    
    const psicologo = this.authService.getPsicologo();
    
    if (!psicologo) {
      alert('❌ Error: No se pudo identificar al usuario');
      return;
    }

    const datosActualizados = {
      nombre_completo: this.userProfile.fullName.trim(),
      email: this.userProfile.email.trim(),
      telefono: this.userProfile.phone.trim(),
      especializacion: this.userProfile.specialization
    };

    const apiUrl = `${environment.apiUrl}/psicologo/${psicologo.id}`;
    const token = localStorage.getItem('token');

    this.http.put(apiUrl, datosActualizados, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (response) => {
        console.log('Configuración guardada:', response);
        
        // Actualizar los datos del psicólogo en el AuthService y localStorage
        const psicologoActualizado = { ...psicologo, ...datosActualizados };
        this.authService.updatePsicologo(psicologoActualizado);
        
        // Recargar los datos del usuario para reflejar los cambios en el formulario
        this.cargarDatosUsuario();
        
        this.showModalMessage('success', 'Configuración Guardada', 'Los cambios se han guardado exitosamente y se han aplicado a tu perfil.');
      },
      error: (error) => {
        console.error('Error al guardar configuración:', error);
        const mensaje = error.error?.error || 'Error al guardar la configuración. Por favor, intenta de nuevo.';
        this.showModalMessage('error', 'Error al Guardar', mensaje);
      }
    });
  }

  changePassword(): void {
    // Validaciones
    if (!this.passwordChange.currentPassword || this.passwordChange.currentPassword.trim() === '') {
      alert('❌ La contraseña actual es requerida');
      return;
    }
    
    if (!this.passwordChange.newPassword || this.passwordChange.newPassword.trim() === '') {
      alert('❌ La nueva contraseña es requerida');
      return;
    }
    
    if (this.passwordChange.newPassword !== this.passwordChange.confirmPassword) {
      alert('❌ Las contraseñas no coinciden');
      return;
    }
    
    if (this.passwordChange.newPassword.length < 6) {
      alert('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const psicologo = this.authService.getPsicologo();
    if (!psicologo) {
      alert('❌ Error: No se pudo identificar al usuario');
      return;
    }
    
    const datosPassword = {
      current_password: this.passwordChange.currentPassword,
      new_password: this.passwordChange.newPassword
    };

    const apiUrl = `${environment.apiUrl}/psicologo/${psicologo.id}/change-password`;
    const token = localStorage.getItem('token');

    this.http.put(apiUrl, datosPassword, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (response) => {
        console.log('Contraseña cambiada:', response);
        this.showModalMessage('success', 'Contraseña Actualizada', 'Tu contraseña ha sido cambiada exitosamente.');
        
        // Limpiar el formulario
        this.passwordChange = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      },
      error: (error) => {
        console.error('Error al cambiar contraseña:', error);
        const mensaje = error.error?.error || 'Error al cambiar la contraseña';
        this.showModalMessage('error', 'Error al Cambiar Contraseña', mensaje);
      }
    });
  }

  exportData(): void {
    console.log('Exportando datos...');
    const psicologo = this.authService.getPsicologo();
    
    if (!psicologo) {
      alert('❌ Error: No se pudo identificar al usuario');
      return;
    }
    
    // Crear objeto con los datos del psicólogo
    const dataToExport = {
      psicologo: {
        nombre_completo: psicologo.nombre_completo,
        email: psicologo.email,
        telefono: psicologo.telefono,
        especializacion: psicologo.especializacion,
        cedula_profesional: psicologo.cedula_profesional
      },
      configuracion: {
        systemSettings: this.systemSettings,
        securitySettings: this.securitySettings
      },
      fecha_exportacion: new Date().toISOString(),
      version: '1.0'
    };
    
    // Convertir a JSON
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Crear enlace de descarga
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `datos_psicologo_${psicologo.id}_${new Date().getTime()}.json`;
    link.click();
    
    // Limpiar
    window.URL.revokeObjectURL(url);
    
    this.showModalMessage('success', 'Datos Exportados', 'Tus datos han sido exportados exitosamente. El archivo se ha descargado.');
  }

  importData(): void {
    console.log('Importando datos...');
    
    // Crear input file temporal
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = JSON.parse(e.target.result);
          console.log('Datos importados:', data);
          
          // Validar estructura
          if (!data.psicologo) {
            this.showModalMessage('error', 'Archivo Inválido', 'La estructura del archivo no es correcta. Asegúrate de importar un archivo exportado desde esta aplicación.');
            return;
          }
          
          // Actualizar configuraciones si existen
          if (data.configuracion) {
            if (data.configuracion.systemSettings) {
              this.systemSettings = { ...this.systemSettings, ...data.configuracion.systemSettings };
            }
            if (data.configuracion.securitySettings) {
              this.securitySettings = { ...this.securitySettings, ...data.configuracion.securitySettings };
            }
          }
          
          this.showModalMessage('success', 'Datos Importados', 'Los datos han sido importados exitosamente. Las configuraciones han sido actualizadas.');
        } catch (error) {
          console.error('Error al importar:', error);
          this.showModalMessage('error', 'Error al Importar', 'Error al leer el archivo. Asegúrate de que sea un archivo JSON válido.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }

  deleteAccount(): void {
    const confirmacion1 = confirm('⚠️ ¿Estás seguro de que quieres eliminar tu cuenta?\n\nEsta acción eliminará:\n- Tu perfil de psicólogo\n- Todos tus pacientes\n- Todas las sesiones registradas\n- Todos los datos asociados\n\nEsta acción NO se puede deshacer.');
    
    if (!confirmacion1) return;
    
    const confirmacion2 = prompt('Para confirmar, escribe "ELIMINAR" (en mayúsculas):');
    
    if (confirmacion2 !== 'ELIMINAR') {
      alert('❌ Eliminación cancelada');
      return;
    }
    
    const psicologo = this.authService.getPsicologo();
    if (!psicologo) {
      alert('❌ Error: No se pudo identificar al usuario');
      return;
    }
    
    console.log('Eliminando cuenta...');
    this.showModalMessage('warning', 'Funcionalidad Deshabilitada', 'La eliminación de cuenta está deshabilitada por seguridad. Para eliminar tu cuenta, contacta al administrador del sistema.');
  }

  showModalMessage(type: 'success' | 'error' | 'warning', title: string, message: string): void {
    this.modalType = type;
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }
}