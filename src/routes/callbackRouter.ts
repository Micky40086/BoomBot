import { Router, Request, Response } from 'express';
import * as Line from '@line/bot-sdk';
import { handleEvent } from '@api/callback';

const loginPath = (router: Router) => {
  // router.get('/', async (req:Request, res:Response) => {
  //   const profile = await getToken(req.query.code, `https://${req.headers.host}/login/landing`)
  //   .then((res) => {
  //     console.log('lineVerify Success');
  //     return jwt.verify(res.data.id_token, loginSecret.client_secret) as ProfileObject;
  //   }).catch((error) => {
  //     console.log('lineVerify Failed');
  //     return { name: 'client Error!' };
  //   });
  //   res.render('landing', { title: profile.name });
  // });
  router.post('/', (req: Request, res: Response) => {
    req.body.events.forEach((event: Line.WebhookEvent) => {
      handleEvent(event);
    });
    res.send('respond with a callback');
  });

  return router;
};

export default loginPath(Router());
