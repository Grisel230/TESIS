import { Component } from '@angular/core';

@Component({
  selector: 'app-test-simple',
  standalone: true,
  template: `
    <div style="background: red; color: white; padding: 50px; text-align: center; font-size: 24px;">
      <h1>¡COMPONENTE DE PRUEBA FUNCIONANDO!</h1>
      <p>Si ves esto, el routing funciona correctamente</p>
    </div>
  `
})
export class TestSimpleComponent {
  constructor() {
    console.log('TestSimpleComponent cargado');
  }
}
