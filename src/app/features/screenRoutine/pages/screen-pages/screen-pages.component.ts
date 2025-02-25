import { Component, OnInit } from '@angular/core';
import { GetScreenRoutinesByPage } from '@features/screenRoutine/state/screenRoutine.actions';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-screen-pages',
  standalone: true,
  imports: [],
  templateUrl: './screen-pages.component.html',
  styleUrl: './screen-pages.component.css',
})
export class ScreenPagesComponent implements OnInit {
  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(
      new GetScreenRoutinesByPage({ page: 1, limit: 10, isGeneral: true }),
    );
  }
}
