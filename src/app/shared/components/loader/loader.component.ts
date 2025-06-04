import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
  standalone: true,
  imports: [NgClass],
})
export class LoaderComponent {
  @Input() text!: string;
  @Input() size: string = 'text-3xl';
}
