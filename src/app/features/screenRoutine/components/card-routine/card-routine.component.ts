import { NgStyle } from '@angular/common';
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
  imports: [NgStyle],
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
      textElement.nativeElement.classList.remove(
        'slide-fade-effect-left',
        'slide-fade-effect-right',
      );
    });

    // Aplicar la animación a todos los ejercicios al mismo tiempo
    exerciseElements.forEach((textElement, index) => {
      setTimeout(() => {
        // Alternar animación entre izquierda y derecha
        if (index % 2 === 0) {
          // Si el índice es par, el texto viene de la izquierda
          textElement.nativeElement.classList.add('slide-fade-effect-left');
        } else {
          // Si el índice es impar, el texto viene de la derecha
          textElement.nativeElement.classList.add('slide-fade-effect-right');
        }
      }, 0); // Todos los ejercicios comienzan al mismo tiempo (sin delay)
    });
  }
}
