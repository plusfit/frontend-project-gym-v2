import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Exercise } from '../../interfaces/exercise.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-exercise-table',
  styleUrls: ['./exercise-table.component.css'],
  templateUrl: './exercise-table.component.html',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class ExerciseTableComponent implements AfterViewInit {
  displayedColumns: string[] = ['name', 'description', 'mode', 'options'];
  dataSource = new MatTableDataSource<Exercise>(ELEMENT_DATA);
  searchValue: string = '';
  selectedMode: string = '';
  selectedType: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event): void {
    this.searchValue = (event.target as HTMLInputElement).value;
    this.updateFilter();
  }

  clearSearch(): void {
    this.searchValue = '';
    this.updateFilter();
  }

  updateFilter(): void {
    this.dataSource.filter = Math.random().toString();
  }

  editExercise(exercise: Exercise) {
    console.log('Editando ejercicio:', exercise);
  }

  deleteExercise(exercise: Exercise) {
    console.log('Borrando ejercicio:', exercise);
  }
}

const ELEMENT_DATA: Exercise[] = [
  {
    _id: { $oid: '66ca240231fb5c8e33281e58' },
    name: 'Pecho en banco plano',
    description: 'Ejercicio de pecho en banco plano con barra.',
    gifUrl: 'https://example.com/pecho-plano.gif',
    type: 'reps',
    mode: 'room',
    reps: 12,
    series: 4,
    restTime: 90,
    updatedAt: { $date: '2024-08-24T18:18:42.600Z' },
    createdAt: { $date: '2024-08-24T18:18:42.600Z' },
    __v: 0,
  },
  {
    _id: { $oid: '66ca325152b46253da7e8acf' },
    name: 'Pecho inclinado',
    description: 'Ejercicio de pecho en banco inclinado con mancuernas.',
    gifUrl: 'https://example.com/pecho-inclinado.gif',
    type: 'reps',
    mode: 'room',
    reps: 10,
    series: 3,
    restTime: 90,
    updatedAt: { $date: '2024-08-24T19:19:45.287Z' },
    createdAt: { $date: '2024-08-24T19:19:45.287Z' },
    __v: 0,
  },
  {
    _id: { $oid: '66ca325a52b46253da7e8ad1' },
    name: 'Sentadillas',
    description: 'Sentadillas con barra para trabajar piernas.',
    gifUrl: 'https://example.com/sentadillas.gif',
    type: 'reps',
    mode: 'room',
    reps: 15,
    series: 4,
    restTime: 60,
    updatedAt: { $date: '2024-08-24T19:19:54.190Z' },
    createdAt: { $date: '2024-08-24T19:19:54.190Z' },
    __v: 0,
  },
  {
    _id: { $oid: '66ca326452b46253da7e8ad3' },
    name: 'Elevaciones laterales',
    description: 'Elevaciones laterales con mancuernas para hombros.',
    gifUrl: 'https://example.com/elevaciones-laterales.gif',
    type: 'reps',
    mode: 'room',
    reps: 12,
    series: 3,
    restTime: 45,
    updatedAt: { $date: '2024-08-24T19:20:04.357Z' },
    createdAt: { $date: '2024-08-24T19:20:04.357Z' },
    __v: 0,
  },
  {
    _id: { $oid: '66ca326a52b46253da7e8ad5' },
    name: 'Abdominales',
    description: 'Ejercicio básico de abdominales en el suelo.',
    gifUrl: 'https://example.com/abdominales.gif',
    type: 'reps',
    mode: 'cardio',
    reps: 20,
    series: 4,
    restTime: 30,
    updatedAt: { $date: '2024-08-24T19:20:10.459Z' },
    createdAt: { $date: '2024-08-24T19:20:10.459Z' },
    __v: 0,
  },
  {
    _id: { $oid: '66ca327b52b46253da7e8ad6' },
    name: 'Press militar',
    description: 'Ejercicio para hombros con barra en press militar.',
    gifUrl: 'https://example.com/press-militar.gif',
    type: 'reps',
    mode: 'room',
    reps: 10,
    series: 3,
    restTime: 60,
    updatedAt: { $date: '2024-08-24T19:21:12.460Z' },
    createdAt: { $date: '2024-08-24T19:21:12.460Z' },
    __v: 0,
  },
  {
    _id: { $oid: '66ca328c52b46253da7e8ad7' },
    name: 'Flexiones de brazo',
    description: 'Flexiones de pecho en el suelo.',
    gifUrl: 'https://example.com/flexiones.gif',
    type: 'reps',
    mode: 'cardio',
    reps: 20,
    series: 3,
    restTime: 45,
    updatedAt: { $date: '2024-08-24T19:22:13.460Z' },
    createdAt: { $date: '2024-08-24T19:22:13.460Z' },
    __v: 0,
  },
  {
    _id: { $oid: '66ca329e52b46253da7e8ad8' },
    name: 'Elevaciones de talones',
    description: 'Elevaciones de talones para fortalecer pantorrillas.',
    gifUrl: 'https://example.com/elevacion-talones.gif',
    type: 'reps',
    mode: 'room',
    reps: 15,
    series: 4,
    restTime: 45,
    updatedAt: { $date: '2024-08-24T19:23:14.460Z' },
    createdAt: { $date: '2024-08-24T19:23:14.460Z' },
    __v: 0,
  },
  {
    _id: { $oid: '66ca32b152b46253da7e8ad9' },
    name: 'Angelitos',
    description: 'Ejercicio de coordinación y cardio tipo jumping jacks.',
    gifUrl: 'https://example.com/angelitos.gif',
    type: 'minReps',
    mode: 'cardio',
    minutes: 3,
    restTime: 60,
    updatedAt: { $date: '2024-08-24T19:24:15.460Z' },
    createdAt: { $date: '2024-08-24T19:24:15.460Z' },
    __v: 0,
  },
  {
    _id: { $oid: '66ca32c452b46253da7e8ada' },
    name: 'Zancadas',
    description: 'Zancadas con mancuernas para piernas.',
    gifUrl: 'https://example.com/zancadas.gif',
    type: 'reps',
    mode: 'room',
    reps: 12,
    series: 3,
    restTime: 45,
    updatedAt: { $date: '2024-08-24T19:25:16.460Z' },
    createdAt: { $date: '2024-08-24T19:25:16.460Z' },
    __v: 0,
  },
  {
    _id: { $oid: '66ca32d752b46253da7e8adb' },
    name: 'Press de pierna',
    description: 'Ejercicio de pierna en máquina de press.',
    gifUrl: 'https://example.com/press-pierna.gif',
    type: 'reps',
    mode: 'room',
    reps: 10,
    series: 4,
    restTime: 90,
    updatedAt: { $date: '2024-08-24T19:26:17.460Z' },
    createdAt: { $date: '2024-08-24T19:26:17.460Z' },
    __v: 0,
  },
  {
    _id: { $oid: '66ca32e952b46253da7e8adc' },
    name: 'Sissors Jumps',
    description: 'Ejercicio de saltos cruzados para piernas y coordinación.',
    gifUrl: 'https://example.com/scissors-jumps.gif',
    type: 'minReps',
    mode: 'cardio',
    minutes: 2,
    restTime: 45,
    updatedAt: { $date: '2024-08-24T19:27:18.460Z' },
    createdAt: { $date: '2024-08-24T19:27:18.460Z' },
    __v: 0,
  },
  {
    _id: { $oid: '66ca32fa52b46253da7e8add' },
    name: 'Remo en máquina',
    description: 'Ejercicio de remo en máquina para espalda.',
    gifUrl: 'https://example.com/remo.gif',
    type: 'reps',
    mode: 'room',
    reps: 15,
    series: 3,
    restTime: 60,
    updatedAt: { $date: '2024-08-24T19:28:19.460Z' },
    createdAt: { $date: '2024-08-24T19:28:19.460Z' },
    __v: 0,
  },
  {
    _id: { $oid: '66ca331e52b46253da7e8ade' },
    name: 'Elíptica',
    description: 'Entrenamiento de resistencia en elíptica.',
    gifUrl: 'https://example.com/eliptica.gif',
    type: 'minReps',
    mode: 'room',
    minutes: 20,
    restTime: 5,
    updatedAt: { $date: '2024-08-24T19:29:20.460Z' },
    createdAt: { $date: '2024-08-24T19:29:20.460Z' },
    __v: 0,
  },
  {
    _id: { $oid: '66ca332f52b46253da7e8adf' },
    name: 'Plancha',
    description: 'Plancha abdominal para fortalecer el core.',
    gifUrl: 'https://example.com/plancha.gif',
    type: 'reps',
    mode: 'cardio',
    minutes: 60,
    series: 3,
    restTime: 30,
    updatedAt: { $date: '2024-08-24T19:30:21.460Z' },
    createdAt: { $date: '2024-08-24T19:30:21.460Z' },
    __v: 0,
  },
];
