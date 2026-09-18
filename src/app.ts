import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { json, urlencoded } from 'express';
import { router } from './routes';
import { errorHandler } from './middlewares/error-handler.middleware';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(json({
    verify: (req, _res, buffer) => {
      const expressRequest = req as express.Request;
      const path = expressRequest.originalUrl.split('?')[0];

      if (path === '/api/v1/meta/webhook') {
        expressRequest.rawBody = Buffer.from(buffer);
      }
    },
  }));
  app.use(urlencoded({ extended: true }));

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(null));
  app.use('/api', router);

  app.use(errorHandler);

  return app;
};
