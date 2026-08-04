import { Router } from 'express';
import { userController } from './user.controller';
import { authorize } from '../../../middlewares/authorization.middleware';
import { Permissions } from '../authorization/permissions';

export const userRouter = Router();

userRouter.get('/', authorize([Permissions.USER_READ]), userController.getAll);
userRouter.get('/:id', authorize([Permissions.USER_READ]), userController.getById);
userRouter.post('/', authorize([Permissions.USER_CREATE]), userController.create);
userRouter.patch('/:id', authorize([Permissions.USER_UPDATE]), userController.update);
userRouter.delete('/:id', authorize([Permissions.USER_DELETE]), userController.delete);
userRouter.patch('/:id/roles', authorize([Permissions.USER_ASSIGN_ROLES]), userController.assignRoles);
userRouter.patch('/:id/permissions', authorize([Permissions.USER_ASSIGN_PERMISSIONS]), userController.assignPermissions);
