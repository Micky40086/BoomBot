import * as admin from 'firebase-admin';
import { getSubItems } from '@api/firestore/instagram';
import * as line from '@line/bot-sdk';
import * as lineTemplates from '@api/line/templates';
import { pushApi } from '../line/push';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { chunk } from 'lodash';

export const instagramPublish = () => {
  const time = Math.floor(new Date().getTime() / 1000);
  getSubItems().then((querySnapshot: admin.firestore.QuerySnapshot) => {
    querySnapshot.forEach((item) => {
      const itemData = item.data();
      sendNewPostsToUsers(getNewPostsByAccount(itemData.account, time),
                          itemData.users)
      .catch((err) => {
        console.log(`Account: ${itemData.account} sendNewPostsToUsers Error`, err);
      });
    });
  }).catch((err) => {
    console.log('getSubItems Error', err);
  });
};

const getNewPostsByAccount = (account: string, timestamp: number): Promise<any> => {
  const url = `https://www.instagram.com/${account}/`;
  return axios.get(url).then(async (res) => {
    const $ = cheerio.load(res.data);
    const dataStr = await filterShareData($('script'));
    const posts = JSON.parse(dataStr.substring(dataStr.indexOf('{'), dataStr.length - 1))
    .entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;
    const newPosts: any[] = [];
    await posts.forEach((item: any) => {
      if (timestamp - 600 < item.node.taken_at_timestamp) {
        newPosts.push(`${url}p/${item.node.shortcode}`);
      }
    });
    return newPosts;
  }).catch((err) => {
    console.log('getNewPostsByAccount Error', err);
    return [];
  });
};

const filterShareData = (async (arr: Cheerio): Promise<string> => {
  let shareData: string = null;
  return new Promise(async (resolve, reject) => {
    await arr.each((index: number, item: CheerioElement) => {
      if (item.children && item.children.length > 0) {
        const str = item.children[0].data;
        if (str.includes('window._sharedData = ')) {
          shareData = str;
        }
      }
    });
    resolve();
  }).then(() => {
    return shareData;
  }).catch((err) => {
    console.log('filterShareData Error', err);
    return shareData;
  });
});

const sendNewPostsToUsers = async (newPosts: Promise<string[]>, users: string[]) => {
  const messageList = await createMessageList(await newPosts);
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

const createMessageList = (newPosts: string[]): Promise<line.Message[]> => {
  const promises: Promise<line.Message[]>[] = [];
  newPosts.forEach((url) => {
    promises.push(getMessagesByPost(url));
  });
  return Promise.all(promises).then((result) => {
    const messageList = result
    .reduce((accumulator, currentValue) => {
      return accumulator.concat(currentValue);
    },      []);
    return messageList;
  }).catch((err) => {
    console.log('createMessageList Promise.all Error', err);
    return [];
  });
};

const getMessagesByPost = (url: string): Promise<line.Message[]> => {
  return axios.get(url).then(async (res) => {
    const $ = cheerio.load(res.data);
    const dataStr = await filterShareData($('script'));
    const media = JSON.parse(dataStr.substring(dataStr.indexOf('{'), dataStr.length - 1))
    .entry_data.PostPage[0].graphql.shortcode_media;
    const returnMessages: line.Message[] = [];
    if (media.edge_sidecar_to_children) {
      media.edge_sidecar_to_children.edges.forEach((item: any) => {
        const node = item.node;
        if (node.is_video) {
          returnMessages.push(lineTemplates.videoMessageTemplate(node.display_url,
                                                                 node.video_url));
        } else {
          returnMessages.push(lineTemplates.imageMessageTemplate(node.display_url));
        }
      });
    } else {
      if (media.is_video) {
        returnMessages.push(lineTemplates.videoMessageTemplate(media.display_url, media.video_url));
      } else {
        returnMessages.push(lineTemplates.imageMessageTemplate(media.display_url));
      }
    }
    return returnMessages;
  }).catch((err) => {
    console.log('getMessagesByPost Error', err);
    return [];
  });
};
