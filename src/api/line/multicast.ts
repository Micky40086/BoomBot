import * as line from '@line/bot-sdk';
import { messageSecret } from '@config/line';
const client = new line.Client({ channelAccessToken: messageSecret.access_token });

export const multicastApi = (userIdArr: string[], message: line.Message[] | line.Message[]) => {
  client.multicast(userIdArr, message)
  .catch((err) => {
    console.log('multicastApi Error', err);
  });
};
