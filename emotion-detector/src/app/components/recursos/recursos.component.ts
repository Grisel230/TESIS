import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { PdfGeneratorService } from '../../services/pdf-generator.service';

interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  count: number;
  color: string;
  icon: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  size: string;
  date: string;
  tags: string[];
  url: string;
}

@Component({
  selector: 'app-recursos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './recursos.component.html',
  styleUrls: ['./recursos.component.css']
})
export class RecursosComponent implements OnInit {
  sidebarVisible = true;
  selectedCategory = 'all';
  searchQuery = '';
  isDarkMode = false;
  psicologo: any = null;

  resourceCategories: ResourceCategory[] = [
    {
      id: 'Video',
      name: 'Videos',
      description: 'Tutoriales en video',
      count: 0,
      color: '#f59e0b',
      icon: 'M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z'
    },
    {
      id: 'Artículo',
      name: 'Artículos',
      description: 'Artículos y publicaciones',
      count: 0,
      color: '#3b82f6',
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z'
    },
    {
      id: 'Libro',
      name: 'Libros',
      description: 'Libros y manuales',
      count: 0,
      color: '#8b5cf6',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8'
    }
  ];

  resources: Resource[] = [
    {
      id: '1',
      title: 'Guía de Uso del Sistema',
      description: 'Manual completo para el uso del sistema de análisis emocional',
      categoryId: 'guides',
      size: '125 KB',
      date: '17 Nov 2025',
      tags: ['manual', 'inicio', 'básico'],
      url: '/resources/guia-uso.txt'
    },
    {
      id: '2',
      title: 'Plantilla de Evaluación',
      description: 'Formulario estándar para evaluaciones emocionales',
      categoryId: 'templates',
      size: '45 KB',
      date: '17 Nov 2025',
      tags: ['formulario', 'evaluación', 'estándar'],
      url: '/resources/plantilla-evaluacion.txt'
    },
    {
      id: '3',
      title: 'Tutorial: Primeros Pasos',
      description: 'Guía completa paso a paso para comenzar a usar el sistema',
      categoryId: 'videos',
      size: '85 KB',
      date: '17 Nov 2025',
      tags: ['tutorial', 'guía', 'inicio'],
      url: '/resources/tutorial-primeros-pasos.txt'
    }
  ];

  filteredResources: Resource[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService,
    private pdfGenerator: PdfGeneratorService
  ) {}

  ngOnInit(): void {
    this.filteredResources = this.resources;
    
    // Inicializar con el valor actual del tema
    this.isDarkMode = this.themeService.isDarkMode();
    
    // Suscribirse a los cambios del tema
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
      console.log('Modo oscuro cambiado en recursos:', isDark);
    });

    // Cargar datos del psicólogo
    this.psicologo = this.authService.getPsicologo();
  }

  logout(): void {
    this.authService.logout();
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

  selectCategory(category: ResourceCategory): void {
    this.selectedCategory = category.id;
    this.filterResources();
  }

  filterResources(): void {
    if (this.selectedCategory === 'all') {
      this.filteredResources = this.resources;
    } else {
      this.filteredResources = this.resources.filter(resource => 
        resource.categoryId === this.selectedCategory
      );
    }
  }

  getCategoryColor(categoryId: string): string {
    const category = this.resourceCategories.find(cat => cat.id === categoryId);
    if (category) {
      // En modo oscuro, usar colores más suaves para todas las categorías
      return this.isDarkMode ? this.getDarkModeColor(category.color) : category.color;
    }
    // Color neutro para "Sin categoría" según el tema
    return this.isDarkMode ? '#21262d' : '#6b7280';
  }

  private getDarkModeColor(originalColor: string): string {
    // Mapeo de colores para modo oscuro más integrados
    const colorMap: { [key: string]: string } = {
      '#f59e0b': '#d29922', // Amarillo más suave (Videos)
      '#3b82f6': '#58a6ff', // Azul GitHub (Artículos)
      '#8b5cf6': '#a855f7'  // Morado más suave (Libros)
    };
    return colorMap[originalColor] || originalColor;
  }

  getCategoryName(categoryId: string): string {
    const category = this.resourceCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Sin categoría';
  }

  addResource(): void {
    console.log('Agregando nuevo recurso...');
    // TODO: Implementar modal para agregar nuevo recurso
    // Por ahora, mostrar mensaje informativo
    console.log('Funcionalidad de agregar recurso próximamente disponible');
  }

  async downloadResource(resource: Resource, event?: Event): Promise<void> {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('Descargando recurso:', resource.title);
    await this.generatePDF(resource);
  }

  shareResource(resource: Resource, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('Compartiendo recurso:', resource.title);
    alert(`Compartiendo: ${resource.title}`);
  }

  async viewResource(resource: Resource, event?: Event): Promise<void> {
    // Prevenir comportamiento por defecto y propagación del evento
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('Viendo recurso:', resource.title);
    // Generar y descargar el PDF
    await this.generatePDF(resource);
  }

  private async generatePDF(resource: Resource): Promise<void> {
    try {
      switch (resource.id) {
        case '1':
          await this.pdfGenerator.generateGuiaUso();
          break;
        case '2':
          await this.pdfGenerator.generatePlantillaEvaluacion();
          break;
        case '3':
          await this.pdfGenerator.generateTutorialPrimerosPasos();
          break;
        case '4':
          await this.pdfGenerator.generateProtocoloAnalisis();
          break;
        default:
          alert('Recurso no disponible');
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  }

  openQuickResource(type: string): void {
    console.log('Abriendo recurso rápido:', type);
    alert(`Abriendo: ${type}`);
  }

  getFirstName(): string {
    const psicologo = this.authService.getPsicologo();
    if (psicologo && psicologo.nombre_completo) {
      const nombreCompleto = psicologo.nombre_completo;
      return nombreCompleto.split(' ')[0];
    }
    return 'Usuario';
  }

  getIconClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      '#3b82f6': 'blue',
      '#10b981': 'green',
      '#f59e0b': 'orange',
      '#8b5cf6': 'purple'
    };
    return colorMap[color] || 'blue';
  }

  searchResources(): void {
    if (!this.searchQuery.trim()) {
      this.filterResources();
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredResources = this.resources.filter((resource: Resource) => 
      resource.title.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query) ||
      resource.tags.some((tag: string) => tag.toLowerCase().includes(query))
    );
  }
}
