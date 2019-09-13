import { $db, firestore, clearCollection } from '../helpers/firebase.js';
import fires, {
  // eslint-disable-next-line no-unused-vars
  Fires,
} from '../..';

import '../matchers/toBeWithinRange';

const COLLECTION_NAME = 'integration-create';

const getCurrentSecond = () => Math.floor(Date.now() / 1000);

describe('Integration - Create', () => {
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

  describe('FiresCollection.create', () => {
    it('should be able to add new document', async () => {
      const startSecond = getCurrentSecond();
      await db.collection(COLLECTION_NAME).create({ a: 3 });
      const endSecond = getCurrentSecond();

      const $querySnapshot = await $collection.get();

      expect($querySnapshot.docs.length).toBe(1);
      const data = $querySnapshot.docs[0].data();
      expect(data.a).toBe(3);

      expect(data.$created).toBeInstanceOf(firestore.Timestamp);
      expect(data.$created.seconds).toBeWithinRange(startSecond, endSecond);

      expect(data.$updated).toBeInstanceOf(firestore.Timestamp);
      expect(data.$updated.seconds).toBeWithinRange(startSecond, endSecond);
    });
  });

  describe('FiresCollection.createWithId', () => {
    it('should be able to add new document with specific ID', async () => {
      const startSecond = Math.floor(Date.now() / 1000);
      await db.collection(COLLECTION_NAME).createWithId('wow', { x: 5 });
      const endSecond = Math.ceil(Date.now() / 1000);

      const $querySnapshot = await $collection.get();

      expect($querySnapshot.docs.length).toBe(1);
      expect($querySnapshot.docs[0].id).toBe('wow');
      const data = $querySnapshot.docs[0].data();
      expect(data.x).toBe(5);

      expect(data.$created).toBeInstanceOf(firestore.Timestamp);
      expect(data.$created.seconds).toBeWithinRange(startSecond, endSecond);

      expect(data.$updated).toBeInstanceOf(firestore.Timestamp);
      expect(data.$updated.seconds).toBeWithinRange(startSecond, endSecond);
    });
  });

  describe('FiresCollection.create', () => {
    it('should be able to add new document', async () => {
      await db.collection(COLLECTION_NAME).create({ a: 3 });

      const $querySnapshot = await $collection.get();
      expect($querySnapshot.docs.length).toBe(1);
      expect($querySnapshot.docs[0].data().a).toBe(3);
    });
  });

  describe('FiresCollection.createWithId', () => {
    it('should be able to add new document with specific ID', async () => {
      await db.collection(COLLECTION_NAME).createWithId('wow', { x: 5 });

      const $querySnapshot = await $collection.get();
      expect($querySnapshot.docs.length).toBe(1);
      expect($querySnapshot.docs[0].id).toBe('wow');
      expect($querySnapshot.docs[0].data().x).toBe(5);
    });

    it('should not add any document if specific ID exists', async () => {
      await $collection.doc('wow').set({ x: 3 });

      await expect(
        db.collection(COLLECTION_NAME).createWithId('wow', { x: 5 }),
      ).rejects.toMatchInlineSnapshot(`[Error: integration-create.wow already exists]`);

      const $querySnapshot = await $collection.get();
      expect($querySnapshot.docs.length).toBe(1);
      expect($querySnapshot.docs[0].id).toBe('wow');
      expect($querySnapshot.docs[0].data().x).toBe(3);
    });
  });
});
