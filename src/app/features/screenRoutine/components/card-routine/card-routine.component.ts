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
  styleUrl: './card-routine.component.css',
})
export class CardRoutineComponent implements AfterViewInit {
  @Input() routine: any;
  @Input() backgroundColor: string | undefined;
  @ViewChildren('exerciseText') exerciseTexts!: QueryList<ElementRef>;

  ngAfterViewInit() {
    setInterval(() => {
      this.applyAnimation();
    }, 60000);
  }

  applyAnimation() {
    this.exerciseTexts.forEach((textElement, index) => {
      const element = textElement.nativeElement;
      element.style.animationDelay = `${index * 0.5}s`; // Retraso progresivo
      element.classList.add('slide-text'); // Aplica la animación
    });
  }
}
