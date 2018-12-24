import FirecrackerCollection from './FirecrackerCollection';

const checkFirestoreConfig = $firestore => {
  if (!$firestore._config.settings.timestampsInSnapshots) {
    throw Error('Firecracker: Firestore must set `timestampsInSnapshots` to `true`. Please add this line before initiating Firecracker `firebase.firestore().settings({ timestampsInSnapshots: true });`');
  }

  return;
};

export default class Firecracker {
  constructor ($firestore) {
    checkFirestoreConfig($firestore);
    this.$firestore = $firestore;
  }

  collection (name) {
    return new FirecrackerCollection(this.$firestore.collection(name));
  }
}
