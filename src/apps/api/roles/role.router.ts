import { Router } from 'express';
import { roleController } from './role.controller';
import { authorize } from '../../../middlewares/authorization.middleware';
import { Permissions } from '../authorization/permissions';

export const roleRouter = Router();

roleRouter.get('/', authorize([Permissions.ROLE_READ]), roleController.getAll);
roleRouter.get('/:id', authorize([Permissions.ROLE_READ]), roleController.getById);
roleRouter.post('/', authorize([Permissions.ROLE_CREATE]), roleController.create);
roleRouter.patch('/:id', authorize([Permissions.ROLE_UPDATE]), roleController.update);
roleRouter.delete('/:id', authorize([Permissions.ROLE_DELETE]), roleController.delete);
