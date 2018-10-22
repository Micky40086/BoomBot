import { handleEvent } from '@api/callback';
import * as Line from '@line/bot-sdk';
import { Request, Response, Router } from 'express';

const callbackRouter = (router: Router) => {
  router.post('/', (req: Request, res: Response) => {
    req.body.events.forEach((event: Line.WebhookEvent) => {
      handleEvent(event);
    });
    res.sendStatus(200);
  });

  return router;
};

export default callbackRouter(Router());
