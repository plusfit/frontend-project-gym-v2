import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SnackBarService } from '@core/services/snackbar.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { TableComponent } from '@shared/components/table/table.component';
import { Reward, RewardFilters } from '../../interfaces/reward.interface';
import { RewardsService } from '../../services/rewards.service';
import { RewardFormComponent } from '../reward-form/reward-form.component';

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
    TableComponent,
    ConfirmDialogComponent
  ]
})
export class RewardsListComponent implements OnInit {
  displayedColumns: string[] = [
    'name',
    'pointsRequired',
    'totalExchanges',
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
  showEnabledOnly = new FormControl(false);

  constructor(
    private rewardsService: RewardsService,
    private dialog: MatDialog,
    private snackBarService: SnackBarService
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
      enabled: this.showEnabledOnly.value ? true : undefined,
      page: this.currentPage + 1,
      limit: this.pageSize
    };

    this.rewardsService.getRewards(filters).subscribe({
      next: (response) => {
        console.log('Rewards API Response:', response);
        if (response?.success && response?.data) {
          // La respuesta tiene estructura anidada: response.data contiene success, data y pagination
          const rewardsData = response.data.data || [];
          const paginationData = response.data.pagination || {};
          
          this.rewards = rewardsData;
          this.totalCount = paginationData.totalCount || 0;
          this.filteredData = !!(filters.search || filters.enabled === true);
        } else {
          console.warn('Invalid response structure:', response);
          this.rewards = [];
          this.totalCount = 0;
          this.filteredData = false;
          this.snackBarService.showError('Error', 'Respuesta inválida del servidor');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading rewards:', error);
        this.snackBarService.showError('Error', 'Error al cargar los premios. Verifique que el backend esté funcionando.');
        this.rewards = [];
        this.totalCount = 0;
        this.filteredData = false;
        this.loading = false;
      }
    });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
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
        this.snackBarService.showSuccess('Éxito', 'Premio creado exitosamente');
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
          this.snackBarService.showSuccess('Éxito', 'Premio actualizado exitosamente');
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
          this.snackBarService.showSuccess('Éxito', `Premio ${status} exitosamente`);
        }
      },
      error: (error) => {
        console.error('Error toggling reward:', error);
        this.snackBarService.showError('Error', 'Error al cambiar el estado del premio');
      }
    });
  }

  deleteReward(reward: Reward): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Eliminar Premio',
        contentMessage: `¿Estás seguro de que deseas eliminar el premio "${reward.name}"? Esta acción no se puede deshacer.`,
        icon: 'ph-gift',
        iconColor: 'bg-red-100',
        confirmButtonText: 'Eliminar'
      }
    });

    dialogRef.componentInstance.confirm.subscribe((result: boolean) => {
      if (result) {
        this.rewardsService.deleteReward(reward.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.loadRewards();
              this.snackBarService.showSuccess('Éxito', 'Premio eliminado exitosamente');
            }
          },
          error: (error) => {
            const message = error.error?.data.message || 'Error al eliminar el premio';
            this.snackBarService.showError('Error', message);
          }
        });
      }
    });
  }


}