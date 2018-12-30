import { firestore } from 'firebase';
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
  }

  static async from ($obj) {
    if ($obj instanceof firestore.DocumentReference) {
      return await transformDocumentRef($obj);
    }

    if ($obj instanceof firestore.DocumentSnapshot) {
      return await transformDocumentSnapshot($obj);
    }

    throw Error(`Firecracker.from panic: Unsure how to resolve ${$obj}.`);
  }

  // Update
  async update (data) {
    await this.$ref.update(data);
    return await FirecrackerDocument.from(this.$ref);
  }

  // Delete
  async delete () {
    await this.$ref.delete();
    return;
  }

  // SUBSCRIBE
  subscribe (onNext, onError) {
    return this._subscribe({
      $ref: this.$ref,
      options: {},
      onNext,
      onError,
    });
  }

  subscribeIncludingMetadata (onNext, onError) {
    return this._subscribe({
      $ref: this.$ref,
      options: { includeMetadataChanges: true },
      onNext,
      onError,
    });
  }

  _subscribe ({ $ref, options, onNext, onError }) {
    return $ref.onSnapshot(
      options,
      async $documentSnapshot => {
        if (!onNext) return;
        const doc = await transformDocumentSnapshot($documentSnapshot);
        return onNext(doc);
      },
      err => {
        if (!onError) throw err;
        onError(err);
      },
    );
  }
}
