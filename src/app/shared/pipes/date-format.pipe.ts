import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "dateFormat",
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | null): string {
    if (!value) return "";

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
