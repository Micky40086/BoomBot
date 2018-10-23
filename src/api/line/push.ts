import * as line from '@line/bot-sdk';
import { messageSecret } from '@config/line';
const client = new line.Client({
  channelAccessToken: messageSecret.access_token,
});

export const pushApi = (
  userId: string,
  message: line.Message | line.Message[],
) => {
  client.pushMessage(userId, message).catch((err) => {
    console.log('pushApi Error', err);
  });
};
