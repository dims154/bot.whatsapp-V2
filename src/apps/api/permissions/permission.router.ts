import { Router } from 'express';
import { permissionController } from './permission.controller';
import { authorize } from '../../../middlewares/authorization.middleware';
import { Permissions } from '../authorization/permissions';

export const permissionRouter = Router();

permissionRouter.get('/', authorize([Permissions.PERMISSION_READ]), permissionController.getAll);
permissionRouter.get('/:id', authorize([Permissions.PERMISSION_READ]), permissionController.getById);
permissionRouter.post('/', authorize([Permissions.PERMISSION_CREATE]), permissionController.create);
permissionRouter.patch('/:id', authorize([Permissions.PERMISSION_UPDATE]), permissionController.update);
permissionRouter.delete('/:id', authorize([Permissions.PERMISSION_DELETE]), permissionController.delete);
