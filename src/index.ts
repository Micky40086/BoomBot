import callbackRouter from './routes/callbackRouter';
import instagramRouter from './routes/instagramRouter';
import pttRouter from './routes/pttRouter';
import bodyParser from 'body-parser';
import express, { NextFunction, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import path from 'path';

const serviceAccount = require('@config/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ig-bot-2be8a.firebaseio.com',
});
admin.firestore().settings({ timestampsInSnapshots: true });

const app = express();
// View Settings
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
// Show requset info
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req.method, req.url);
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

app.use('/callback', callbackRouter);
app.use('/instagram', instagramRouter);
app.use('/ptt', pttRouter);

app.listen(8080);
