
import * as line from '@line/bot-sdk';
import { messageSecret } from '@config/line';
const client = new line.Client({ channelAccessToken: messageSecret.access_token });
import * as admin from 'firebase-admin';
import { getSubItemsByAccount, updateUserListFromSubItem } from '@api/firebase';
import { textMessageTemplate } from '@api/line_templates';

export const handleEvent = (event: line.WebhookEvent) => {
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

const handleText = async (message: line.TextMessage,
                          replyToken: string, source: line.EventSource) => {
  let replyMessage: line.TextMessage;
  if (message.text.includes('subscribe ig')) {
    const account = message.text.split(' ')[2];
    if (!account) { return; }
    let replyText = '';
    await getSubItemsByAccount(account).then((querySnapshot: admin.firestore.QuerySnapshot) => {
      querySnapshot.forEach((item) => {
        const userList = item.data().users;
        if (userList.includes(source.userId)) {
          replyText = '你已經訂閱過囉!';
        } else {
          updateUserListFromSubItem(item.id, userList);
          replyText = '成功訂閱!';
        }
      });
      replyMessage = textMessageTemplate(replyText);
    }).catch((error) => {
      replyMessage = textMessageTemplate(replyText);
    });
  }

  client.replyMessage(replyToken, replyMessage)
  .catch(() => {
    console.log('沒有回傳值');
  });
};
