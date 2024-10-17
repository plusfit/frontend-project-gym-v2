import { Component, Inject } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { ESeverity, SeverityIcon } from '@shared/enums/severity.enum';
import { SnackBar } from '@shared/interfaces/snackbar.interface';
import { NgClass } from '@angular/common';

/**
 * The SnackBarComponent displays a snackbar with a message and an icon based on the specified severity level.
 */
@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
  standalone: true,
  imports: [NgClass],
})
export class SnackBarComponent {
  /**
   * The severity of the snackbar.
   */
  severity: typeof ESeverity = ESeverity;
  /**
   * The CSS class for the severity of the snackbar.
   */
  severityClass = `alert-${this.severity.INFO}`;
  /**
   * The icon for the severity of the snackbar.
   */
  icon = '';

  /**
   * Creates an instance of the SnackBarComponent class.
   * @param {MAT_SNACK_BAR_DATA} data - The data for the snackbar.
   * @param {MatSnackBarRef<SnackBarComponent>} snackRef - The reference to the snackbar.
   */
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackBar,
    private snackRef: MatSnackBarRef<SnackBarComponent>,
  ) {
    this.severityClass = `alert-${data.severity}`;
    this.icon = SeverityIcon[data.severity];
  }

  /**
   * Closes the snackbar.
   */
  close(): void {
    this.snackRef.dismiss();
  }
}
