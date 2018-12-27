import { firestore, clearCollection } from '../helpers/firebase.js';
import firecracker, {
  // eslint-disable-next-line no-unused-vars
  Firecracker, FirecrackerCollection, FirecrackerDocument
} from '../..';

jest.setTimeout(10000);

describe('Integration - Subscribe', () => {
  let db;
  let $collection;

  beforeAll(() => {
    db = firecracker();
  });

  let collectionName;
  let i = 0;
  beforeEach(async () => {
    // Give each test a separate collection.
    // This is because onSnapshot will cache results,
    // which make the tests interfere each other.
    collectionName = `integration-subscribe-${i++}th-test`;
    $collection = firestore.collection(collectionName);
  });

  afterEach(async () => {
    await clearCollection($collection);
  });

  afterAll(async () => {
    await clearCollection($collection);
  });

  describe('FirecrackerCollection.subscribe', () => {
    it('should listen to document events', async done => {
      let count = 0;
      db.collection(collectionName).subscribe(docs => {
        switch (count) {
          case 0:
            expect(docs).toBeInstanceOf(Array);
            expect(docs).toHaveLength(1);
            expect(docs[0]).toBeInstanceOf(FirecrackerDocument);
            expect(docs[0]).toEqual(expect.objectContaining({ a: 3 }));
            break;
          case 1:
            expect(docs).toBeInstanceOf(Array);
            expect(docs).toHaveLength(1);
            expect(docs[0]).toBeInstanceOf(FirecrackerDocument);
            expect(docs[0]).toEqual(expect.objectContaining({ a: 10 }));
            done();
            break;
          case 2:
            expect(docs).toBeInstanceOf(Array);
            expect(docs).toHaveLength(0);
            break;
          default:
            throw Error(`Called the ${count}th time!`);
        }
        count++;
      });

      // create
      const $docRef = await $collection.add({ a: 3 });
      // update
      await $docRef.set({ a: 10 });
      // delete
      await $docRef.delete();
    });
  });
});
