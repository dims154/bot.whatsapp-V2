import { apiRouter } from './api.router';

export const apiModule = {
  name: 'api',
  description: 'REST API module for enterprise endpoints',
  router: apiRouter,
};
