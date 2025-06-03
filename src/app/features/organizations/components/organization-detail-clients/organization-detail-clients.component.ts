import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client } from '@features/client/interface/clients.interface';

@Component({
  selector: 'app-organization-detail-clients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organization-detail-clients.component.html',
  styleUrl: './organization-detail-clients.component.css',
})
export class OrganizationDetailClientsComponent implements OnInit {
  @Input() clients: Client[] | null = null;

  ngOnInit() {
    // Demo data - remover cuando tengamos datos reales
    if (!this.clients || this.clients.length === 0) {
      this.clients = [
        {
          _id: 'client-1',
          name: 'Juan Pérez',
          CI: '12345678',
          sex: 'M',
          phone: '+598-98765432',
          address: 'Av. 18 de Julio 1234, Montevideo',
          dateBirthday: '1990-05-15',
          medicalSociety: 'ASSE',
          bloodPressure: '120/80',
          frequencyOfPhysicalExercise: '3 veces por semana',
          planId: 'plan-1',
        },
        {
          _id: 'client-2',
          name: 'María González',
          CI: '87654321',
          sex: 'F',
          phone: '+598-91234567',
          address: 'Pocitos 456, Montevideo',
          dateBirthday: '1985-09-22',
          medicalSociety: 'Medica Uruguaya',
          bloodPressure: '110/70',
          frequencyOfPhysicalExercise: '4 veces por semana',
          planId: 'plan-2',
        },
        {
          _id: 'client-3',
          name: 'Carlos Rodríguez',
          CI: '45678912',
          sex: 'M',
          phone: '+598-94567890',
          address: 'Cordón 789, Montevideo',
          dateBirthday: '1992-12-03',
          medicalSociety: 'CASMU',
          bloodPressure: '115/75',
          frequencyOfPhysicalExercise: '2 veces por semana',
          planId: 'plan-1',
        },
      ] as any as Client[];
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'No disponible';

    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  calculateAge(birthDate: string): number {
    if (!birthDate) return 0;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  getSexLabel(sex: string): string {
    const sexLabels: { [key: string]: string } = {
      M: 'Masculino',
      F: 'Femenino',
      male: 'Masculino',
      female: 'Femenino',
    };
    return sexLabels[sex] || sex;
  }

  trackByClientId = (index: number, client: Client): string => {
    return client._id || `client-${index}`;
  };
}
