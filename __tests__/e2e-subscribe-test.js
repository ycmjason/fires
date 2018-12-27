import { firestore, clearCollection } from './helpers/firebase.js';
import firecracker, {
  // eslint-disable-next-line no-unused-vars
  Firecracker, FirecrackerCollection, FirecrackerDocument
} from '..';

jest.setTimeout(10000);

const COLLECTION_NAME = 'e2e-subscribe';

describe('e2e - Subscribe', () => {
  let db;
  let $collection;
  let cleanUps = [];
  const cleanUpLaterPlease = (fn) => cleanUps.push(fn);

  beforeAll(() => {
    db = firecracker();
    $collection = firestore.collection(COLLECTION_NAME);
  });

  beforeEach(async () => {
    await clearCollection($collection);
  });

  afterEach(() => {
    cleanUps.forEach(fn => fn());
  });

  describe('FirecrackerCollection.subscribe', () => {
    it('should listen to document events', async done => {
      let count = 0;
      cleanUpLaterPlease(
        db.collection(COLLECTION_NAME).subscribe(docs => {
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
        })
      );

      const $docRef = await $collection.add({ a: 3 });
      await $docRef.set({ a: 10 });
      await $docRef.delete();
    });
  });
});
