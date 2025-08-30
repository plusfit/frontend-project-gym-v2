import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Reward } from '../../interfaces/reward.interface';
import { RewardsService } from '../../services/rewards.service';
import { SnackBarService } from '@core/services/snackbar.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';

export interface RewardFormData {
  mode: 'create' | 'edit';
  reward?: Reward;
}

@Component({
  selector: 'app-reward-form',
  templateUrl: './reward-form.component.html'
})
export class RewardFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    private rewardsService: RewardsService,
    private snackBarService: SnackBarService,
    private errorHandler: ErrorHandlerService,
    public dialogRef: MatDialogRef<RewardFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RewardFormData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.form = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.reward) {
      this.loadRewardData(this.data.reward);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      pointsRequired: [0, [Validators.required, Validators.min(1)]],
      enabled: [false]
    });
  }

  private loadRewardData(reward: Reward): void {
    this.form.patchValue({
      name: reward.name,
      description: reward.description || '',
      pointsRequired: reward.pointsRequired,
      enabled: reward.enabled
    });
  }


  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;

    const formData = this.form.value;

    if (this.isEditMode) {
      this.updateReward(formData);
    } else {
      this.createReward(formData);
    }
  }

  private createReward(formData: any): void {
    this.rewardsService.createReward(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.errorHandler.handleSuccess('create', 'premio');
          this.dialogRef.close(true);
        } else {
          this.snackBarService.showError('Error', 'Error al crear el premio');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error creating premio:', error);
        // Option 1: Using ErrorHandlerService (recommended)
        this.errorHandler.handleHttpError(error, 'create', 'premio');
        
        // Option 2: Using SnackBarService directly (alternative)
        // this.snackBarService.showBackendError(error, 'Error al crear premio', 'create');
        
        this.loading = false;
      }
    });
  }

  private updateReward(formData: any): void {
    this.rewardsService.updateReward(this.data.reward!.id, formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.errorHandler.handleSuccess('update', 'premio');
          this.dialogRef.close(true);
        } else {
          this.snackBarService.showError('Error', 'Error al actualizar el premio');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating premio:', error);
        this.errorHandler.handleHttpError(error, 'update', 'premio');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }



  // Getters para validaciones en el template
  get nameError(): string {
    const control = this.form.get('name');
    if (control?.hasError('required') && control?.touched) {
      return 'El nombre es requerido';
    }
    if (control?.hasError('maxlength') && control?.touched) {
      return 'El nombre no puede exceder 100 caracteres';
    }
    return '';
  }

  get descriptionError(): string {
    const control = this.form.get('description');
    if (control?.hasError('maxlength') && control?.touched) {
      return 'La descripción no puede exceder 500 caracteres';
    }
    return '';
  }

  get pointsError(): string {
    const control = this.form.get('pointsRequired');
    if (control?.hasError('required') && control?.touched) {
      return 'Los puntos requeridos son obligatorios';
    }
    if (control?.hasError('min') && control?.touched) {
      return 'Los puntos deben ser mayor a 0';
    }
    return '';
  }
}