
import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import callbackRouter from './routes/callbackRouter';

const app = express();
// View Settings
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
// Show requset info
app.use((req:Request, res:Response, next:NextFunction) => {
  console.log(req.method, req.url);
  next();
});

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World');
});

app.use('/callback', callbackRouter);

app.listen(8080);
