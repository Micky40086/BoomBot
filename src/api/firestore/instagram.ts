import * as admin from 'firebase-admin';

const db = admin.firestore();
const subItemsCollection = db.collection('instagram_sub_items');

export const getSubItems = (() => {
  return subItemsCollection.get();
});

export const getSubItemsByAccount = ((account: string) => {
  return subItemsCollection.where('account', '==', account).get();
});

export const createSubItem = ((accountStr: string, userId: string) => {
  return subItemsCollection.add({
    account: accountStr,
    users: [userId],
  });
});

export const updateUserListFromSubItem = ((itemId: string, userList: string[]) => {
  return subItemsCollection.doc(itemId).update({ users: userList });
});
