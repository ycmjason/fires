import { firestore, clearCollection } from '../helpers/firebase.js';
import firecracker, {
  // eslint-disable-next-line no-unused-vars
  Firecracker, FirecrackerCollection, FirecrackerDocument
} from '../..';

jest.setTimeout(10000);

const COLLECTION_NAME = 'e2e-create';

describe('e2e - Create', () => {
  let db;
  let $collection;

  beforeAll(() => {
    db = firecracker();
    $collection = firestore.collection(COLLECTION_NAME);
  });

  beforeEach(async () => {
    await clearCollection($collection);
  });

  describe('FirecrackerCollection.create', () => {
    it('should be able to add new document', async () => {
      await db.collection(COLLECTION_NAME).create({ a: 3 });

      const $querySnapshot = await $collection.get();
      expect($querySnapshot.docs.length).toBe(1);
      expect($querySnapshot.docs[0].data().a).toBe(3);
    });
  });

  describe('FirecrackerCollection.createWithId', () => {
    it('should be able to add new document with specific ID', async () => {
      await db.collection(COLLECTION_NAME).createWithId('wow', { x: 5 });

      const $querySnapshot = await $collection.get();
      expect($querySnapshot.docs.length).toBe(1);
      expect($querySnapshot.docs[0].id).toBe('wow');
      expect($querySnapshot.docs[0].data().x).toBe(5);
    });
  });
});
