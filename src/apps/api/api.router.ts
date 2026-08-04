import { Router } from 'express';
import { authRouter } from './auth/auth.router';
import { roleRouter } from './roles/role.router';
import { permissionRouter } from './permissions/permission.router';
import { userRouter } from './users/user.router';
import { businessRouter } from './businesses/business.router';
import { botRouter } from '../bot/bot.router';

import metaRouter from '../../modules/core/meta/meta.route';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/roles', roleRouter);
apiRouter.use('/permissions', permissionRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/businesses', businessRouter);
apiRouter.use('/bot', botRouter);

apiRouter.use('/meta', metaRouter);

apiRouter.get('/status', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});
