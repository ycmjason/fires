import firebase from 'firebase';
import {
  transformDocumentRef,
  transformDocumentSnapshot,
} from './FirecrackerTransformers';

export default class FirecrackerDocument {
  constructor ({ $ref, data }) {
    this.$id = $ref.id;
    this.$ref = $ref;
    Object.assign(this, data);
    Object.freeze(this);
  }

  static async from ($obj) {
    if ($obj instanceof firebase.firestore.DocumentReference) {
      return await transformDocumentRef($obj);
    }

    if ($obj instanceof firebase.firestore.DocumentSnapshot) {
      return await transformDocumentSnapshot($obj);
    }

    throw Error(`Firecracker.from panic: Unsure how to resolve ${$obj}.`);
  }

  // Update
  async update (data) {
    this.$ref.update(data);
  }

  // SUBSCRIBE
  async subscribe (fn) {
    return this.$ref.onSnapshot(async $documentSnapshot => {
      const doc = await FirecrackerDocument.from($documentSnapshot);
      return fn(doc);
    });
  }

  async subscribeIncludingMetadata (fn) {
    return this.$ref.onSnapshot(
      { includeMetadataChanges: true },
      async $documentSnapshot => {
        const doc = await FirecrackerDocument.from($documentSnapshot);
        return fn(doc, $documentSnapshot.metadata);
      },
    );
  }
}
