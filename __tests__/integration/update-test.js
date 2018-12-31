import { firestore, clearCollection } from '../helpers/firebase.js';
import fires, {
  // eslint-disable-next-line no-unused-vars
  Fires, FiresCollection, FiresDocument
} from '../..';

const COLLECTION_NAME = 'integration-update';

describe('Integration - Update', () => {
  let db;
  let $collection;

  beforeAll(() => {
    db = fires();
    $collection = firestore.collection(COLLECTION_NAME);
  });

  beforeEach(async () => {
    await clearCollection($collection);
  });

  afterAll(async () => {
    await clearCollection($collection);
  });

  describe('FiresDocument.update', () => {
    it('should be able to update document', async () => {
      const $docRef = await $collection.add({ wow: 3, f: 'hello' });

      const doc = await db.collection(COLLECTION_NAME).findById($docRef.id);
      await doc.update({ f: 'world' });

      const $docSnapshot = await $docRef.get();
      expect($docSnapshot.data()).toMatchObject({
        wow: 3,
        f: 'world',
      });
    });
  });
});
