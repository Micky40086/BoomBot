import * as admin from 'firebase-admin';

const serviceAccount = require('@config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ig-bot-2be8a.firebaseio.com',
});

const db = admin.firestore();
db.settings({ timestampsInSnapshots: true });

export const getSubList = (() => {
  return db.collection('sub_items').get();
});
