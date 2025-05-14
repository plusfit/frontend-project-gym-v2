import { NgStyle, UpperCasePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChildren,
} from '@angular/core';

@Component({
  selector: 'app-card-routine',
  standalone: true,
  imports: [NgStyle, UpperCasePipe],
  templateUrl: './card-routine.component.html',
  styleUrls: ['./card-routine.component.css'],
})
export class CardRoutineComponent implements AfterViewInit {
  @Input() routine: any;
  @Input() backgroundColor: string | undefined;
  @Input() animationDelay: number = 0; // Este delay ya no es necesario si se hace todo al mismo tiempo
  @ViewChildren('exerciseText') exerciseTexts!: QueryList<ElementRef>;

  ngAfterViewInit() {
    // Iniciar la animación cada 1 minuto
    this.startRepeatingAnimation();
  }

  getAnimationDelay(index: number): string {
    const delay = index * 100; // 100ms entre cada uno
    return `${delay}ms`;
  }

  startRepeatingAnimation() {
    // Llamar a la animación cada 1 minuto (60000 ms)
    setInterval(() => {
      this.applyAnimation();
    }, 60000); // 1 minuto
  }

  applyAnimation() {
    const exerciseElements = this.exerciseTexts.toArray();

    // Reiniciar la animación: Primero, eliminar las clases de animación
    exerciseElements.forEach((textElement) => {
      textElement.nativeElement.classList.remove('slide-fade-effect');
    });

    // Aplicar la animación a todos los ejercicios al mismo tiempo
    exerciseElements.forEach((textElement) => {
      setTimeout(() => {
        textElement.nativeElement.classList.add('slide-fade-effect');
      }, 0); // Todos los ejercicios comienzan al mismo tiempo (sin delay)
    });
  }
}
