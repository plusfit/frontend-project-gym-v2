export const environment = {
  production: true,
  env: 'Production',
  api: 'https://backend-project-gym-production.up.railway.app',
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
