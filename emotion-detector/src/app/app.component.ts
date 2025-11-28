import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      padding: 0;
      margin: 0;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Detector de Emociones';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // El servicio ThemeService ya se encarga de aplicar el tema
    // al inicializarse, pero lo inyectamos aquí para asegurar
    // que se cargue al inicio de la aplicación
  }
}
