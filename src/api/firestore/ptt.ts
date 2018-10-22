import * as admin from 'firebase-admin';

const db = admin.firestore();
const subItemsCollection = db.collection('ptt_sub_items');

export const getSubItems = () => {
  return subItemsCollection.get();
};

export const getSubItemsByBoard = (board: string) => {
  return subItemsCollection.where('board', '==', board).get();
};

export const createSubItem = (boardName: string, userId: string) => {
  return subItemsCollection.add({
    board: boardName,
    users: [userId],
  });
};

export const updateUserListFromSubItem = (
  itemId: string,
  userList: string[],
) => {
  return subItemsCollection.doc(itemId).update({ users: userList });
};
