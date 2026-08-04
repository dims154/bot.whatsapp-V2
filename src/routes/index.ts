import { Router } from 'express';
import { healthRouter } from '../shared/health/health.router';
import { apiRouter } from '../apps/api/api.router';

export const router = Router();

router.use('/health', healthRouter);
router.use('/v1', apiRouter);
