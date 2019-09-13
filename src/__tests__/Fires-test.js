import { when } from 'jest-when';

jest.mock('../FiresCollection');
import {
  // eslint-disable-next-line no-unused-vars
  Fires,
  FiresCollection,
} from '..';

const createMockFirestore = (base = {}) => {
  return {
    _settings: { timestampsInSnapshots: true },
    ...base,
  };
};

describe('Fires', () => {
  it('constructor should throw if Firestore did not set timestampsInSnapshots', () => {
    const $mockFirestore = { _settings: { timestampsInSnapshots: false } };

    expect(() => new Fires($mockFirestore)).toThrowErrorMatchingInlineSnapshot(
      `"Fires: Firestore must set \`timestampsInSnapshots\` to \`true\`."`,
    );
  });

  describe('fires.collection(name)', () => {
    it('should return a FiresCollection', () => {
      const $mockFirestore = createMockFirestore({ collection: jest.fn() });

      when($mockFirestore.collection)
        .calledWith('mockCollectionName')
        .mockReturnValue('$mockCollection');

      FiresCollection.mockImplementation($collection => {
        if ($collection === '$mockCollection') {
          return { type: 'collection' };
        }
        return {};
      });

      const db = new Fires($mockFirestore);
      expect(db.collection('mockCollectionName')).toEqual({
        type: 'collection',
      });
    });

    it('should return the same FiresCollection on subsequent calls', () => {
      const $mockFirestore = createMockFirestore({ collection: jest.fn() });

      when($mockFirestore.collection)
        .calledWith('mockCollectionName')
        .mockReturnValue('$mockCollection');

      FiresCollection.mockImplementation($collection => {
        if ($collection === '$mockCollection') {
          return { type: 'collection' };
        }
        return {};
      });

      const db = new Fires($mockFirestore);
      const collection1 = db.collection('mockCollectionName');
      const collection2 = db.collection('mockCollectionName');
      const collection3 = db.collection('mockCollectionName');
      expect(collection1).toBe(collection2);
      expect(collection2).toBe(collection3);
    });
  });
});
