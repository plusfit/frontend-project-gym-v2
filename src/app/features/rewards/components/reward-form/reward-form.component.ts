import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { Storage } from "@angular/fire/storage";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import { ErrorHandlerService } from "@core/services/error-handler.service";
import { SnackBarService } from "@core/services/snackbar.service";
import { CreateRewardRequest, Reward } from "../../interfaces/reward.interface";
import { RewardsService } from "../../services/rewards.service";

export interface RewardFormData {
  mode: "create" | "edit";
  reward?: Reward;
}

@Component({
  selector: "app-reward-form",
  templateUrl: "./reward-form.component.html",
})
export class RewardFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEditMode: boolean;
  selectedFile: File | null = null;
  filePreview: string | ArrayBuffer | null = null;
  dragging = false;
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

  private readonly allowedFileTypes = ["image/gif", "image/jpeg", "image/jpg", "image/png"];

  constructor(
    private fb: FormBuilder,
    private rewardsService: RewardsService,
    private snackBarService: SnackBarService,
    private errorHandler: ErrorHandlerService,
    private storage: Storage,
    public dialogRef: MatDialogRef<RewardFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: RewardFormData,
  ) {
    this.isEditMode = data.mode === "edit";
    this.form = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.reward) {
      this.loadRewardData(this.data.reward);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ["", [Validators.required, Validators.maxLength(100)]],
      description: ["", [Validators.maxLength(500)]],
      pointsRequired: [0, [Validators.required, Validators.min(1)]],
      disabled: [false],
    });
  }

  private loadRewardData(reward: Reward): void {
    this.form.patchValue({
      name: reward.name,
      description: reward.description || "",
      pointsRequired: reward.pointsRequired,
      disabled: reward.disabled,
    });
    if (reward.imageUrl) {
      this.filePreview = reward.imageUrl;
    }
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

  private createReward(formData: CreateRewardRequest): void {
    if (this.selectedFile) {
      this.rewardsService.uploadRewardImage(this.selectedFile).subscribe({
        next: (uploadResult) => {
          this.rewardsService.getFileUrl(uploadResult.ref).subscribe({
            next: (url) => {
              const dataWithImage = {
                ...formData,
                imageUrl: url,
                imagePath: uploadResult.ref.fullPath,
                mediaType: "image" as const,
              };

              this.rewardsService.createReward(dataWithImage).subscribe({
                next: (response) => {
                  if (response.success) {
                    this.errorHandler.handleSuccess("create", "premio");
                    this.dialogRef.close(true);
                  } else {
                    this.snackBarService.showError("Error", "Error al crear el premio");
                  }
                  this.loading = false;
                },
                error: (error) => {
                  console.error("Error creating premio:", error);
                  this.errorHandler.handleHttpError(error, "create", "premio");
                  this.loading = false;
                },
              });
            },
            error: (error) => {
              console.error("Error getting file URL:", error);
              this.snackBarService.showError("Error", "Error al obtener URL del archivo");
              this.loading = false;
            },
          });
        },
        error: (error) => {
          console.error("Error uploading file:", error);
          this.snackBarService.showError("Error", "Error al subir la imagen");
          this.loading = false;
        },
      });
    } else {
      this.rewardsService.createReward(formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.errorHandler.handleSuccess("create", "premio");
            this.dialogRef.close(true);
          } else {
            this.snackBarService.showError("Error", "Error al crear el premio");
          }
          this.loading = false;
        },
        error: (error) => {
          console.error("Error creating premio:", error);
          this.errorHandler.handleHttpError(error, "create", "premio");
          this.loading = false;
        },
      });
    }
  }

  private updateReward(formData: Partial<CreateRewardRequest>): void {
    if (this.selectedFile) {
      this.rewardsService.uploadRewardImage(this.selectedFile).subscribe({
        next: (uploadResult) => {
          this.rewardsService.getFileUrl(uploadResult.ref).subscribe({
            next: (url) => {
              const dataWithImage = {
                ...formData,
                imageUrl: url,
                imagePath: uploadResult.ref.fullPath,
                mediaType: "image" as const,
              };

              if (this.data.reward) {
                this.rewardsService.updateReward(this.data.reward.id, dataWithImage).subscribe({
                  next: (response) => {
                    if (response.success) {
                      this.errorHandler.handleSuccess("update", "premio");
                      this.dialogRef.close(true);
                    } else {
                      this.snackBarService.showError("Error", "Error al actualizar el premio");
                    }
                    this.loading = false;
                  },
                  error: (error) => {
                    console.error("Error updating premio:", error);
                    this.errorHandler.handleHttpError(error, "update", "premio");
                    this.loading = false;
                  },
                });
              }
            },
            error: (error) => {
              console.error("Error getting file URL:", error);
              this.snackBarService.showError("Error", "Error al obtener URL del archivo");
              this.loading = false;
            },
          });
        },
        error: (error) => {
          console.error("Error uploading file:", error);
          this.snackBarService.showError("Error", "Error al subir la imagen");
          this.loading = false;
        },
      });
    } else {
      if (this.data.reward) {
        this.rewardsService.updateReward(this.data.reward.id, formData).subscribe({
          next: (response) => {
            if (response.success) {
              this.errorHandler.handleSuccess("update", "premio");
              this.dialogRef.close(true);
            } else {
              this.snackBarService.showError("Error", "Error al actualizar el premio");
            }
            this.loading = false;
          },
          error: (error) => {
            console.error("Error updating premio:", error);
            this.errorHandler.handleHttpError(error, "update", "premio");
            this.loading = false;
          },
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private markFormGroupTouched(): void {
    for (const key of Object.keys(this.form.controls)) {
      const control = this.form.get(key);
      control?.markAsTouched();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];

      if (!this.allowedFileTypes.includes(file.type)) {
        this.snackBarService.showError(
          "Error",
          "Formato no permitido. Solo se aceptan archivos GIF, JPG, JPEG y PNG",
        );
        input.value = "";
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64File = e.target?.result as string;
        this.filePreview = base64File;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.filePreview = null;
    this.selectedFile = null;

    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = "";
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  processFile(file: File): void {
    if (this.allowedFileTypes.includes(file.type)) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.filePreview = reader.result;
      };
      reader.readAsDataURL(file);

      console.log("Archivo seleccionado:", file.name);
    } else {
      this.snackBarService.showError(
        "Error",
        "Formato no permitido. Solo se aceptan archivos GIF, JPG, JPEG y PNG",
      );
    }
  }

  get nameError(): string {
    const control = this.form.get("name");
    if (control?.hasError("required") && control?.touched) {
      return "El nombre es requerido";
    }
    if (control?.hasError("maxlength") && control?.touched) {
      return "El nombre no puede exceder 100 caracteres";
    }
    return "";
  }

  get descriptionError(): string {
    const control = this.form.get("description");
    if (control?.hasError("maxlength") && control?.touched) {
      return "La descripción no puede exceder 500 caracteres";
    }
    return "";
  }

  get pointsError(): string {
    const control = this.form.get("pointsRequired");
    if (control?.hasError("required") && control?.touched) {
      return "Los puntos requeridos son obligatorios";
    }
    if (control?.hasError("min") && control?.touched) {
      return "Los puntos deben ser mayor a 0";
    }
    return "";
  }
}
