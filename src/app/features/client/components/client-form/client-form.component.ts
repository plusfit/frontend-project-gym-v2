import { AsyncPipe, Location } from "@angular/common";
import { Component, input, InputSignal, OnChanges, OnDestroy, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { DateAdapter } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { SnackBarService } from "@core/services/snackbar.service";
import { passwordValidator } from "@core/validators/password.validator";
import {
  RegisterClient,
  UpdateAvailableDays,
  UpdateClient,
  ValidateCI,
} from "@features/client/state/clients.actions";
import { ClientsState } from "@features/client/state/clients.state";
import { AssignPlanToUser, GetPlan, GetPlans } from "@features/plans/state/plan.actions";
import { PlansState } from "@features/plans/state/plan.state";
import { Actions, ofActionSuccessful, Store } from "@ngxs/store";
import { Subject, switchMap, takeUntil } from "rxjs";
import { AutocompleteComponent } from "../../../../shared/components/autocomplete/autocomplete.component";
import { InputComponent } from "../../../../shared/components/input/input.component";
import { BtnDirective } from "@shared/directives/btn/btn.directive";
import { Client } from "@features/client/interface/clients.interface";

import { MAT_DATE_FORMATS } from "@angular/material/core";
import { NativeDateAdapter } from "@angular/material/core";
import { Plan } from "@features/plans/interfaces/plan.interface";
import { RecaptchaService } from "@core/services/recaptcha.service";
import {
  ConfirmDialogComponent,
  DialogType,
} from "@shared/components/confirm-dialog/confirm-dialog.component";

export class MyDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: NonNullable<unknown>): string {
    if (displayFormat === "input") {
      const day = this._to2digit(date.getDate());
      const month = this._to2digit(date.getMonth() + 1);
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return date.toDateString();
  }

  private _to2digit(n: number): string {
    return ("00" + n).slice(-2);
  }
}
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: "DD/MM/YYYY",
  },
  display: {
    dateInput: "input", // Usamos el formato "input" definido en el adaptador
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "DD/MM/YYYY",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

@Component({
  selector: "app-client-form",
  standalone: true,
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    InputComponent,
    ReactiveFormsModule,
    MatSelectModule,
    MatRadioModule,
    AutocompleteComponent,
    AsyncPipe,
    BtnDirective,
  ],
  templateUrl: "./client-form.component.html",
  styleUrl: "./client-form.component.css",
})
export class ClientFormComponent implements OnDestroy, OnInit, OnChanges {
  isEdit: InputSignal<boolean> = input<boolean>(false);
  id: InputSignal<string> = input<string>("");
  clientForm!: FormGroup;
  selector = PlansState.getPlans;
  selectedPlan!: Plan;
  dataClient: InputSignal<any> = input<any>({});
  clientData: Client | null = null;

  loading$ = this.store.select(PlansState.isLoading);
  loadingClient$ = this.store.select(ClientsState.isLoading);

  sexs: any[] = [
    { value: "male", viewValue: "Hombre" },
    { value: "female", viewValue: "Mujer" },
    { value: "other", viewValue: "Otros" },
  ];

  bloodPressures: any[] = [
    { value: "high", viewValue: "Alta" },
    { value: "normal", viewValue: "Normal" },
    { value: "low", viewValue: "Baja" },
  ];

  private _destroyed = new Subject<void>();
  showPassword: boolean = false;

  // Available days management
  availableDaysControl = new FormControl<number>(0, [Validators.required, Validators.min(0)]);
  currentAvailableDays: number = 0;
  updatingDays: boolean = false;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private router: Router,
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
    private recaptchaService: RecaptchaService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      identifier: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, passwordValidator(), Validators.minLength(6)]],
      phone: ["", [Validators.required, Validators.pattern("^[0-9]{7,15}$")]],
      dateBirthday: ["", [Validators.required, this.pastDateValidator]],
      address: ["", [Validators.required, Validators.minLength(5)]],
      medicalSociety: ["", [Validators.required]],
      sex: ["", [Validators.required]],
      cardiacHistory: ["", [Validators.required]],
      surgicalHistory: ["", [Validators.required]],
      historyofPathologicalLesions: ["", [Validators.required]],
      bloodPressure: ["", [Validators.required]],
      respiratoryHistory: ["", [Validators.required]],
      plan: ["", [Validators.required]],
      CI: ["", [Validators.required, Validators.pattern("^[0-9]{8,15}$")]],
    });

    // Validar CI solo en modo creación
    if (!this.isEdit()) {
      // Suscribirse a los cambios en el estado de validación
      this.store
        .select(ClientsState.getCIValidation)
        .pipe(takeUntil(this._destroyed))
        .subscribe((validation) => {
          if (validation?.exists) {
            this.showCIExistsDialog(validation.ci);
          }
        });
    }
  }

  private pastDateValidator(control: FormControl): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (inputDate >= today) {
      return { futureDate: "La fecha debe ser anterior a hoy" };
    }
    return null;
  }

  ngOnChanges(): void {
    if (this.isEdit()) {
      // Deshabilitar campos de email y contraseña en modo edición
      this.clientForm.get("identifier")?.disable();
      this.clientForm.get("password")?.disable();

      // Limpiar validadores del campo contraseña ya que estará deshabilitado
      this.clientForm.get("password")?.clearValidators();
      this.clientForm.get("password")?.updateValueAndValidity();

      this.clientData = this.store.selectSnapshot((state) => state.clients.selectedClient);
      if (this.clientData) {
        // Actualizar cada control individualmente con conversión explícita para los radio buttons

        // Campos de texto regulares
        if (this.clientData.name) this.clientForm.get("name")?.setValue(this.clientData.name);
        if (this.clientData.identifier)
          this.clientForm.get("identifier")?.setValue(this.clientData.identifier);
        if (this.clientData.phone) this.clientForm.get("phone")?.setValue(this.clientData.phone);
        if (this.clientData.address)
          this.clientForm.get("address")?.setValue(this.clientData.address);
        if (this.clientData.dateBirthday)
          this.clientForm.get("dateBirthday")?.setValue(this.clientData.dateBirthday);
        if (this.clientData.medicalSociety)
          this.clientForm.get("medicalSociety")?.setValue(this.clientData.medicalSociety);
        if (this.clientData.CI) this.clientForm.get("CI")?.setValue(this.clientData.CI);

        // Campos de selección
        if (this.clientData.sex) {
          this.clientForm.get("sex")?.setValue(this.clientData.sex);
        }

        if (this.clientData.bloodPressure) {
          this.clientForm.get("bloodPressure")?.setValue(this.clientData.bloodPressure);
        }

        // Radio buttons - convertir booleanos a strings explícitamente
        const respiratoryHistoryValue =
          this.clientData.respiratoryHistory === true
            ? "true"
            : this.clientData.respiratoryHistory === false
              ? "false"
              : String(this.clientData.respiratoryHistory || "false");

        const cardiacHistoryValue =
          this.clientData.cardiacHistory === true
            ? "true"
            : this.clientData.cardiacHistory === false
              ? "false"
              : String(this.clientData.cardiacHistory || "false");

        const surgicalHistoryValue =
          this.clientData.surgicalHistory === true
            ? "true"
            : this.clientData.surgicalHistory === false
              ? "false"
              : String(this.clientData.surgicalHistory || "false");

        const historyofPathologicalLesionsValue =
          this.clientData.historyofPathologicalLesions === true
            ? "true"
            : this.clientData.historyofPathologicalLesions === false
              ? "false"
              : String(this.clientData.historyofPathologicalLesions || "false");

        // Asignar valores a los radio buttons
        this.clientForm.get("respiratoryHistory")?.setValue(respiratoryHistoryValue);
        this.clientForm.get("cardiacHistory")?.setValue(cardiacHistoryValue);
        this.clientForm.get("surgicalHistory")?.setValue(surgicalHistoryValue);
        this.clientForm
          .get("historyofPathologicalLesions")
          ?.setValue(historyofPathologicalLesionsValue);

        // Forzar la actualización de todos los controles
        this.clientForm.updateValueAndValidity();

        // Inicializar días disponibles si estamos en modo edición
        if (this.isEdit()) {
          this.currentAvailableDays = (this.clientData as any).availableDays || 0;
          this.availableDaysControl.setValue(this.currentAvailableDays);
        }
      }

      this.store.dispatch(new GetPlan(this.clientData?.planId ?? ""));
      this.actions
        .pipe(
          ofActionSuccessful(GetPlan), // Detecta cuando GetPlan se ejecuta correctamente
          takeUntil(this._destroyed), // Asegura la limpieza cuando el componente se destruya
          switchMap(
            () => this.store.selectOnce(PlansState.getSelectedPlan), // Obtiene el estado actualizado una vez
          ),
        )
        .subscribe((plan) => {
          if (plan) {
            this.selectedPlan = plan; // Asigna el plan seleccionado
            this.clientForm.get("plan")?.setValue(plan.name); // Establece el nombre del plan en el formulario
          }
        });
    }
  }

  registerClient() {
    if (this.clientForm.valid) {
      const userInfo = {
        name: this.clientForm.get("name")?.value,
        password: this.clientForm.get("password")?.value,
        phone: this.clientForm.get("phone")?.value,
        identifier: this.clientForm.get("identifier")?.value,
        address: this.clientForm.get("address")?.value,
        dateBirthday: this.clientForm.get("dateBirthday")?.value,
        medicalSociety: this.clientForm.get("medicalSociety")?.value,
        sex: this.clientForm.get("sex")?.value,
        cardiacHistory: this.clientForm.get("cardiacHistory")?.value,
        surgicalHistory: this.clientForm.get("surgicalHistory")?.value,
        historyofPathologicalLesions: this.clientForm.get("historyofPathologicalLesions")?.value,
        bloodPressure: this.clientForm.get("bloodPressure")?.value,
        CI: this.clientForm.get("CI")?.value,
        respiratoryHistory: this.clientForm.get("respiratoryHistory")?.value,
      };

      if (this.isEdit()) {
        if (!this.selectedPlan._id || !this.selectedPlan) {
          this.snackbar.showError("Error", "El plan seleccionado no es válido");
          return;
        }

        // En modo edición, excluir password e identifier del userInfo ya que están deshabilitados
        const { password, identifier, ...editUserInfo } = userInfo;

        this.store.dispatch(new UpdateClient(this.id(), editUserInfo));
        this.actions
          .pipe(ofActionSuccessful(UpdateClient), takeUntil(this._destroyed))
          .subscribe(() => {
            if (this.selectedPlan) {
              this.store.dispatch(new AssignPlanToUser(this.selectedPlan._id, this.id()));
              this.actions
                .pipe(ofActionSuccessful(AssignPlanToUser), takeUntil(this._destroyed))
                .subscribe(() => {
                  this.snackbar.showSuccess("Exito", "Cliente actualizado con correctamente");
                  this.clientForm.reset();
                  this.router.navigate(["/clientes"]);
                });
            }
          });
      } else {
        if (!this.selectedPlan) {
          this.snackbar.showError("Error", "El plan seleccionado no es válido");
          return;
        }

        // Validar CI antes de proceder con el registro usando el state
        const ci = this.clientForm.get("CI")?.value;
        if (ci && /^[0-9]{8,15}$/.test(ci)) {
          this.store.dispatch(new ValidateCI(ci));

          this.actions
            .pipe(ofActionSuccessful(ValidateCI), takeUntil(this._destroyed))
            .subscribe(() => {
              const validation = this.store.selectSnapshot(ClientsState.getCIValidation);

              if (validation?.exists) {
                // CI ya existe, mostrar diálogo y detener el registro
                this.showCIExistsDialog(ci);
                return;
              }

              // CI no existe, proceder con el registro
              this.proceedWithRegistration(userInfo);
            });
        } else {
          // Si el CI no tiene formato válido, proceder con el registro
          this.proceedWithRegistration(userInfo);
        }
      }
    }
  }

  private proceedWithRegistration(userInfo: any): void {
    // Ejecutar reCAPTCHA v3 antes de registrar el cliente
    this.recaptchaService.executeRecaptcha("register").subscribe({
      next: (recaptchaToken: string) => {
        const dataRegister = {
          identifier: this.clientForm.get("identifier")?.value,
          password: this.clientForm.get("password")?.value,
          recaptchaToken,
        };
        this.store.dispatch(new RegisterClient(dataRegister));
        this.actions
          .pipe(ofActionSuccessful(RegisterClient), takeUntil(this._destroyed))
          .subscribe(() => {
            const registerClient = this.store.selectSnapshot(ClientsState.getRegisterClient);
            this.store.dispatch(new UpdateClient(registerClient._id, userInfo));
            this.actions
              .pipe(ofActionSuccessful(UpdateClient), takeUntil(this._destroyed))
              .subscribe(() => {
                if (this.selectedPlan) {
                  this.store.dispatch(
                    new AssignPlanToUser(this.selectedPlan._id, registerClient._id),
                  );
                  this.actions
                    .pipe(ofActionSuccessful(AssignPlanToUser), takeUntil(this._destroyed))
                    .subscribe(() => {
                      this.snackbar.showSuccess(
                        "Exito",
                        "Cliente registrado con correctamente",
                      );
                      this.clientForm.reset();
                      this.router.navigate(["/clientes"]);
                    });
                }
              });
          });
      },
      error: (error) => {
        console.error("Error al ejecutar reCAPTCHA:", error);
        this.snackbar.showError(
          "Error de verificación",
          "No se pudo verificar que eres humano. Inténtalo de nuevo.",
        );
      },
    });
  }

  action(searchTerm: string): GetPlans {
    return new GetPlans({ page: 1, pageSize: 10, searchQ: searchTerm });
  }

  onPlanSelected(plan: any): void {
    this.selectedPlan = plan;
  }

  cancel() {
    this.location.back();
  }

  get nameControl(): FormControl {
    return this.clientForm.get("name") as FormControl;
  }
  get identifierControl(): FormControl {
    return this.clientForm.get("identifier") as FormControl;
  }

  get CIControl(): FormControl {
    return this.clientForm.get("CI") as FormControl;
  }

  get passwordControl(): FormControl {
    return this.clientForm.get("password") as FormControl;
  }
  get addressControl(): FormControl {
    return this.clientForm.get("address") as FormControl;
  }
  get medicalSocietyControl(): FormControl {
    return this.clientForm.get("medicalSociety") as FormControl;
  }
  get cardiacHistoryControl(): FormControl {
    return this.clientForm.get("cardiacHistory") as FormControl;
  }

  get respiratoryHistoryInputControl(): FormControl {
    return this.clientForm.get("respiratoryHistoryInput") as FormControl;
  }
  get bloodPressureControl(): FormControl {
    return this.clientForm.get("bloodPressure") as FormControl;
  }
  get respiratoryHistoryControl(): FormControl {
    return this.clientForm.get("respiratoryHistory") as FormControl;
  }

  get cardiacHistoryInputControl(): FormControl {
    return this.clientForm.get("cardiacHistoryInput") as FormControl;
  }

  get phoneControl(): FormControl {
    return this.clientForm.get("phone") as FormControl;
  }

  get planControl(): FormControl {
    return this.clientForm.get("plan") as FormControl;
  }

  get sexControl(): FormControl {
    return this.clientForm.get("sex") as FormControl;
  }

  get surgicalHistoryControl(): FormControl {
    return this.clientForm.get("surgicalHistory") as FormControl;
  }

  get historyofPathologicalLesionsControl(): FormControl {
    return this.clientForm.get("historyofPathologicalLesions") as FormControl;
  }

  get dateBirthdayControl(): FormControl {
    return this.clientForm.get("dateBirthday") as FormControl;
  }

  private showCIExistsDialog(ci: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "500px",
      data: {
        title: "Cliente Existente",
        contentMessage: `Ya existe un cliente registrado con la cédula ${ci}.`,
        type: DialogType.GENERAL,
        icon: "ph-warning",
        iconColor: "orange",
        confirmButtonText: "Entendido",
      },
    });

    // Limpiar el campo CI cuando el usuario cierra el diálogo
    dialogRef.afterClosed().subscribe(() => {
      this.clientForm.get("CI")?.setValue("");
      this.clientForm.get("CI")?.markAsTouched();
    });
  }

  updateAvailableDays(): void {
    if (this.availableDaysControl.valid && this.id()) {
      const newDays = this.availableDaysControl.value;

      if (newDays !== null && newDays !== undefined) {
        this.updatingDays = true;

        this.store.dispatch(new UpdateAvailableDays(this.id(), newDays));

        this.actions
          .pipe(ofActionSuccessful(UpdateAvailableDays), takeUntil(this._destroyed))
          .subscribe(() => {
            this.updatingDays = false;
            this.currentAvailableDays = newDays;
            // Limpiar el campo después de la actualización exitosa
            this.availableDaysControl.setValue(newDays);
          });
      }
    }
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
