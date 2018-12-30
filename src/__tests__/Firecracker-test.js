import { when } from 'jest-when';

jest.mock('../FirecrackerCollection');
import {
  // eslint-disable-next-line no-unused-vars
  Firecracker, FirecrackerCollection, FirecrackerDocument
} from '..';

const createMockFirestore = (base = {}) => {
  return {
    _config: {
      settings: { timestampsInSnapshots: true },
    },
    ...base,
  };
};

describe('Firecracker', () => {
  it('constructor should throw if Firestore did not set timestampsInSnapshots', () => {
    const $mockFirestore = {
      _config: {
        settings: { timestampsInSnapshots: false },
      },
    };
    expect(() => new Firecracker($mockFirestore)).toThrowErrorMatchingSnapshot();
  });

  describe('firecracker.collection(name)', () => {
    it('should return a FirecrackerCollection', () => {
      const $mockFirestore = createMockFirestore({ collection: jest.fn() });

      when($mockFirestore.collection)
        .calledWith('mockCollectionName')
        .mockReturnValue('$mockCollection');

      FirecrackerCollection.mockImplementation(($collection) => {
        if ($collection === '$mockCollection') {
          return { type: 'collection' };
        }
        return {};
      });

      const db = new Firecracker($mockFirestore);
      expect(db.collection('mockCollectionName')).toEqual({ type: 'collection' });
    });

    it('should return the same FirecrackerCollection on subsequent calls', () => {
      const $mockFirestore = createMockFirestore({ collection: jest.fn() });

      when($mockFirestore.collection)
        .calledWith('mockCollectionName')
        .mockReturnValue('$mockCollection');

      FirecrackerCollection.mockImplementation(($collection) => {
        if ($collection === '$mockCollection') {
          return { type: 'collection' };
        }
        return {};
      });

      const db = new Firecracker($mockFirestore);
      const collection1 = db.collection('mockCollectionName');
      const collection2 = db.collection('mockCollectionName');
      const collection3 = db.collection('mockCollectionName');
      expect(collection1).toBe(collection2);
      expect(collection2).toBe(collection3);
    });
  });
});
