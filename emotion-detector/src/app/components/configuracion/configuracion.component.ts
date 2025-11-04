import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
}

interface SystemSettings {
  emailNotifications: boolean;
  autoBackup: boolean;
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
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {
  sidebarVisible = true;

  userProfile: UserProfile = {
    fullName: 'Grisel Laurean Valenzuela',
    email: 'grisel@gmail.com',
    phone: '6678765490',
    specialization: 'psicologia-clinica'
  };

  systemSettings: SystemSettings = {
    emailNotifications: true,
    autoBackup: true,
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('ConfiguracionComponent inicializado');
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
    console.log('Perfil:', this.userProfile);
    console.log('Sistema:', this.systemSettings);
    console.log('Seguridad:', this.securitySettings);
    
    // Aquí implementarías la lógica para guardar la configuración
    alert('Configuración guardada exitosamente');
  }

  changePassword(): void {
    if (this.passwordChange.newPassword !== this.passwordChange.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (this.passwordChange.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    console.log('Cambiando contraseña...');
    // Aquí implementarías la lógica para cambiar la contraseña
    alert('Contraseña cambiada exitosamente');
    
    // Limpiar formulario
    this.passwordChange = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  exportData(): void {
    console.log('Exportando datos...');
    // Aquí implementarías la lógica para exportar datos
    alert('Funcionalidad de exportación en desarrollo');
  }

  importData(): void {
    console.log('Importando datos...');
    // Aquí implementarías la lógica para importar datos
    alert('Funcionalidad de importación en desarrollo');
  }

  deleteAccount(): void {
    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      console.log('Eliminando cuenta...');
      // Aquí implementarías la lógica para eliminar la cuenta
      alert('Funcionalidad de eliminación en desarrollo');
    }
  }
}