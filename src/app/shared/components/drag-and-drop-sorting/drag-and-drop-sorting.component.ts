import { Component, input, InputSignal, output } from '@angular/core';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-drag-and-drop-sorting',
  standalone: true,
  imports: [CdkDropList, CdkDrag],
  templateUrl: './drag-and-drop-sorting.component.html',
  styleUrl: './drag-and-drop-sorting.component.css',
})
export class DragAndDropSortingComponent {
  list: InputSignal<any[]> = input<any[]>([]);
  listEmitter = output<any[]>();

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.list(), event.previousIndex, event.currentIndex);
    this.listEmitter.emit(this.list());
  }
}
