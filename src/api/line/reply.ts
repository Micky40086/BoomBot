import * as line from '@line/bot-sdk';
import { messageSecret } from '@config/line';
const client = new line.Client({
  channelAccessToken: messageSecret.access_token,
});

export const replyApi = (
  userId: string,
  message: line.Message | line.Message[],
) => {
  client.replyMessage(userId, message).catch((err) => {
    console.log('replyApi 沒有回傳值');
  });
};
