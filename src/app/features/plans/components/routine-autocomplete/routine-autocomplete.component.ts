import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { Observable, Subject } from 'rxjs';
import { debounceTime, switchMap, startWith, takeUntil } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { Routine } from '@features/routines/interfaces/routine.interface';
import { GetRoutinesByName } from '@features/routines/state/routine.actions';
import { RoutineState } from '@features/routines/state/routine.state';
import { CommonModule } from '@angular/common';
import { ValidationErrorsPipe } from '@shared/pipes/validation-errors.pipe';

@Component({
  selector: 'app-routine-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
  ],
  template: `
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>Buscar Rutina</mat-label>
      <input
        type="text"
        matInput
        [formControl]="control"
        [matAutocomplete]="auto"
        placeholder="Ingrese el nombre de la rutina"
      />
      <mat-autocomplete
        #auto="matAutocomplete"
        (optionSelected)="onSelect($event.option.value)"
      >
        <mat-option
          *ngFor="let routine of filteredRoutines$ | async"
          [value]="routine.name"
        >
          {{ routine.name }}
        </mat-option>
      </mat-autocomplete>
      <mat-error>
        @if (control.errors) {
          Este campo es obligatorio.
        }
      </mat-error>
    </mat-form-field>
  `,
})
export class RoutineAutocompleteComponent implements OnInit, OnDestroy {
  @Input() control!: FormControl;
  @Output() routineSelected = new EventEmitter<Routine>();
  searchControl = new FormControl('');
  filteredRoutines$!: Observable<Routine[]>;
  private destroy$ = new Subject<void>();

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.filteredRoutines$ = this.control.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap((searchTerm) =>
        this.store
          .dispatch(
            new GetRoutinesByName(
              { page: 1 },
              { name: searchTerm ? searchTerm : '' },
            ),
          )
          .pipe(switchMap(() => this.store.select(RoutineState.routines))),
      ),
      takeUntil(this.destroy$),
    );
  }

  onSelect(routineName: string): void {
    const routines = this.store.selectSnapshot(RoutineState.routines);
    const selectedRoutine = routines.find(
      (routine: any) => routine.name === routineName,
    );
    if (selectedRoutine) {
      this.routineSelected.emit(selectedRoutine);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
