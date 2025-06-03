import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Plan } from '@features/plans/interfaces/plan.interface';

@Component({
  selector: 'app-organization-detail-plans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organization-detail-plans.component.html',
  styleUrl: './organization-detail-plans.component.css',
})
export class OrganizationDetailPlansComponent implements OnInit {
  @Input() plans: Plan[] | null = null;

  ngOnInit() {
    // Demo data - remover cuando tengamos datos reales
    if (!this.plans || this.plans.length === 0) {
      this.plans = [
        {
          _id: 'plan-1',
          name: 'Plan Básico',
          price: 50,
          duration: 30,
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          _id: 'plan-2',
          name: 'Plan Premium',
          price: 100,
          duration: 30,
          isActive: true,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
        },
        {
          _id: 'plan-3',
          name: 'Plan Familiar',
          price: 150,
          duration: 60,
          isActive: false,
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-03-01'),
        },
      ] as any as Plan[];
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return 'No disponible';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getPlanTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      room: 'Sala',
      cardio: 'Cardio',
      mixed: 'Mixto',
    };
    return typeLabels[type] || type;
  }

  getPlanTypeColor(type: string): string {
    const typeColors: { [key: string]: string } = {
      room: 'bg-blue-100 text-blue-800',
      cardio: 'bg-red-100 text-red-800',
      mixed: 'bg-purple-100 text-purple-800',
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  }

  trackByPlanId = (index: number, plan: Plan): string => {
    return plan._id || `plan-${index}`;
  };
}
