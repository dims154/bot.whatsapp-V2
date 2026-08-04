import { Request, Response } from 'express';
import { dispatcher } from './bot.container';

export const botController = {
  receiveWebhook: async (req: Request, res: Response) => {
    const payload = req.body;
    try {
      // Dispatch raw payload to the bot dispatcher (expects a context-like payload)
      await dispatcher.dispatch(payload as any);

      return res.status(200).json({ status: 'success' });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: 'Webhook processing failed' });
    }
  },
  status: (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Bot service is running' });
  },
};
