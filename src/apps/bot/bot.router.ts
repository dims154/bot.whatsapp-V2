import { Router } from 'express';
import { botController } from './bot.controller';

export const botRouter = Router();

botRouter.post('/webhook', botController.receiveWebhook);
botRouter.get('/status', botController.status);
