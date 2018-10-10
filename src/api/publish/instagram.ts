import * as admin from 'firebase-admin';
import { getSubItems } from '@api/firebase';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const instagramPublish = () => {
  getSubItems().then((querySnapshot: admin.firestore.QuerySnapshot) => {
    const time = new Date().getTime() / 1000;
    const promises: Promise<any>[] = [];
    querySnapshot.forEach((item) => {
      // console.log(item.data());
      promises.push(getNewPostsByAccount(item.data().account, time));
    });
    Promise.all(promises).then((result) => {
      const newPosts = result.filter((item) => {
        return item.length > 0;
      })
      .reduce((accumulator, currentValue) => {
        return accumulator.concat(currentValue);
      },      []);
      console.log(newPosts);
    }).catch((err) => {
      console.log('getSubItems Promise.all Error', err);
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
    posts.forEach((item: any) => {
      console.log(item);
      if (timestamp - 30000 < item.node.taken_at_timestamp) {
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
  return new Promise((resolve, reject) => {
    arr.each((index: number, item: CheerioElement) => {
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
