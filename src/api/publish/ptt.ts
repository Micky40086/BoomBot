import { getSubItems } from '@api/firestore/ptt';
import { pushApi } from '@api/line/push';
import * as lineTemplates from '@api/line/templates';
import * as line from '@line/bot-sdk';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as admin from 'firebase-admin';
import { chunk } from 'lodash';

type pttPostObject = {
  title: string;
  href: string;
};

export const pttPublish = () => {
  const time = Math.floor(new Date().getTime() / 1000);
  getSubItems()
    .then((querySnapshot: admin.firestore.QuerySnapshot) => {
      querySnapshot.forEach(async (item) => {
        const itemData = item.data();
        const newPosts = await getNewPostsByBoard(itemData.board, time);
        sendNewPostsToUsers(newPosts, itemData.users);
      });
    })
    .catch((err) => {
      console.log('getSubItems Error', err);
    });
};

const getNewPostsByBoard = (
  board: string,
  timestamp: number,
): Promise<pttPostObject[]> => {
  const url = `https://www.ptt.cc/bbs/${board}/index.html`;
  return axios
    .get(url, {
      headers: {
        Cookie: 'over18=1;',
      },
    })
    .then(async (res) => {
      const $ = cheerio.load(res.data);
      const newPosts: pttPostObject[] = [];
      await $('.r-ent .title a').each((i, item) => {
        const href = item.attribs.href;
        if (timestamp - 1800 < parseInt(href.split('.')[1], 10)) {
          newPosts.push({ title: $(item).text(), href: item.attribs.href });
        }
      });
      return newPosts;
    })
    .catch((err) => {
      console.log('getNewPostsByBoard Error', err);
      return [];
    });
};

const sendNewPostsToUsers = (newPosts: pttPostObject[], users: string[]) => {
  const messageList = createMessageList(newPosts);
  const messageListLength = messageList.length;
  if (messageListLength > 0) {
    if (messageListLength > 5) {
      chunk(messageList, 5).forEach((item) => {
        users.forEach((user) => {
          pushApi(user, item);
        });
      });
    } else {
      users.forEach((user) => {
        pushApi(user, messageList);
      });
    }
  }
};

const createMessageList = (newPosts: pttPostObject[]): line.Message[] => {
  const messageList: line.Message[] = [];
  newPosts.forEach((item) => {
    messageList.push(
      lineTemplates.textMessageTemplate(
        `${item.title} \n https://www.ptt.cc${item.href}`,
      ),
    );
  });
  return messageList;
};
