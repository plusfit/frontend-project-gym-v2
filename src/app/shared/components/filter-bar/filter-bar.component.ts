import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Subject, debounceTime, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { whiteSpaceValidator } from '@core/validators/white-space.validator';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
})
export class FiltersBarComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;
  destroy = new Subject<void>();

  @Output() readonly formValues = new EventEmitter<any>();

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      searchQ: [null, [whiteSpaceValidator]],
    });
  }

  ngOnInit(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500), // Add a debounced time of 500 milliseconds
        takeUntil(this.destroy),
      )
      .subscribe(() => {
        if (this.filterForm.valid) this.formValues.emit(this.filterForm.value);
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  reset(): void {
    this.filterForm.reset();
  }
}
