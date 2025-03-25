import { CommonModule, NgIf } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { SnackBarService } from '@core/services/snackbar.service';
import { Exercise } from '@features/exercises/interfaces/exercise.interface';
import {
  CreateExercise,
  GetExerciseById,
  GetExercisesByPage,
  UpdateExercise,
} from '@features/exercises/state/exercise.actions';
import { ExerciseState } from '@features/exercises/state/exercise.state';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { Observable, Subject, takeUntil } from 'rxjs';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { MatSelectModule } from '@angular/material/select';
import { InputComponent } from '@shared/components/input/input.component';
import { TextAreaComponent } from '@shared/components/text-area/text-area.component';
import { TitleComponent } from '@shared/components/title/title.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-exercise-form',
  styleUrls: ['./exercise-form.component.css'],
  templateUrl: './exercise-form.component.html',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    NgIf,
    BtnDirective,
    CommonModule,
    LoaderComponent,
    FormsModule,
    MatSelectModule,
    InputComponent,
    TextAreaComponent,
    TitleComponent,
    MatAutocompleteModule,
    MatInputModule,
  ],
})
export class ExerciseFormComponent implements OnInit, OnDestroy {
  constructor(
    public dialogRef: MatDialogRef<ExerciseFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { isEdit: boolean; exerciseId: string },
    private fb: FormBuilder,
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
  ) {}

  loading$: Observable<boolean> = this.store.select(
    ExerciseState.exerciseLoading,
  );
  exerciseForm!: FormGroup;
  private destroy = new Subject<void>();
  title = 'Agregar ejercicio';
  btnTitle = 'Crear';
  selectedFile: File | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  filePreview: string | ArrayBuffer | null = null;
  dragging = false;

  types = [
    { value: 'cardio', viewValue: 'Cardio' },
    { value: 'room', viewValue: 'Sala' },
  ];

  categories = [
    { value: 'chest', viewValue: 'Pecho' },
    { value: 'back', viewValue: 'Espalda' },
    { value: 'shoulders', viewValue: 'Hombros' },
    { value: 'biceps', viewValue: 'Bíceps' },
    { value: 'triceps', viewValue: 'Tríceps' },
    { value: 'forearms', viewValue: 'Antebrazos' },
    { value: 'quadriceps', viewValue: 'Cuádriceps' },
    { value: 'hamstrings', viewValue: 'Isquiotibiales' },
    { value: 'glutes', viewValue: 'Glúteos' },
    { value: 'calves', viewValue: 'Pantorrillas' },
    { value: 'core', viewValue: 'Core' },
    { value: 'lower_back', viewValue: 'Zona Lumbar' },

    // Tipo de Movimiento
    { value: 'push', viewValue: 'Empuje' },
    { value: 'pull', viewValue: 'Tracción' },
    { value: 'knee_dominant', viewValue: 'Dominante de Rodilla' },
    { value: 'hip_dominant', viewValue: 'Dominante de Cadera' },
    { value: 'stabilization', viewValue: 'Estabilización' },
  ];

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.exerciseForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      gifUrl: [''],
      categorie: ['', Validators.required],
      type: ['', Validators.required],
      //mode: ['', Validators.required],
      rest: ['', [Validators.required, Validators.min(1)]],

      minutes: [{ value: '', disabled: true }],
      reps: [{ value: '', disabled: true }],
      series: [{ value: '', disabled: true }],
    });

    this.exerciseForm.get('type')?.valueChanges.subscribe((type) => {
      this.toggleExerciseFields(type);
    });

    if (this.data.isEdit && this.data.exerciseId) {
      this.store.dispatch(new GetExerciseById(this.data.exerciseId));
      this.actions
        .pipe(ofActionSuccessful(GetExerciseById), takeUntil(this.destroy))
        .subscribe(() => {
          const exerciseEditing = this.store.selectSnapshot(
            ExerciseState.exerciseEditing,
          );
          if (exerciseEditing) this.setDataForEdit(exerciseEditing);
        });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar que sea un archivo GIF
      if (!file.type.includes('gif')) {
        alert('Solo se permiten archivos GIF.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        // Convertir el archivo a Base64
        const base64File = e.target?.result as string;

        // Asignar el string Base64 al formulario
        this.exerciseForm.patchValue({
          gifUrl: base64File, // Aquí asignas el string Base64 al campo gifUrl
        });

        // Actualizar la vista previa (opcional)
        this.filePreview = base64File;
      };
      reader.readAsDataURL(file); // Convertir el archivo a Base64
    }
  }

  removeFile(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.filePreview = null;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  processFile(file: File) {
    if (file.type === 'image/gif') {
      this.selectedFile = file;

      // Generar vista previa
      const reader = new FileReader();
      reader.onload = () => {
        this.filePreview = reader.result;
      };
      reader.readAsDataURL(file);

      console.log('Archivo seleccionado:', file.name);
    } else {
      console.error('Formato no permitido. Solo GIF.');
    }
  }

  setDataForEdit(exerciseEditing: Exercise): void {
    this.title = 'Editar ejercicio';
    this.btnTitle = 'Guardar';
    this.exerciseForm.patchValue(exerciseEditing);
    this.toggleExerciseFields(exerciseEditing.type);
  }

  toggleExerciseFields(type: string): void {
    if (type === 'cardio') {
      this.exerciseForm.get('minutes')?.enable();
      this.exerciseForm
        .get('minutes')
        ?.setValidators([Validators.required, Validators.min(1)]);

      // Deshabilita y quita validadores para los campos que no aplican
      this.exerciseForm.get('reps')?.disable();
      this.exerciseForm.get('reps')?.clearValidators();

      this.exerciseForm.get('series')?.disable();
      this.exerciseForm.get('series')?.clearValidators();
    } else if (type === 'room') {
      this.exerciseForm.get('reps')?.enable();
      this.exerciseForm
        .get('reps')
        ?.setValidators([Validators.required, Validators.min(1)]);

      this.exerciseForm.get('series')?.enable();
      this.exerciseForm
        .get('series')
        ?.setValidators([Validators.required, Validators.min(1)]);

      // Deshabilita y quita validadores para los campos que no aplican
      this.exerciseForm.get('minutes')?.disable();
      this.exerciseForm.get('minutes')?.clearValidators();
    }

    // Actualiza la validez de los campos condicionales
    this.exerciseForm.get('minutes')?.updateValueAndValidity();
    this.exerciseForm.get('rest')?.updateValueAndValidity();
    this.exerciseForm.get('reps')?.updateValueAndValidity();
    this.exerciseForm.get('series')?.updateValueAndValidity();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.exerciseForm.valid) {
      if (this.data.isEdit && this.data.exerciseId) this.update();
      else this.create();
    }
  }

  update(): void {
    this.store.dispatch(
      new UpdateExercise(this.exerciseForm.value, this.data.exerciseId),
    );
    this.actions
      .pipe(ofActionSuccessful(UpdateExercise), takeUntil(this.destroy))
      .subscribe(() => {
        this.store.dispatch(
          new GetExercisesByPage({
            page: 1,
          }),
        );
        this.snackbar.showSuccess('Éxito!', 'Ejercicio actualizado');
        this.dialogRef.close();
      });
  }

  create(): void {
    this.store.dispatch(new CreateExercise(this.exerciseForm.value));
    this.actions
      .pipe(ofActionSuccessful(CreateExercise), takeUntil(this.destroy))
      .subscribe(() => {
        this.store.dispatch(
          new GetExercisesByPage({
            page: 1,
          }),
        );
        this.snackbar.showSuccess('Éxito!', 'Ejercicio creado');
        this.dialogRef.close();
      });
  }

  get nameControl(): FormControl {
    return this.exerciseForm.get('name') as FormControl;
  }

  get descriptionControl(): FormControl {
    return this.exerciseForm.get('description') as FormControl;
  }

  get minutesControl(): FormControl {
    return this.exerciseForm.get('minutes') as FormControl;
  }

  get repsControl(): FormControl {
    return this.exerciseForm.get('reps') as FormControl;
  }

  get restControl(): FormControl {
    return this.exerciseForm.get('rest') as FormControl;
  }

  get seriesControl(): FormControl {
    return this.exerciseForm.get('series') as FormControl;
  }

  get caterieControl(): FormControl {
    return this.exerciseForm.get('categorie') as FormControl;
  }
}
