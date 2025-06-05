import { Routes } from '@angular/router';
import { PsicologoRegistroComponent } from './components/psicologo-registro/psicologo-registro.component';
import { InicioSesionComponent } from './components/inicio-sesion/inicio-sesion.component';
import { RegistroPacientesComponent } from './components/registro-pacientes/registro-pacientes.component';
import { DetalleSesionComponent } from './components/detalle-sesion/detalle-sesion.component';
// Importar otros componentes de vista aquí (Historial, etc.)

export const routes: Routes = [
  { path: 'registro-psicologo', component: PsicologoRegistroComponent },
  { path: 'inicio-sesion', component: InicioSesionComponent },
  { path: 'registro-pacientes', component: RegistroPacientesComponent },
  { path: 'detalle-sesion/:id', component: DetalleSesionComponent }, // Usar un parámetro para el ID de la sesión
  // { path: 'historial-sesiones', component: HistorialSesionesComponent }, // Añadir cuando se cree el componente
  { path: '', redirectTo: '/inicio-sesion', pathMatch: 'full' }, // Ruta por defecto
  // { path: '**', component: PageNotFoundComponent }, // Opcional: componente para rutas no encontradas
];
