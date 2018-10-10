import * as admin from 'firebase-admin';

const serviceAccount = require('@config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ig-bot-2be8a.firebaseio.com',
});

const db = admin.firestore();
db.settings({ timestampsInSnapshots: true });
const subItemsCollection = db.collection('sub_items');

export const getSubItems = (() => {
  return subItemsCollection.get();
});

export const getSubItemsByAccount = ((account: string) => {
  return subItemsCollection.where('account', '==', account).get();
});

export const updateUserListFromSubItem = ((itemId: string, userList: string[]) => {
  return subItemsCollection.doc(itemId).update({ users: userList });
});
