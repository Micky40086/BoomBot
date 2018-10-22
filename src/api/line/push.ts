import { messageSecret } from '@config/line';
import * as line from '@line/bot-sdk';
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
