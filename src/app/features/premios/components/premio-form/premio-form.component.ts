import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Premio } from '../../interfaces/premio.interface';
import { PremiosService } from '../../services/premios.service';

export interface PremioFormData {
  mode: 'create' | 'edit';
  premio?: Premio;
}

@Component({
  selector: 'app-premio-form',
  templateUrl: './premio-form.component.html',
  styleUrls: ['./premio-form.component.scss']
})
export class PremioFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    private premiosService: PremiosService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PremioFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PremioFormData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.form = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.premio) {
      this.loadPremioData(this.data.premio);
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

  private loadPremioData(premio: Premio): void {
    this.form.patchValue({
      name: premio.name,
      description: premio.description || '',
      pointsRequired: premio.pointsRequired,
      enabled: premio.enabled
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
      this.updatePremio(formData);
    } else {
      this.createPremio(formData);
    }
  }

  private createPremio(formData: any): void {
    this.premiosService.createPremio(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.dialogRef.close(true);
        } else {
          this.showSnackBar('Error al crear el premio');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error creating premio:', error);
        const message = error.error?.message || 'Error al crear el premio';
        this.showSnackBar(message);
        this.loading = false;
      }
    });
  }

  private updatePremio(formData: any): void {
    this.premiosService.updatePremio(this.data.premio!.id, formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.dialogRef.close(true);
        } else {
          this.showSnackBar('Error al actualizar el premio');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating premio:', error);
        const message = error.error?.message || 'Error al actualizar el premio';
        this.showSnackBar(message);
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


  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
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