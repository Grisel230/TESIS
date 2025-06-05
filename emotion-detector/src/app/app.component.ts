import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
// import { EmotionDetectorComponent } from './components/emotion-detector/emotion-detector.component';
// import { PsicologoRegistroComponent } from './components/psicologo-registro/psicologo-registro.component';
// import { InicioSesionComponent } from './components/inicio-sesion/inicio-sesion.component';
// import { RegistroPacientesComponent } from './components/registro-pacientes/registro-pacientes.component';
// import { DetalleSesionComponent } from './components/detalle-sesion/detalle-sesion.component';

// Definir las rutas
// const routes: Routes = [
//   { path: 'registro-psicologo', component: PsicologoRegistroComponent },
//   { path: 'inicio-sesion', component: InicioSesionComponent },
//   { path: 'registro-pacientes', component: RegistroPacientesComponent },
//   { path: 'detalle-sesion', component: DetalleSesionComponent }, // Considerar usar un parámetro para el ID de la sesión
//   { path: '', redirectTo: '/inicio-sesion', pathMatch: 'full' }, // Ruta por defecto
//   // { path: '**', component: PageNotFoundComponent },  // Opcional: componente para rutas no encontradas
// ];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `
    <main>
      <!-- <app-psicologo-registro></app-psicologo-registro> -->
      <!-- <app-inicio-sesion></app-inicio-sesion> -->
      <!-- <app-registro-pacientes></app-registro-pacientes> -->
      <!-- <app-detalle-sesion></app-detalle-sesion> -->
      <!-- <app-emotion-detector></app-emotion-detector> -->
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      padding: 20px;
    }
  `]
})
export class AppComponent {
  title = 'Detector de Emociones';
}
