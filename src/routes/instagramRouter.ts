import { Router, Request, Response } from 'express';
import { instagramPublish } from '@api/publish/instagram';

const instagramRouter = (router: Router) => {
  router.post('/publish', (req: Request, res: Response) => {
    instagramPublish();
    res.sendStatus(200);
  });

  return router;
};

export default instagramRouter(Router());
