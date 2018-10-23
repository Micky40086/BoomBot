import * as instagramFirestore from '@api/firestore/instagram';
import * as pttFirestore from '@api/firestore/ptt';
import { replyApi } from '@api/line/reply';
import { textMessageTemplate } from '@api/line/templates';
import * as line from '@line/bot-sdk';
import axios from 'axios';
import * as admin from 'firebase-admin';

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

const handleText = async (
  message: line.TextMessage,
  replyToken: string,
  source: line.EventSource,
) => {
  let replyMessage: line.TextMessage;
  const sourceId = source.type === 'group' ? source.groupId : source.userId;
  if (/^subscribe ig \S+$/.test(message.text)) {
    const account = message.text.split(' ')[2];
    const pageExist = await checkPageExist(
      `https://www.instagram.com/${encodeURI(account)}/`,
    );
    if (pageExist) {
      replyMessage = await subscribeInstagram(account.toLowerCase(), sourceId);
    } else {
      replyMessage = textMessageTemplate('Subscribe fail, Account not exist!');
    }
  } else if (/^subscribe ptt \S+$/.test(message.text)) {
    const board = message.text.split(' ')[2];
    const pageExist = await checkPageExist(
      `https://www.ptt.cc/bbs/${board}/index.html`,
    );
    if (pageExist) {
      replyMessage = await subscribePtt(board.toLowerCase(), sourceId);
    } else {
      replyMessage = textMessageTemplate('Subscribe fail, Board not exist!');
    }
  }

  replyApi(replyToken, replyMessage);
};

const subscribeInstagram = (
  account: string,
  userId: string,
): Promise<line.TextMessage> => {
  let replyText = '';
  return instagramFirestore
    .getSubItemsByAccount(account)
    .then(async (querySnapshot: admin.firestore.QuerySnapshot) => {
      if (querySnapshot.size === 0) {
        await instagramFirestore
          .createSubItem(account, userId)
          .then((res) => {
            replyText = `Subscribe ${account} success!`;
          })
          .catch((err) => {
            console.log('instagramFirestore -> createSubItem Error', err);
          });
      }
      await querySnapshot.forEach(async (item) => {
        const userList = item.data().users;
        if (userList.includes(userId)) {
          replyText = `${account} already subscribed!`;
        } else {
          userList.push(userId);
          instagramFirestore.updateUserListFromSubItem(item.id, userList);
          replyText = `Subscribe ${account} success!`;
        }
      });
      return textMessageTemplate(replyText);
    })
    .catch((error) => {
      console.log(error);
      return textMessageTemplate('請稍後再試!');
    });
};

const subscribePtt = (
  board: string,
  userId: string,
): Promise<line.TextMessage> => {
  let replyText = '';
  return pttFirestore
    .getSubItemsByBoard(board)
    .then(async (querySnapshot: admin.firestore.QuerySnapshot) => {
      if (querySnapshot.size === 0) {
        await pttFirestore
          .createSubItem(board, userId)
          .then((res) => {
            replyText = `Subscribe ${board} success!`;
          })
          .catch((err) => {
            console.log('pttFirestore -> createSubItem Error', err);
          });
      }
      await querySnapshot.forEach(async (item) => {
        const userList = item.data().users;
        if (userList.includes(userId)) {
          replyText = `${board} already subscribed!`;
        } else {
          userList.push(userId);
          pttFirestore.updateUserListFromSubItem(item.id, userList);
          replyText = `Subscribe ${board} success!`;
        }
      });
      return textMessageTemplate(replyText);
    })
    .catch((error) => {
      console.log(error);
      return textMessageTemplate('請稍後再試!');
    });
};

const checkPageExist = (url: string): Promise<boolean> => {
  return axios
    .get(url)
    .then((res) => {
      return res.status === 200 ? true : false;
    })
    .catch((err) => {
      console.log('checkPageExist Error', err);
      return false;
    });
};
