/**
 * The ESeverity enum represents the available severity options for messages.
 */
export enum ESeverity {
  /**
   * The info severity option for messages.
   */
  'INFO' = 'info',
  /**
   * The success severity option for messages.
   */
  'SUCCESS' = 'success',
  /**
   * The warning severity option for messages.
   */
  'WARNING' = 'warning',
  /**
   * The error severity option for messages.
   */
  'ERROR' = 'error',
}

/**
 * The SeverityIcon enum represents the available icon options for message severities.
 */
export enum SeverityIcon {
  /**
   * The icon option for the info severity.
   */
  'info' = 'ph-info-fill',
  /**
   * The icon option for the success severity.
   */
  'success' = 'ph-check-circle-fill',
  /**
   * The icon option for the warning severity.
   */
  'warning' = 'ph-warning-fill',
  /**
   * The icon option for the error severity.
   */
  'error' = 'ph-x-circle-fill',
}
