import * as admin from 'firebase-admin';

const db = admin.firestore();

export const cloneCollection = (
  oldCollectionName: string,
  newCollectionName: string,
) => {
  const oldCollection = db.collection(oldCollectionName);
  const newCollection = db.collection(newCollectionName);

  oldCollection.get().then((querySnapshot: admin.firestore.QuerySnapshot) => {
    querySnapshot.forEach((item) => {
      const itemData = item.data();
      newCollection.add({
        account: itemData.account,
        users: itemData.users,
      });
    });
  });
};
