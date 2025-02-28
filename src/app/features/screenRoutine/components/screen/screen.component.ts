import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ScreenRoutineState } from '@features/screenRoutine/state/screenRoutine.state';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-screen',
  standalone: true,
  imports: [JsonPipe, AsyncPipe],
  templateUrl: './screen.component.html',
  styleUrl: './screen.component.css',
})
export class ScreenComponent {
  routines$: Observable<any> = this.store.select(
    ScreenRoutineState.screenRoutines,
  );
  constructor(private store: Store) {}
}
