import { firestore } from 'firebase';
import {
  transformDocumentRef,
  transformDocumentSnapshot,
} from './transformers';
import { mapValues } from './utils';

export default class FiresDocument {
  constructor ({ $ref, $metadata, data }) {
    _setReadOnly(this, {
      ...data,
      $ref,
      $id: $ref.id,
      $metadata,
    });
  }

  static async from ($obj) {
    if ($obj instanceof firestore.DocumentReference) {
      return await transformDocumentRef($obj);
    }

    if ($obj instanceof firestore.DocumentSnapshot) {
      return await transformDocumentSnapshot($obj);
    }

    throw Error(`Fires.from panic: Unsure how to resolve ${$obj}.`);
  }

  // Update
  async update (data) {
    await this.$ref.update(data);
    return await FiresDocument.from(this.$ref);
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

const _setReadOnly = (obj, props) => {
  Object.defineProperties(
    obj,
    mapValues(props, v => ({
      get () {
        return v;
      },

      set () {
        throw Error('Attempt to mutate variable');
      },

      enumerable: true,
    }))
  );
};
