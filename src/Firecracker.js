import FirecrackerCollection from './FirecrackerCollection';

const _checkFirestoreConfig = $firestore => {
  if (!$firestore._config.settings.timestampsInSnapshots) {
    throw Error('Firecracker: Firestore must set `timestampsInSnapshots` to `true`. Please add this line before initiating Firecracker `firebase.firestore().settings({ timestampsInSnapshots: true });`');
  }

  return;
};

export default class Firecracker {
  constructor ($firestore) {
    _checkFirestoreConfig($firestore);
    this.$firestore = $firestore;
    this.collectionMap = new Map();
  }

  collection (name) {
    const { collectionMap, $firestore } = this;

    if (collectionMap.has(name)) {
      return collectionMap.get(name);
    }

    const collection = new FirecrackerCollection($firestore.collection(name));
    collectionMap.set(name, collection);
    return collection;
  }
}
