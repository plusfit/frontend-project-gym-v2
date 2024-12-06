import { Component, Input, output } from '@angular/core';
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
  //list: InputSignal<any[]> = input<any[]>([]);
  @Input() list: any[] = [];
  listEmitter = output<any[]>();

  drop(event: CdkDragDrop<string[]>) {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    const updatedList = [...this.list];

    const temp = updatedList[previousIndex];
    updatedList[previousIndex] = updatedList[currentIndex];
    updatedList[currentIndex] = temp;

    this.list = updatedList;
    this.listEmitter.emit(updatedList);
  }
}
