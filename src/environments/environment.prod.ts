import process from 'process';
export const environment = {
  production: true,
  env: 'Production',
  api:
    process?.env['NG_APP_API_URL'] ||
    'https://backend-project-gym-production-9fcf.up.railway.app',
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
  },
};
