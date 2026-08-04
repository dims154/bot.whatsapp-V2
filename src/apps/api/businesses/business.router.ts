import { Router } from 'express';
import { businessController } from './business.controller';
import { authorize } from '../../../middlewares/authorization.middleware';
import { Permissions } from '../authorization/permissions';

export const businessRouter = Router();

businessRouter.get('/', authorize([Permissions.BUSINESS_READ]), businessController.getAll);
businessRouter.get('/:id', authorize([Permissions.BUSINESS_READ]), businessController.getById);
businessRouter.post('/', authorize([Permissions.BUSINESS_CREATE]), businessController.create);
businessRouter.patch('/:id', authorize([Permissions.BUSINESS_UPDATE]), businessController.update);
businessRouter.delete('/:id', authorize([Permissions.BUSINESS_DELETE]), businessController.delete);
