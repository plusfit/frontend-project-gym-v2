export const environment = {
  production: true,
  env: "Production",
  api: "https://backend-project-gym-production-9fcf.up.railway.app",
  exerciseTableLimit: 5,
  exerciseTableLimitOptions: [8, 5],
  routineTableLimit: 8,
  routineTableLimitOptions: [8, 5],
  clientsTableLimit: 8,
  clientsTableLimitOptions: [8, 5],
  config: {
    /**
     * The number of items to display per page.
     */
    pageSize: 8,
    /**
     * The size of the grid for the application.
     */
    gridSize: 8,

    scrollTimeDown: 10000,

    scrollTimeUp: 5000,
  },
  /**
   * Google reCAPTCHA v3 configuration
   */
  recaptcha: {
    siteKey: "6Led5m4rAAAAANjCNb_XFHRocWnlsuGDYKFkjtvf", // TODO: Reemplazar con tu site key de producción
  },
  /**
   * Admin password access code for viewing user passwords
   */
  adminPasswordCode: "GYM2024ADMIN",
};
