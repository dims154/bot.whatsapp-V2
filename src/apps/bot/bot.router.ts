import { Router } from 'express';
import { botController } from './bot.controller';

export const botRouter = Router();

botRouter.get('/status', botController.status);