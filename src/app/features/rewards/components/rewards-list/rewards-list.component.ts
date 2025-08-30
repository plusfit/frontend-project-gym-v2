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

import { Reward, RewardFilters } from '../../interfaces/reward.interface';
import { RewardsService } from '../../services/rewards.service';
import { RewardFormComponent } from '../reward-form/reward-form.component';
import { TableComponent } from '@shared/components/table/table.component';
import { EColorBadge } from '@shared/enums/badge-color.enum';

@Component({
  selector: 'app-rewards-list',
  templateUrl: './rewards-list.component.html',
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
export class RewardsListComponent implements OnInit {
  displayedColumns: string[] = [
    'name',
    'pointsRequired',
    'totalCanjes',
    'createdAt',
    'enabled',
    'acciones'
  ];

  rewards: Reward[] = [];
  loading = false;
  totalCount = 0;
  pageSize = 10;
  currentPage = 0;
  filteredData = false;

  // Filtros
  searchControl = new FormControl('');
  showEnabledOnly = new FormControl(true);

  constructor(
    private rewardsService: RewardsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.setupFilters();
    this.loadRewards();
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
        this.loadRewards();
      });

    // Filtro de habilitados
    this.showEnabledOnly.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.loadRewards();
    });
  }

  loadRewards(): void {
    this.loading = true;

    const filters: RewardFilters = {
      search: this.searchControl.value || undefined,
      enabled: this.showEnabledOnly.value || undefined,
      page: this.currentPage + 1,
      limit: this.pageSize
    };

    this.rewardsService.getRewards(filters).subscribe({
      next: (response) => {
        console.log('Rewards API Response:', response);
        if (response && response.success && response.data) {
          // La respuesta tiene estructura anidada: response.data.data contiene los premios
          const rewardsData = response.data.data || [];
          const paginationData = response.data.pagination || {};
          
          this.rewards = rewardsData;
          this.totalCount = paginationData.totalCount || 0;
          this.filteredData = !!(filters.search || filters.enabled !== undefined);
        } else {
          console.warn('Invalid response structure:', response);
          this.rewards = [];
          this.totalCount = 0;
          this.filteredData = false;
          this.showSnackBar('Respuesta inválida del servidor');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading rewards:', error);
        this.showSnackBar('Error al cargar los premios. Verifique que el backend esté funcionando.');
        this.rewards = [];
        this.totalCount = 0;
        this.filteredData = false;
        this.loading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadRewards();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(RewardFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRewards();
        this.showSnackBar('Premio creado exitosamente');
      }
    });
  }

  openEditDialog(rewardId: string): void {
    const reward = this.rewards.find(r => r.id === rewardId);
    if (reward) {
      const dialogRef = this.dialog.open(RewardFormComponent, {
        width: '600px',
        data: { mode: 'edit', reward }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadRewards();
          this.showSnackBar('Premio actualizado exitosamente');
        }
      });
    }
  }

  toggleEnabled(data: { id: string; disabled: boolean }): void {
    this.rewardsService.toggleRewardEnabled(data.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadRewards();
          const status = data.disabled ? 'habilitado' : 'deshabilitado';
          this.showSnackBar(`Premio ${status} exitosamente`);
        }
      },
      error: (error) => {
        console.error('Error toggling reward:', error);
        this.showSnackBar('Error al cambiar el estado del premio');
      }
    });
  }

  deleteReward(reward: Reward): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el premio "${reward.name}"? Esta acción no se puede deshacer.`)) {
      this.rewardsService.deleteReward(reward.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadRewards();
            this.showSnackBar('Premio eliminado exitosamente');
          }
        },
        error: (error) => {
          console.error('Error deleting reward:', error);
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