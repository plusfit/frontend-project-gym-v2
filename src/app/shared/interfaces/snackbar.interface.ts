import { ESeverity } from '@shared/enums/severity.enum';

/**
 * @ignore
 */
export interface SnackBar {
  title: string;
  message: string;
  severity: ESeverity;
}
