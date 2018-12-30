import firebase from 'firebase';
import {
  transformDocumentRef,
  transformDocumentSnapshot,
} from './FirecrackerTransformers';

export default class FirecrackerDocument {
  constructor ({ $ref, $metadata, data }) {
    Object.assign(this, data);
    this.$id = $ref.id;
    this.$ref = $ref;
    this.$metadata = $metadata;
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
    await this.$ref.update(data);
    return FirecrackerDocument.from(this.$ref);
  }

  // SUBSCRIBE
  subscribe (onNext, onError) {
    return _subscribe({
      $documentRef: this.$ref,
      onNext,
      onError,
    });
  }

  subscribeIncludingMetadata (onNext, onError) {
    return _subscribe({
      $documentRef: this.$ref,
      options: { includeMetadataChanges: true },
      onNext,
      onError,
    });
  }
}


const _subscribe = ({
  $documentRef,
  options = {},
  onNext,
  onError,
}) => {
  return $documentRef.onSnapshot(
    options,
    async $documentSnapshot => {
      const docs = await transformDocumentSnapshot($documentSnapshot);
      return onNext(docs);
    },
    err => {
      if (!onError) throw err;
      onError(err);
    },
  );
};
