import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../../interfaces/organization.interface';

@Component({
  selector: 'app-organization-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './organization-form.component.html',
  styleUrl: './organization-form.component.css',
})
export class OrganizationFormComponent implements OnInit {
  @Input() organization: Organization | null = null;
  @Input() isEditing = false;
  @Output() formSubmit = new EventEmitter<
    CreateOrganizationDto | UpdateOrganizationDto
  >();
  @Output() formCancel = new EventEmitter<void>();

  organizationForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.organizationForm = this.fb.group({
      name: [
        this.organization?.name || '',
        [Validators.required, Validators.minLength(2)],
      ],
      slug: [
        this.organization?.slug || '',
        [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)],
      ],
      description: [this.organization?.description || ''],
      isActive: [this.organization?.isActive ?? true],
    });

    if (this.isEditing && this.organization) {
      this.organizationForm.patchValue({
        name: this.organization.name,
        slug: this.organization.slug,
        description: this.organization.description,
        isActive: this.organization.isActive,
      });
    }
  }

  onSubmit(): void {
    if (this.organizationForm.valid) {
      const formValue = this.organizationForm.value;

      if (this.isEditing) {
        const updateData: UpdateOrganizationDto = {
          name: formValue.name,
          slug: formValue.slug,
          description: formValue.description,
          isActive: formValue.isActive,
        };
        this.formSubmit.emit(updateData);
      } else {
        const createData: CreateOrganizationDto = {
          name: formValue.name,
          slug: formValue.slug,
          description: formValue.description,
        };
        this.formSubmit.emit(createData);
      }
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  generateSlug(): void {
    const name = this.organizationForm.get('name')?.value;
    if (name?.trim()) {
      // Función para normalizar caracteres especiales y acentos
      const normalizeString = (str: string): string => {
        return str
          .normalize('NFD') // Descompone caracteres acentuados
          .replace(/\u0300-\u036f/g, '') // Elimina diacríticos
          .replace(/[ñÑ]/g, 'n') // Convierte ñ a n
          .replace(/[çÇ]/g, 'c'); // Convierte ç a c
      };

      const slug = normalizeString(name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
        .replace(/\s+/g, '-') // Reemplaza espacios con guiones
        .replace(/-+/g, '-') // Elimina guiones múltiples
        .replace(/^-+|-+$/g, ''); // Elimina guiones al inicio y final

      this.organizationForm.patchValue({ slug });

      // Mostrar feedback visual de que se generó el slug
      const slugControl = this.organizationForm.get('slug');
      slugControl?.markAsTouched();
    }
  }

  get nameControl() {
    return this.organizationForm.get('name');
  }

  get slugControl() {
    return this.organizationForm.get('slug');
  }

  get descriptionControl() {
    return this.organizationForm.get('description');
  }

  get isActiveControl() {
    return this.organizationForm.get('isActive');
  }
}
