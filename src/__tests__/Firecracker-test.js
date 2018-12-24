jest.mock('../FirecrackerCollection');
import { firestore } from './helpers/firebase';
import { Firecracker, FirecrackerCollection } from '..';

describe('Firecracker', () => {
  describe('new Firecracker(firestore)', () => {
    it('should point this.$firestore to the correct firestore', () => {
      const firecracker = new Firecracker(firestore);
      expect(firecracker.$firestore).toBe(firestore);
    });
  });

  describe('firecracker.collection(name)', () => {
    it('should return a FirecrackerCollection', () => {
      const firecracker = new Firecracker(firestore);

      expect(firecracker.collection('test'))
        .toBeInstanceOf(FirecrackerCollection);

      expect(FirecrackerCollection)
        .toHaveBeenCalledWith(firestore.collection('test'));
    });
  });
});
