import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "utcDate",
  standalone: true,
})
export class UtcDatePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return "";
    }

    // Si es una fecha ISO completa, extraemos la hora y fecha directamente del string
    if (value.includes("T") && value.includes(":")) {
      // Formato: 2025-08-30T12:24:27.153Z
      const [datePart, timePart] = value.split("T");
      const [year, month, day] = datePart.split("-");
      const timeOnly = timePart.split(":");

      const hours = Number.parseInt(timeOnly[0]);
      const minutes = Number.parseInt(timeOnly[1]);

      // Formato 24 horas
      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");

      return `${day}/${month}/${year}, ${formattedHours}:${formattedMinutes}`;
    }

    // Si no es una fecha ISO, devolverla tal como está
    return value;
  }
}
