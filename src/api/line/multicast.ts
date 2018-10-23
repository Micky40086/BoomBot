import { messageSecret } from '@config/line';
import * as line from '@line/bot-sdk';
import { chunk } from 'lodash';
const client = new line.Client({
  channelAccessToken: messageSecret.access_token,
});

export const multicastApi = (
  userIdArr: string[],
  message: line.Message[] | line.Message[],
) => {
  if (userIdArr.length > 150) {
    chunk(userIdArr, 150).forEach((userIdArrItem) => {
      client.multicast(userIdArrItem, message).catch((err) => {
        console.log('multicastApi Error', err);
      });
    });
  } else {
    client.multicast(userIdArr, message).catch((err) => {
      console.log('multicastApi Error', err);
    });
  }
};
