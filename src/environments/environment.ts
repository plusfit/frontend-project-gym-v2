export const environment = {
  /**
   * A boolean indicating whether the application is in production mode or not.
   */
  production: false,
  /**
   * The name of the application.
   */
  appName: 'Project Gym V2',
  /**
   * The version of the application, obtained from the package.json file.
   */
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  appVersion: require('../../package.json').version,
  /**
   * The URL of the API for the application.
   */
  api:
    process?.env['NG_APP_API_URL'] ||
    'https://backend-project-gym-production-9fcf.up.railway.app',
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
  },
};
