import { Router, Request, Response } from 'express';
import { instagramPublish } from '@api/publish/instagram';
// import { cloneCollection } from '@api/firestore/clone';

const instagramRouter = (router: Router) => {
  router.post('/publish', (req: Request, res: Response) => {
    instagramPublish();
    res.sendStatus(200);
  });

  // router.post('/clone', (req: Request, res: Response) => {
  //   cloneCollection('sub_items', 'instagram_sub_items');
  //   res.sendStatus(200);
  // });

  return router;
};

export default instagramRouter(Router());
