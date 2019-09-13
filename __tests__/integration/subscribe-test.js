import { $db, clearCollection } from '../helpers/firebase.js';
import fires, {
  // eslint-disable-next-line no-unused-vars
  Fires,
  FiresDocument,
} from '../..';

const createStreamCB = () => {
  const fns = [];
  let n = 0;

  const cb = (...args) => {
    const fn = fns[n++];
    if (!fn) throw Error(`Called the ${n}-th time, but no CB is registered!`);

    return fn(...args);
  };

  cb.next = fn => {
    fns.push(fn);
    return cb;
  };

  return cb;
};

describe('Integration - Subscribe', () => {
  let db;
  let $collection;
  const cleanUps = [];
  const addCleanUp = fn => cleanUps.push(fn);

  beforeAll(() => {
    db = fires();
  });

  let collectionName;
  let i = 0;
  beforeEach(async () => {
    // Give each test a separate collection.
    // This is because onSnapshot will cache results,
    // which make the tests interfere each other.
    collectionName = `integration-subscribe-${i++}th-test`;
    $collection = $db.collection(collectionName);
    await clearCollection($collection);
  });

  afterEach(async () => {
    while (cleanUps.length > 0) cleanUps.pop()();
    await clearCollection($collection);
  });

  describe('FiresCollection.subscribe', () => {
    it('should listen to document events', async done => {
      const $docRef = await $collection.add({ a: 3 });

      addCleanUp(
        db.collection(collectionName).subscribe(
          createStreamCB()
            .next(async docs => {
              expect(docs).toBeInstanceOf(Array);
              expect(docs).toHaveLength(1);
              expect(docs[0]).toMatchObject({ a: 3 });

              await $docRef.set({ a: 10 });
            })
            .next(async docs => {
              expect(docs).toBeInstanceOf(Array);
              expect(docs).toHaveLength(1);
              expect(docs[0]).toMatchObject({ a: 10 });

              await $docRef.delete();
            })
            .next(docs => {
              expect(docs).toBeInstanceOf(Array);
              expect(docs).toHaveLength(0);
              done();
            }),
        ),
      );
    });

    it('should listen to document events with query', async done => {
      const $docRef = await $collection.add({ a: 3 });

      addCleanUp(
        db.collection(collectionName).subscribe(
          {
            a: ['<=', 5],
          },
          createStreamCB()
            .next(async docs => {
              expect(docs).toBeInstanceOf(Array);
              expect(docs).toHaveLength(1);
              expect(docs[0]).toMatchObject({ a: 3 });

              await $docRef.set({ a: 10 });
            })
            .next(async docs => {
              expect(docs).toBeInstanceOf(Array);
              expect(docs).toHaveLength(0);

              await $docRef.set({ a: 0 });
            })
            .next(async docs => {
              expect(docs).toBeInstanceOf(Array);
              expect(docs).toHaveLength(1);
              expect(docs[0]).toMatchObject({ a: 0 });

              await $docRef.delete();
            })
            .next(docs => {
              expect(docs).toBeInstanceOf(Array);
              expect(docs).toHaveLength(0);
              done();
            }),
        ),
      );
    });
  });

  describe('FiresDocument.subscribe', () => {
    it('should listen to document events', async done => {
      const $docRef = await $collection.add({ a: 3 });
      const document = await db.collection(collectionName).findById($docRef.id);

      addCleanUp(
        document.subscribe(
          createStreamCB()
            .next(async doc => {
              expect(doc).toBeInstanceOf(FiresDocument);
              expect(doc).toMatchObject({ a: 3 });
              await $docRef.set({ a: 10 });
            })
            .next(async doc => {
              expect(doc).toBeInstanceOf(FiresDocument);
              expect(doc).toMatchObject({ a: 10 });
              await $docRef.delete();
            })
            .next(async doc => {
              expect(doc).toBeNull();
              done();
            }),
        ),
      );
    });
  });
});
