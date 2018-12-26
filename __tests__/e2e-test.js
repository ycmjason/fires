import { firestore, clearCollection } from './helpers/firebase.js';
import firecracker, {
  Firecracker,
  FirecrackerCollection,
  FirecrackerDocument,
} from '..';

jest.setTimeout(10000);

describe('e2e - CRUD', () => {
  let db;
  let $collection;
  beforeAll(() => {
    db = firecracker();
    $collection = firestore.collection('e2e');
  });

  beforeEach(async () => {
    await clearCollection($collection);
  });

  describe('Create', () => {
    describe('FirecrackerCollection.create', () => {
      it('should be able to add new document', async () => {
        await db.collection('e2e').create({ a: 3 });

        const $querySnapshot = await $collection.get();
        expect($querySnapshot.docs.length).toBe(1);
        expect($querySnapshot.docs[0].data().a).toBe(3);
      });
    });

    describe('FirecrackerCollection.createWithId', () => {
      it('should be able to add new document with specific ID', async () => {
        await db.collection('e2e').createWithId('wow', { x: 5 });

        const $querySnapshot = await $collection.get();
        expect($querySnapshot.docs.length).toBe(1);
        expect($querySnapshot.docs[0].id).toBe('wow');
        expect($querySnapshot.docs[0].data().x).toBe(5);
      });
    });
  });

  describe('Read', () => {
    beforeEach(async () => {
      await $collection.add({ count: 100 });
      await $collection.add({ hello: 'world' });

      await $collection.doc('someId').set({ yo: false });
    });

    describe('FirecrackerCollection.findById', () => {
      it('should find the document with a specific ID', async () => {
        const doc = await db.collection('e2e').findById('someId');
        expect(doc).toBeInstanceOf(FirecrackerDocument);
        expect(doc.yo).toBe(false);
      });
    });

    describe('FirecrackerCollection.findAll', () => {
      it('should retrieve all documents', async () => {
        const docs = await db.collection('e2e').findAll('someId');
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
});
