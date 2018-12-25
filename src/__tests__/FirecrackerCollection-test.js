jest.mock('../FirecrackerDocument');
import { firestore } from './helpers/firebase';
import { FirecrackerCollection, FirecrackerDocument } from '..';

describe('FirecrackerCollection', () => {
  const $collection = firestore.collection('test');

  describe('new FirecrackerCollection($collection)', () => {
    it('should point to this.$collection the correct collection', () => {
      const collection = new FirecrackerCollection($collection);
      expect(collection.$collection).toBe($collection);
    });
  });

  describe('firecrackerCollection.findById(id)', () => {
    it('should call FirecrackerDocument.from($docRef)', async () => {
      await $collection.doc('a').set({ value: 30 });
      const collection = new FirecrackerCollection($collection);
      FirecrackerDocument.from.mockResolvedValue('yoyo');

      expect(await collection.findById('a'))
        .toBe('yoyo');
      expect(FirecrackerDocument.from)
        .toHaveBeenCalledWith($collection.doc('a'));
    });
  });
});
