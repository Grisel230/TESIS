import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  resourceCategories: ResourceCategory[] = [
    {
      id: 'guides',
      name: 'Guías',
      description: 'Manuales y guías de uso',
      count: 12,
      color: '#3b82f6',
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z'
    },
    {
      id: 'templates',
      name: 'Plantillas',
      description: 'Formularios y plantillas',
      count: 8,
      color: '#10b981',
      icon: 'M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zM4 13a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6zM16 13a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-6z'
    },
    {
      id: 'videos',
      name: 'Videos',
      description: 'Tutoriales en video',
      count: 15,
      color: '#f59e0b',
      icon: 'M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z'
    },
    {
      id: 'documents',
      name: 'Documentos',
      description: 'PDFs y documentos técnicos',
      count: 20,
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
      size: '2.5 MB',
      date: '15 Dic 2024',
      tags: ['manual', 'inicio', 'básico'],
      url: '/resources/guia-uso.pdf'
    },
    {
      id: '2',
      title: 'Plantilla de Evaluación',
      description: 'Formulario estándar para evaluaciones emocionales',
      categoryId: 'templates',
      size: '150 KB',
      date: '12 Dic 2024',
      tags: ['formulario', 'evaluación', 'estándar'],
      url: '/resources/plantilla-evaluacion.pdf'
    },
    {
      id: '3',
      title: 'Tutorial: Primeros Pasos',
      description: 'Video tutorial para comenzar a usar el sistema',
      categoryId: 'videos',
      size: '45 MB',
      date: '10 Dic 2024',
      tags: ['tutorial', 'video', 'inicio'],
      url: '/resources/tutorial-primeros-pasos.mp4'
    },
    {
      id: '4',
      title: 'Protocolo de Análisis',
      description: 'Documento técnico con el protocolo de análisis emocional',
      categoryId: 'documents',
      size: '1.8 MB',
      date: '8 Dic 2024',
      tags: ['protocolo', 'técnico', 'análisis'],
      url: '/resources/protocolo-analisis.pdf'
    }
  ];

  filteredResources: Resource[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filteredResources = this.resources;
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
    return category ? category.color : '#6b7280';
  }

  getCategoryName(categoryId: string): string {
    const category = this.resourceCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Sin categoría';
  }

  addResource(): void {
    console.log('Agregando nuevo recurso...');
    alert('Funcionalidad de agregar recurso en desarrollo');
  }

  downloadResource(resource: Resource): void {
    console.log('Descargando recurso:', resource.title);
    // Aquí implementarías la lógica de descarga
    alert(`Descargando: ${resource.title}`);
  }

  shareResource(resource: Resource): void {
    console.log('Compartiendo recurso:', resource.title);
    // Aquí implementarías la lógica de compartir
    alert(`Compartiendo: ${resource.title}`);
  }

  viewResource(resource: Resource): void {
    console.log('Viendo recurso:', resource.title);
    // Aquí implementarías la lógica para ver el recurso
    alert(`Abriendo: ${resource.title}`);
  }

  openQuickResource(type: string): void {
    console.log('Abriendo recurso rápido:', type);
    // Aquí implementarías la lógica para abrir recursos rápidos
    alert(`Abriendo: ${type}`);
  }
}