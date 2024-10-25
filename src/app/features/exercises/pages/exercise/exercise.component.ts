import { Component } from '@angular/core';
import { ExerciseTableComponent } from '../../components/exercise-table/exercise-table.component';
@Component({
  selector: 'app-exercise',
  standalone: true,
  imports: [ExerciseTableComponent],
  templateUrl: './exercise.component.html',
  styleUrl: './exercise.component.css',
})
export class ExerciseComponent {}
