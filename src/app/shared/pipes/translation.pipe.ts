import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "translation",
  standalone: true,
})
export class TranslationPipe implements PipeTransform {
  constructor() {}

  transform(value: string): string {
    if (value && value.includes(".")) {
      value = value.split(".")[1];
    }

    switch (value) {
      // Standard fields
      case "name":
        return "Nombre";
      case "CI":
        return "Cédula de Identidad";
      case "address":
        return "Dirección";
      case "lastName":
        return "Apellido";
      case "isActive":
        return "Estado";
      case "description":
        return "Descripción";
      case "mode":
        return "Modo";
      case "type":
        return "Tipo";
      case "sexType":
        return "Género";
      case "createdAt":
        return "Creado";
      case "updatedAt":
        return "Actualizado";
      case "category":
        return "Categoría";
      case "isCustom":
        return "Personalizada";
      case "days":
        return "Días";
      case "day":
        return "Día";
      case "checkbox":
        return "Seleccionar";
      case "room":
        return "Sala";
      case "cardio":
        return "Cardio";

      // Gym Access History fields
      case "accessDate":
        return "Fecha de Acceso";
      case "clientName":
        return "Nombre del Cliente";
      case "cedula":
        return "Cédula";
      case "successful":
        return "Resultado Ingreso";
      case "reason":
        return "Motivo";
      case "acciones":
        return "Acciones";
      case "lastAccess":
        return "Último Acceso";
      case "totalAccesses":
        return "Total Accesos";

      // Rewards fields
      case "pointsRequired":
        return "Puntos Requeridos";
      case "totalExchanges":
        return "Total Canjes";
      case "enabled":
        return "Habilitado";

      // Categorías del Plan
      case "weightLoss":
        return "Pérdida de peso";
      case "muscleGain":
        return "Ganar músculo";
      case "endurance":
        return "Resistencia";
      case "generalWellness":
        return "Bienestar general";
      case "flexibility":
        return "Flexibilidad";
      case "strengthTraining":
        return "Entrenamiento de fuerza";

      // Objetivos del Plan
      case "loseWeight":
        return "Perder peso";
      case "buildMuscle":
        return "Ganar músculo";
      case "improveCardio":
        return "Mejorar cardio";
      case "increaseFlexibility":
        return "Aumentar flexibilidad";
      case "generalFitness":
        return "Estado físico general";
      case "beginner":
        return "Principiante";
      case "intermediate":
        return "Intermedio";
      case "advanced":
        return "Avanzado";
      case "mix":
        return "Mixto";
      case "mixed":
        return "Mixto";
      case "female":
        return "Mujer";
      case "male":
        return "Hombre";
      case "high":
        return "Alta";
      case "low":
        return "Baja";
      case "normal":
        return "Normal";
      case "other":
        return "Otros";
      default:
        return value;
    }
  }
}
