import { Component } from '@angular/core';
import { TitleComponent } from '../../../../shared/components/title/title.component';
import { ClientFormComponent } from '../../components/client-form/client-form.component';

@Component({
  selector: 'app-add-client-page',
  standalone: true,
  imports: [TitleComponent, ClientFormComponent],
  templateUrl: './add-client-page.component.html',
  styleUrl: './add-client-page.component.css',
})
export class AddClientPageComponent {
  title: string = 'Agregar Cliente';
}
