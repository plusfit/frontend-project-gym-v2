import { NgStyle, UpperCasePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { environment } from '../../../../../environments/environment';

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
  @ViewChildren('exerciseList') exerciseLists!: QueryList<
    ElementRef<HTMLUListElement>
  >;
  @ViewChildren('titleText') titleTexts!: QueryList<ElementRef>;

  ngAfterViewInit() {
    this.animationScroll();
    this.initializeTitleScroll();
  }

  animationScroll() {
    this.exerciseLists.forEach((list: ElementRef<HTMLUListElement>) => {
      setInterval(() => {
        const el = list.nativeElement;
        if (el.scrollHeight > el.clientHeight) {
          // Calcular duración basada en el tamaño del contenido
          const scrollDistance = el.scrollHeight - el.clientHeight;
          const scrollDuration = this.calculateScrollDuration(scrollDistance);

          // Scroll hacia abajo con duración proporcional al contenido
          this.smoothScroll(el, scrollDistance, scrollDuration);

          setTimeout(() => {
            // Scroll hacia arriba
            this.smoothScroll(el, 0, environment.config.scrollTimeDown);
          }, scrollDuration + 2000); // Tiempo extra para ver el final
        }
      }, environment.config.scrollTimeDown * 3); // Doble del tiempo para completar ciclo
    });
  }

  // Calcula la duración del scroll basado en la altura del contenido
  calculateScrollDuration(scrollDistance: number): number {
    // Base: 10000ms (10 segundos) por cada 300px de contenido
    const baseRate = 10000 / 300;
    // Mínimo 15 segundos, máximo 60 segundos
    const calculatedDuration = Math.round(scrollDistance * baseRate);
    return Math.max(15000, Math.min(60000, calculatedDuration));
  }

  smoothScroll(element: HTMLElement, to: number, duration: number) {
    const start = element.scrollTop;
    const change = to - start;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      element.scrollTop = start + change * progress;
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
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
  
  initializeTitleScroll() {
    this.titleTexts.forEach((titleElement: ElementRef) => {
      const element = titleElement.nativeElement;
      const container = element.parentElement;
      
      // Verificar si el texto es más ancho que el contenedor
      if (container && element.scrollWidth > container.clientWidth) {
        // Iniciar el scroll después de 1 segundo
        setTimeout(() => {
          this.startTitleScroll(element);
        }, 1000);
      }
    });
  }

  startTitleScroll(element: HTMLElement) {
    const container = element.parentElement;
    if (!container) return;
  
    // Agregar un pequeño buffer para asegurar que se vea todo el texto
    const scrollAmount = element.scrollWidth - container.clientWidth + 30;
  
    // Establecer la variable CSS para mover el texto
    if (scrollAmount > 0) {
      element.style.setProperty('--scroll-amount', `-${scrollAmount}px`);
      const isLongText = element.scrollWidth > container.clientWidth * 1.5;
  
      if (isLongText) {
        element.classList.add('scrolling-long');
      } else {
        element.classList.add('scrolling');
      }
  
      // Reiniciar la animación cada 5 segundos
      setInterval(() => {
        element.classList.remove('scrolling', 'scrolling-long');
        
        setTimeout(() => {
          // Recalcular por si el contenido cambió
          const newScrollAmount = element.scrollWidth - container.clientWidth + 20;
          element.style.setProperty('--scroll-amount', `-${newScrollAmount}px`);
  
          if (isLongText) {
            element.classList.add('scrolling-long');
          } else {
            element.classList.add('scrolling');
          }
        }, 100);
      }, 5000);
    }
  }
  
}
