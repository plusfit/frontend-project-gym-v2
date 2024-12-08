import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FieldValidationErrorMessages,
  ValidationErrorsPipe,
} from '@shared/pipes/validation-errors.pipe';
import { MyErrorStateMatcher } from '../input/input.component';

@Component({
  selector: 'app-text-area',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    ValidationErrorsPipe,
  ],
  templateUrl: './text-area.component.html',
  styleUrl: './text-area.component.css',
})
export class TextAreaComponent implements OnInit {
  @Input() control!: FormControl; // FormControl pasado desde el padre
  @Input() label: string = 'Input'; // Etiqueta predeterminada
  @Input() type: string = 'text'; // Tipo de entrada
  @Input() placeholder: string = ''; // Placeholder opcional
  @Input() appearance: 'fill' | 'outline' = 'outline'; // Apariencia del campo
  @Input() errorKey!: string; // Clave específica para mensajes de error

  matcher = new MyErrorStateMatcher();

  ngOnInit() {
    if (!this.control) {
      throw new Error('El atributo "control" es obligatorio.');
    }
  }

  protected errorMessages: FieldValidationErrorMessages = {
    name: {
      required: 'Por favor ingrese el nombre',
    },
    email: {
      required: 'Por favor ingrese el correo electrónico',
      email: 'El correo electrónico no es válido',
    },
    address: {
      required: 'Por favor ingrese la dirección',
    },
    maxCount: {
      required: 'El campo cantidad es obligatorio',
    },
    description: {
      required: 'Por favor ingrese la descripción',
    },
  };
}
