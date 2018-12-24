import firebase from 'firebase';
import 'firebase/firestore';

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
});

export default firebase;

const firestore = firebase.firestore();
firestore.settings({ timestampsInSnapshots: true });
export { firestore };

export const clearCollection = async collection => {
  await Promise.all(
    (await collection.get()).docs
      .map(({ ref }) => ref)
      .map(async ref => {
        console.log(ref);
        await ref.delete()
      })
  );
};
