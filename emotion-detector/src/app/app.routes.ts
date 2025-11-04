import { Routes } from '@angular/router';
import { InicioPageComponent } from './components/inicio-page/inicio-page.component';
import { PsicologoRegistroComponent } from './components/psicologo-registro/psicologo-registro.component';
import { InicioSesionComponent } from './components/inicio-sesion/inicio-sesion.component';
import { RegistroPacientesComponent } from './components/registro-pacientes/registro-pacientes.component';
import { DetalleSesionComponent } from './components/detalle-sesion/detalle-sesion.component';
import { HistorialSesionesComponent } from './components/historial-sesiones/historial-sesiones.component';
import { TestSimpleComponent } from './components/test-simple/test-simple.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ListaPacientesComponent } from './components/lista-pacientes/lista-pacientes.component';
import { NuevoPacienteComponent } from './components/nuevo-paciente/nuevo-paciente.component';
import { InformesEstadisticasComponent } from './components/informes-estadisticas/informes-estadisticas.component';
import { RecursosComponent } from './components/recursos/recursos.component';
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: InicioPageComponent }, // Página de inicio como ruta principal
  { path: 'inicio-sesion', component: InicioSesionComponent },
  { path: 'registro-psicologo', component: PsicologoRegistroComponent },
  
  // Rutas protegidas que requieren autenticación
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'test', component: TestSimpleComponent, canActivate: [AuthGuard] },
  { path: 'registro-pacientes', component: RegistroPacientesComponent, canActivate: [AuthGuard] },
  { path: 'nuevo-paciente', component: NuevoPacienteComponent, canActivate: [AuthGuard] },
  { path: 'editar-paciente/:id', component: NuevoPacienteComponent, canActivate: [AuthGuard] },
  { path: 'pacientes', component: ListaPacientesComponent, canActivate: [AuthGuard] },
  { path: 'historial-sesiones', component: HistorialSesionesComponent, canActivate: [AuthGuard] },
  { path: 'detalle-sesion/:id', component: DetalleSesionComponent, canActivate: [AuthGuard] },
  { path: 'informes-estadisticas', component: InformesEstadisticasComponent, canActivate: [AuthGuard] },
  { path: 'recursos', component: RecursosComponent, canActivate: [AuthGuard] },
  { path: 'configuracion', component: ConfiguracionComponent, canActivate: [AuthGuard] },
  
  // Redirigir rutas no encontradas al inicio
  { path: '**', redirectTo: '' }
];
