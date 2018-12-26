import { firestore, clearCollection } from './helpers/firebase.js';
import Firecracker from '..';

describe('e2e - CRUD', () => {
  let firecracker;
  let $collection;
  beforeAll(() => {
    firecracker = Firecracker();
    $collection = firestore.collection('e2e');
  });

  beforeEach(async () => {
    await clearCollection($collection);
  });

  describe('Create', () => {
    it('should be able to add new documents', async () => {
      await firecracker.collection('e2e').create({ a: 3 });

      const $querySnapshot = await $collection.get();
      expect($querySnapshot.docs.length).toBe(1);
      expect($querySnapshot.docs[0].data().a).toBe(3);
    });
  });
});
