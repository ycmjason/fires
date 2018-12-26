import { firestore, clearCollection } from './helpers/firebase.js';
import firecracker, {
  Firecracker,
  FirecrackerCollection,
  FirecrackerDocument,
} from '..';

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
});
