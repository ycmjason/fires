import $firestore from './$firestore';
import { aMapValues } from './utils';

export default class FirecrackerDocument {
  constructor ({ $ref, data }) {
    this.$id = $ref.id;
    this.$ref = $ref;
    Object.assign(this, data);
    Object.freeze(this);
  }

  static async from ($obj) {
    if ($obj instanceof $firestore.DocumentReference) {
      return await transformDocumentRef($obj);
    }

    if ($obj instanceof $firestore.DocumentSnapshot) {
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

const transformDocumentRef = async $docRef => {
  return await transformDocumentSnapshot(await $docRef.get());
};

const transformDocumentSnapshot = async $snapshot => {
  const $docData = $snapshot.data();

  if (!$docData) return null;

  return new FirecrackerDocument({
    $ref: $snapshot.ref,
    data: await transformDocumentData($docData),
  });
};

const transformDocumentData = async $docData => {
  const transformValue = async v => {
    if (v instanceof $firestore.DocumentReference) {
      return await transformDocumentRef(v);
    }

    if (v instanceof $firestore.Timestamp) {
      return v.toDate();
    }

    if (Array.isArray(v)) {
      return await Promise.all(v.map(transformValue));
    }

    if (typeof v === 'object') {
      return await transformDocumentData(v);
    }

    return v;
  };

  return await aMapValues($docData, transformValue);
};
