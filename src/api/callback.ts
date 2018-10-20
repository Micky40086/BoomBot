
import * as line from '@line/bot-sdk';
import { replyApi } from '@api/line/reply';
import * as admin from 'firebase-admin';
import * as instagramFirestore from '@api/firestore/instagram';
import * as pttFirestore from '@api/firestore/ptt';
import { textMessageTemplate } from '@api/line/templates';
import axios from 'axios';

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
  const sourceId = source.type === 'group' ? source.groupId : source.userId;
  if (message.text.includes('subscribe ig')) {
    const account = message.text.split(' ')[2];
    if (!account || await !checkPageExist(`https://www.instagram.com/${account}/`)) { return; }
    replyMessage = await subscribeInstagram(account.toLowerCase(), sourceId);
  } else if (message.text.includes('subscribe ptt')) {
    const board = message.text.split(' ')[2];
    if (!board || !await checkPageExist(`https://www.ptt.cc/bbs/${board}/index.html`)) { return; }
    replyMessage = await subscribePtt(board.toLowerCase(), sourceId);
  }

  replyApi(replyToken, replyMessage);
};

const subscribeInstagram = (account: string, userId: string): Promise<line.TextMessage> => {
  let replyText = '';
  return instagramFirestore.getSubItemsByAccount(account)
  .then(async (querySnapshot: admin.firestore.QuerySnapshot) => {
    if (querySnapshot.size === 0) {
      await instagramFirestore.createSubItem(account, userId).then((res) => {
        replyText = '成功訂閱!';
      }).catch((err) => {
        console.log('instagramFirestore -> createSubItem Error', err);
      });
    }
    await querySnapshot.forEach(async (item) => {
      const userList = item.data().users;
      if (userList.includes(userId)) {
        replyText = '你已經訂閱過囉!';
      } else {
        userList.push(userId);
        instagramFirestore.updateUserListFromSubItem(item.id, userList);
        replyText = '成功訂閱!';
      }
    });
    return textMessageTemplate(replyText);
  }).catch((error) => {
    console.log(error);
    return textMessageTemplate('請稍後再試!');
  });
};

const subscribePtt = (board: string, userId: string): Promise<line.TextMessage> => {
  let replyText = '';
  return pttFirestore.getSubItemsByBoard(board)
  .then(async (querySnapshot: admin.firestore.QuerySnapshot) => {
    if (querySnapshot.size === 0) {
      await pttFirestore.createSubItem(board, userId).then((res) => {
        replyText = '成功訂閱!';
      }).catch((err) => {
        console.log('pttFirestore -> createSubItem Error', err);
      });
    }
    await querySnapshot.forEach(async (item) => {
      const userList = item.data().users;
      if (userList.includes(userId)) {
        replyText = '你已經訂閱過囉!';
      } else {
        userList.push(userId);
        pttFirestore.updateUserListFromSubItem(item.id, userList);
        replyText = '成功訂閱!';
      }
    });
    return textMessageTemplate(replyText);
  }).catch((error) => {
    console.log(error);
    return textMessageTemplate('請稍後再試!');
  });
};

const checkPageExist = (url: string): Promise<boolean> => {
  return axios.get(url)
  .then((res) => {
    return res.status === 200 ? true : false;
  }).catch((err) => {
    console.log('checkPageExist Error', err);
    return false;
  });
};
