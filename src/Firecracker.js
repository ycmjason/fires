import $firestore from './$firestore';
import FirecrackerCollection from './FirecrackerCollection';

export default class Firecracker {
  constructor () {
    // firebase.initializeApp should be called by then!
    this.$db = $firestore();
    this.$db.settings({ timestampsInSnapshots: true });
  }

  collection (name) {
    return new FirecrackerCollection(this.$db.collection(name));
  }
}
