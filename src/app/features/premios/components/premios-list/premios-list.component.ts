import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Premio, PremioFilters } from '../../interfaces/premio.interface';
import { PremiosService } from '../../services/premios.service';
import { PremioFormComponent } from '../premio-form/premio-form.component';
import { TableComponent } from '@shared/components/table/table.component';
import { EColorBadge } from '@shared/enums/badge-color.enum';

@Component({
  selector: 'app-premios-list',
  templateUrl: './premios-list.component.html',
  styleUrls: ['./premios-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    TableComponent
  ]
})
export class PremiosListComponent implements OnInit {
  displayedColumns: string[] = [
    'name',
    'pointsRequired',
    'totalCanjes',
    'createdAt',
    'enabled',
    'acciones'
  ];

  premios: Premio[] = [];
  loading = false;
  totalCount = 0;
  pageSize = 10;
  currentPage = 0;
  filteredData = false;

  // Filtros
  searchControl = new FormControl('');
  showEnabledOnly = new FormControl(true);

  constructor(
    private premiosService: PremiosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.setupFilters();
    this.loadPremios();
  }

  private setupFilters(): void {
    // Filtro de búsqueda con debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadPremios();
      });

    // Filtro de habilitados
    this.showEnabledOnly.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.loadPremios();
    });
  }

  loadPremios(): void {
    this.loading = true;

    const filters: PremioFilters = {
      search: this.searchControl.value || undefined,
      enabled: this.showEnabledOnly.value || undefined,
      page: this.currentPage + 1,
      limit: this.pageSize
    };

    this.premiosService.getPremios(filters).subscribe({
      next: (response) => {
        console.log('Premios API Response:', response);
        if (response && response.success && response.data) {
          // La respuesta tiene estructura anidada: response.data.data contiene los premios
          const premiosData = response.data.data || [];
          const paginationData = response.data.pagination || {};
          
          this.premios = premiosData;
          this.totalCount = paginationData.totalCount || 0;
          this.filteredData = !!(filters.search || filters.enabled !== undefined);
        } else {
          console.warn('Invalid response structure:', response);
          this.premios = [];
          this.totalCount = 0;
          this.filteredData = false;
          this.showSnackBar('Respuesta inválida del servidor');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading premios:', error);
        this.showSnackBar('Error al cargar los premios. Verifique que el backend esté funcionando.');
        this.premios = [];
        this.totalCount = 0;
        this.filteredData = false;
        this.loading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPremios();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PremioFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPremios();
        this.showSnackBar('Premio creado exitosamente');
      }
    });
  }

  openEditDialog(premioId: string): void {
    const premio = this.premios.find(p => p.id === premioId);
    if (premio) {
      const dialogRef = this.dialog.open(PremioFormComponent, {
        width: '600px',
        data: { mode: 'edit', premio }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadPremios();
          this.showSnackBar('Premio actualizado exitosamente');
        }
      });
    }
  }

  toggleEnabled(data: { id: string; disabled: boolean }): void {
    this.premiosService.togglePremioEnabled(data.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPremios();
          const status = data.disabled ? 'habilitado' : 'deshabilitado';
          this.showSnackBar(`Premio ${status} exitosamente`);
        }
      },
      error: (error) => {
        console.error('Error toggling premio:', error);
        this.showSnackBar('Error al cambiar el estado del premio');
      }
    });
  }

  deletePremio(premio: Premio): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el premio "${premio.name}"? Esta acción no se puede deshacer.`)) {
      this.premiosService.deletePremio(premio.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadPremios();
            this.showSnackBar('Premio eliminado exitosamente');
          }
        },
        error: (error) => {
          console.error('Error deleting premio:', error);
          const message = error.error?.message || 'Error al eliminar el premio';
          this.showSnackBar(message);
        }
      });
    }
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}