import { firestore, clearCollection } from './helpers/firebase.js';
import firecracker, {
  // eslint-disable-next-line no-unused-vars
  Firecracker, FirecrackerCollection, FirecrackerDocument
} from '..';

jest.setTimeout(10000);

const COLLECTION_NAME = 'e2e-read';

describe('e2e - Read', () => {
  let db;
  let $collection;

  beforeAll(() => {
    db = firecracker();
    $collection = firestore.collection(COLLECTION_NAME);
  });

  beforeEach(async () => {
    await clearCollection($collection);
    await $collection.add({ count: 100 });
    await $collection.add({ hello: 'world' });
    await $collection.doc('someId').set({ yo: false });
  });

  describe('FirecrackerCollection.findById', () => {
    it('should find the document with a specific ID', async () => {
      const doc = await db.collection(COLLECTION_NAME).findById('someId');
      expect(doc).toBeInstanceOf(FirecrackerDocument);
      expect(doc.yo).toBe(false);
    });
  });

  describe('FirecrackerCollection.findAll', () => {
    it('should retrieve all documents', async () => {
      const docs = await db.collection(COLLECTION_NAME).findAll();
      expect(docs).toBeInstanceOf(Array);
      expect(docs.length).toBe(3);
      expect(docs).toEqual(expect.arrayContaining([
        expect.objectContaining({ count: 100 }),
        expect.objectContaining({ hello: 'world' }),
        expect.objectContaining({ yo: false }),
      ]));
    });
  });
});
