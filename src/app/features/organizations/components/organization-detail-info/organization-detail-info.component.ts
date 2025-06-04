import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Organization } from '../../interfaces/organization.interface';

@Component({
  selector: 'app-organization-detail-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organization-detail-info.component.html',
  styleUrl: './organization-detail-info.component.css',
})
export class OrganizationDetailInfoComponent implements OnInit {
  @Input() organization: Organization | null = null;

  ngOnInit() {
    // Demo data - remover cuando tengamos datos reales
    if (!this.organization) {
      this.organization = {
        _id: 'demo-org-id',
        name: 'Organización Demo',
        description:
          'Esta es una organización de demostración para mostrar las funcionalidades del sistema de gestión de gimnasios.',
        slug: 'org-demo',
        isActive: true,
      } as Organization;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'No disponible';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
