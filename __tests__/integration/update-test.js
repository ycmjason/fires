import { $db, firestore, clearCollection } from '../helpers/firebase.js';

import fires, {
  // eslint-disable-next-line no-unused-vars
  Fires,
} from '../..';

import '../matchers/toBeWithinRange';

const COLLECTION_NAME = 'integration-update';

const getCurrentSecond = () => Math.floor(Date.now() / 1000);

describe('Integration - Update', () => {
  let db;
  let $collection;

  beforeAll(() => {
    db = fires();
    $collection = $db.collection(COLLECTION_NAME);
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

      const startSecond = getCurrentSecond();
      await doc.update({ f: 'world' });
      const endSecond = getCurrentSecond();

      const $docSnapshot = await $docRef.get();
      const data = $docSnapshot.data();
      expect(data).toMatchObject({
        wow: 3,
        f: 'world',
      });
      expect(data.$updated).toBeInstanceOf(firestore.Timestamp);
      expect(data.$updated.seconds).toBeWithinRange(startSecond, endSecond);
    });
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
