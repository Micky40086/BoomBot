
import * as Line from '@line/bot-sdk';
import { messageSecret } from '@config/line';
const client = new Line.Client({ channelAccessToken: messageSecret.access_token });

export const handleEvent = (event:Line.WebhookEvent) => {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken, event.source);
        case 'image':
          // return handleImage(message, event.replyToken);
        case 'video':
          // return handleVideo(message, event.replyToken);
        case 'audio':
          // return handleAudio(message, event.replyToken);
        case 'location':
          // return handleLocation(message, event.replyToken);
        case 'sticker':
          return null;
          // return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      // return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      // return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      // return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      // return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      // let data = event.postback.data;
      // if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
      //   data += `(${JSON.stringify(event.postback.params)})`;
      // }
      // return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      // return replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
};

const handleText = (message: Line.TextMessage, replyToken: string, source: Line.EventSource) => {
  if (message.text.includes('subscribe ig')) {
    client.replyMessage(replyToken, message)
    .then((res:any) => {
      console.log(res);
      // getSubList().then((querySnapshot:any) => {
      //   querySnapshot.forEach((doc:any) => {
      //     console.log(`${doc.id} => ${doc.data()}`);
      //   });
      // });
    })
    .catch((err:any) => {
      // error handling
    });
  }
};
