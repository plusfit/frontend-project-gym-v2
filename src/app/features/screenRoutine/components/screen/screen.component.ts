import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ScreenRoutineState } from '@features/screenRoutine/state/screenRoutine.state';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { CardRoutineComponent } from '../card-routine/card-routine.component';

@Component({
  selector: 'app-screen',
  standalone: true,
  imports: [CardRoutineComponent],
  templateUrl: './screen.component.html',
  styleUrl: './screen.component.css',
})
export class ScreenComponent implements OnInit, OnChanges {
  @Input() routines: any[] = [];
  routines$: Observable<any> = this.store.select(
    ScreenRoutineState.screenRoutines,
  );

  menRoutines: any[] = [];
  womenRoutines: any[] = [];
  cardioRoutines: any[] = [];

  logos = ['logo-white.png', 'logo-white.png', 'logo6.png'];

  constructor(private store: Store) {}

  ngOnInit() {
    this.menRoutines = this.routines.filter((r) => r.type === 'men');
    this.womenRoutines = this.routines.filter((r) => r.type === 'women');
    this.cardioRoutines = this.routines.filter((r) => r.type === 'cardio');
  }

  ngOnChanges(): void {
    if (this.routines.length) {
      console.log('routine', this.routines);

      this.menRoutines = this.routines.filter((r) => r.type === 'men');
      this.womenRoutines = this.routines.filter((r) => r.type === 'women');
      this.cardioRoutines = this.routines.filter((r) => r.type === 'cardio');
      console.log('menRoutines', this.menRoutines);
      console.log('womenRoutines', this.womenRoutines);
      console.log('cardioRoutines', this.cardioRoutines);
    }
  }
}
