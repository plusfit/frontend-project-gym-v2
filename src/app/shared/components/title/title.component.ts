import { Component, Input } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-title',
  standalone: true,
  imports: [MatDivider, NgClass],
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.css'],
})
export class TitleComponent {
  //TODO:
  @Input() title!: string;
  @Input() divider = true;
  @Input() gradient = true;
}
