import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
  OnChanges,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { Observable, Subject } from 'rxjs';
import {
  debounceTime,
  switchMap,
  startWith,
  takeUntil,
  map,
} from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
  ],
  template: `
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>{{ placeholder }}</mat-label>
      <input
        type="text"
        matInput
        [formControl]="control"
        [matAutocomplete]="auto"
        [placeholder]="placeholder"
      />
      <mat-autocomplete
        #auto="matAutocomplete"
        (optionSelected)="onSelect($event.option.value)"
      >
        <mat-option
          *ngFor="let item of filteredItems$ | async"
          [value]="item[propertyToDisplay]"
        >
          {{ item[propertyToDisplay] }}
        </mat-option>
      </mat-autocomplete>
      <mat-error *ngIf="control.errors"> Este campo es obligatorio. </mat-error>
    </mat-form-field>
  `,
})
export class AutocompleteComponent<T> implements OnInit, OnDestroy, OnChanges {
  @Input() control!: FormControl;
  @Input() placeholder: string = 'Buscar'; // Placeholder dinámico
  @Input() propertyToDisplay!: keyof T; // Propiedad a mostrar en la lista
  @Input() action!: any; // Acción NGXS a ejecutar
  @Input() selector!: (state: any) => T[]; // Selector NGXS para obtener los datos
  @Input() initialValue?: T; // Valor inicial preseleccionado
  @Output() itemSelected = new EventEmitter<T>();

  filteredItems$!: Observable<T[]>;
  private destroy$ = new Subject<void>();
  private static initialized = false;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.filteredItems$ = this.control.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap((searchTerm) =>
        this.store
          .dispatch(this.action(searchTerm))
          .pipe(switchMap(() => this.store.select(this.selector))),
      ),
      takeUntil(this.destroy$),
    );
  }

  ngOnChanges(): void {
    // Inicializa el FormControl con el valor inicial (si existe)
    if (this.initialValue) {
      this.control.setValue(this.initialValue[this.propertyToDisplay]);
    }

    // Genera los ítems filtrados basados en los cambios del control
    this.filteredItems$ = this.control.valueChanges.pipe(
      startWith(this.control.value || ''), // Comienza con el valor inicial del control
      debounceTime(300),
      switchMap((searchTerm) =>
        this.store
          .dispatch(this.action(searchTerm))
          .pipe(switchMap(() => this.store.select(this.selector))),
      ),
      map((items: T[]) => {
        // Si hay un valor inicial, asegúrate de que esté incluido en los ítems filtrados
        if (
          this.initialValue &&
          !items.some((item) => item === this.initialValue)
        ) {
          return [this.initialValue, ...items];
        }
        return items;
      }),
      takeUntil(this.destroy$),
    );
  }

  onSelect(selectedValue: string): void {
    const items = this.store.selectSnapshot(this.selector);
    const selectedItem = items.find(
      (item: any) => item[this.propertyToDisplay] === selectedValue,
    );
    if (selectedItem) {
      this.itemSelected.emit(selectedItem);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
