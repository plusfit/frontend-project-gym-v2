import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Organization, OrganizationClientStats } from '../../interfaces/organization.interface';
import { OrganizationsService } from '../../services/organizations.service';

@Component({
  selector: 'app-organization-detail-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organization-detail-info.component.html',
  styleUrl: './organization-detail-info.component.css',
})
export class OrganizationDetailInfoComponent implements OnInit {
  @Input() organization: Organization | null = null;
  
  clientStats: OrganizationClientStats | null = null;
  loadingStats = false;

  constructor(private organizationsService: OrganizationsService) {}

  ngOnInit() {
    // Demo data - remover cuando tengamos datos reales
    if (!this.organization) {
      this.organization = {
        _id: 'demo-org-id',
        name: 'Organización Demo',
        description:
          'Esta es una organización de demostración para mostrar las funcionalidades del sistema de gestión de gimnasios.',
        slug: 'org-demo',
        maxClients: 100,
        isActive: true,
      } as Organization;
      
      // Demo stats
      this.clientStats = {
        currentClients: 45,
        maxClients: 100,
        available: 55,
        percentage: 45
      };
    } else {
      this.loadClientStats();
    }
  }

  private loadClientStats() {
    if (!this.organization?._id || this.organization._id === 'demo-org-id') {
      return;
    }

    this.loadingStats = true;
    this.organizationsService.getOrganizationClientStats(this.organization._id)
      .subscribe({
        next: (stats) => {
          this.clientStats = stats;
          this.loadingStats = false;
        },
        error: (error) => {
          console.error('Error loading client stats:', error);
          this.loadingStats = false;
        }
      });
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

  getProgressBarColor(percentage: number): string {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  }
}
