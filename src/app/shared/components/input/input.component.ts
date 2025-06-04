import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormControl,
  FormGroupDirective,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FieldValidationErrorMessages,
  ValidationErrorsPipe,
} from '@shared/pipes/validation-errors.pipe';

import {MatIconButton} from "@angular/material/button";

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    ValidationErrorsPipe,
    MatIconButton
],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
})
export class InputComponent implements OnInit {
  @Input() control!: FormControl; // FormControl pasado desde el padre
  @Input() label: string = 'Input'; // Etiqueta predeterminada
  @Input() type: string = 'text'; // Tipo de entrada (solo se usa si no es password)
  @Input() placeholder: string = ''; // Placeholder opcional
  @Input() appearance: 'fill' | 'outline' = 'outline'; // Apariencia del campo
  @Input() errorKey!: string; // Clave específica para mensajes de error

  // Nuevo flag para indicar que se trata de un campo de contraseña
  @Input() isPasswordField: boolean = false;

  @Output() valueChange = new EventEmitter<any>();

  matcher = new MyErrorStateMatcher();

  // Estado local para alternar visibilidad del password
  isPasswordVisible: boolean = false;

  ngOnInit() {
    if (!this.control) {
      throw new Error('El atributo "control" es obligatorio.');
    }
  }

  onInputChange(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.control.setValue(
      this.type === 'number' ? Number(inputValue) : inputValue,
    );
    this.valueChange.emit(this.control.value);
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
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
      required: 'La descripción es obligatoria',
    },
  };
}
