import * as admin from 'firebase-admin';

const db = admin.firestore();
const subItemsCollection = db.collection('ptt_sub_items');

export const getSubItems = (() => {
  return subItemsCollection.get();
});

export const getSubItemsByAccount = ((account: string) => {
  return subItemsCollection.where('account', '==', account).get();
});

export const updateUserListFromSubItem = ((itemId: string, userList: string[]) => {
  return subItemsCollection.doc(itemId).update({ users: userList });
});
