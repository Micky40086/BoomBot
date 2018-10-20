import { Router, Request, Response } from 'express';
import { pttPublish } from '@api/publish/ptt';
// import { cloneCollection } from '@api/firestore/clone';

const pttRouter = (router: Router) => {
  router.post('/publish', (req: Request, res: Response) => {
    pttPublish();
    res.sendStatus(200);
  });

  // router.post('/clone', (req: Request, res: Response) => {
  //   cloneCollection('sub_items', 'instagram_sub_items');
  //   res.sendStatus(200);
  // });

  return router;
};

export default pttRouter(Router());
