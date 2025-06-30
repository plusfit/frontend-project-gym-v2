export const environment = {
  /**
   * A boolean indicating whether the application is in production mode or not.
   */
  production: false,
  /**
   * The name of the application.
   */
  appName: "Project Gym V2",
  /**
   * The version of the application, obtained from the package.json file.
   */
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  appVersion: require("../../package.json").version,
  /**
   * The URL of the API for the application.
   */
  api: "https://backend-project-gym-production-9fcf.up.railway.app",
  //api: "http://localhost:3000",
  /**
   * The configuration settings for the application.
   */
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
    siteKey: "6Led5m4rAAAAANjCNb_XFHRocWnlsuGDYKFkjtvf", // TODO: Reemplazar con tu site key real
  },
};
