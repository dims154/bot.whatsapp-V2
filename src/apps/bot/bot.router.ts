import { Router } from 'express';
import { botController } from './bot.controller';
import { MetaController } from '../../modules/core/meta/controllers/meta.controller';

export const botRouter = Router();

botRouter.get('/webhook/whatsapp', MetaController.verifyWebhook);
botRouter.post('/webhook/whatsapp', MetaController.receiveWebhook);
botRouter.post('/webhook', botController.receiveWebhook);
botRouter.get('/status', botController.status);
