import { when } from 'jest-when';

jest.mock('../FiresDocument');
import { FiresCollection, FiresDocument } from '..';

jest.mock('../transformers/executeQuery');
import executeQuery from '../transformers/executeQuery';

jest.mock('../transformers/transformQuerySnapshot');
import transformQuerySnapshot from '../transformers/transformQuerySnapshot';

jest.mock('../fieldValues/serverTimestamp');
import serverTimestamp from '../fieldValues/serverTimestamp';

describe('FiresCollection', () => {
  it('firesCollection.create(doc)', async () => {
    const $mockCollection = { add: jest.fn() };

    serverTimestamp.mockReturnValue('time');

    when($mockCollection.add)
      .calledWith({
        a: 3,
        $created: 'time',
        $updated: 'time',
      })
      .mockReturnValue('the ref');

    when(FiresDocument.from)
      .calledWith('the ref')
      .mockResolvedValue('yoyo');

    const collection = new FiresCollection($mockCollection);

    expect(await collection.create({ a: 3 })).toBe('yoyo');
  });

  it('firesCollection.createWithId(doc)', async () => {
    const $mockCollection = { doc: jest.fn() };

    serverTimestamp.mockReturnValue('time');

    const $mockDocRef = {
      set: jest.fn(),
      get: () => ({ exists: false }),
    };

    when($mockCollection.doc)
      .calledWith('the id')
      .mockReturnValue($mockDocRef);

    when(FiresDocument.from)
      .calledWith($mockDocRef)
      .mockResolvedValue('yoyo');

    const collection = new FiresCollection($mockCollection);

    expect(await collection.createWithId('the id', { a: 3 })).toBe('yoyo');
    expect($mockDocRef.set).toHaveBeenCalledWith({
      a: 3,
      $created: 'time',
      $updated: 'time',
    });
  });

  it('firesCollection.findById(id)', async () => {
    const $mockCollection = { doc: jest.fn() };

    when($mockCollection.doc)
      .calledWith('id')
      .mockReturnValue('the ref');

    when(FiresDocument.from)
      .calledWith('the ref')
      .mockResolvedValue('doc');

    const collection = new FiresCollection($mockCollection);

    expect(await collection.findById('id')).toBe('doc');
  });

  it('firesCollection.findOne(queryObj)', async () => {
    const $mockQuery = {
      limit: jest.fn(),
      where: jest.fn(),
    };

    when($mockQuery.limit)
      .calledWith(1)
      .mockReturnValue('$mockLimitedQuery');

    [
      ['country', '==', 'us'],
      ['age', '>=', 30],
      ['age', '<', 60],
      ['gender', '<', 'male'],
      ['gender', '>', 'male'],
      ['mother.age', '>', 20],
      ['mother.age', '<', 80],
    ].forEach(([field, operator, value]) => {
      when($mockQuery.where)
        .calledWith(field, operator, value)
        .mockReturnValue($mockQuery);
    });

    when(executeQuery)
      .calledWith('$mockLimitedQuery')
      .mockResolvedValue(['doc2']);

    const collection = new FiresCollection($mockQuery);
    expect(
      await collection.findOne({
        country: 'us',
        gender: ['!=', 'male'],
        age: ['range[)', 30, 60],
        mother: {
          age: ['range()', 20, 80],
        },
      }),
    ).toEqual('doc2');
  });

  it('firesCollection.findAll()', async () => {
    const $mockCollection = '$mockCollection';

    when(executeQuery)
      .calledWith($mockCollection)
      .mockResolvedValue(['doc1', 'doc2']);

    const collection = new FiresCollection($mockCollection);
    expect(await collection.findAll()).toEqual(['doc1', 'doc2']);
  });

  it('firesCollection.find(queryObj)', async () => {
    const $mockQuery = {
      where: jest.fn(),
      get: jest.fn().mockResolvedValue({
        docs: ['$doc1', '$doc2'],
      }),
    };

    [
      ['country', '==', 'us'],
      ['age', '>=', 30],
      ['age', '<', 60],
      ['gender', '<', 'male'],
      ['gender', '>', 'male'],
      ['mother.age', '>', 20],
      ['mother.age', '<', 80],
    ].forEach(([field, operator, value]) => {
      when($mockQuery.where)
        .calledWith(field, operator, value)
        .mockReturnValue($mockQuery);
    });

    when(executeQuery)
      .calledWith($mockQuery)
      .mockResolvedValue(['doc1', 'doc2']);

    const collection = new FiresCollection($mockQuery);
    expect(
      await collection.find({
        country: 'us',
        gender: ['!=', 'male'],
        age: ['range[)', 30, 60],
        mother: {
          age: ['range()', 20, 80],
        },
      }),
    ).toEqual(['doc1', 'doc2']);
  });

  describe('firesCollection.subscribe', () => {
    let $mockCollection;
    let $mockQuery;
    beforeEach(() => {
      when(transformQuerySnapshot)
        .calledWith('$mockQuerySnapshot')
        .mockResolvedValue(['doc1', 'doc2']);

      $mockQuery = { onSnapshot: jest.fn() };

      $mockCollection = { where: jest.fn(), onSnapshot: jest.fn() };
      when($mockCollection.where)
        .calledWith('country', '>', 'us')
        .mockReturnValue($mockQuery);
    });

    describe('firesCollection._subscribe', () => {
      it('should call onNext', async done => {
        $mockCollection.onSnapshot.mockImplementation((options, onNext, onError) => {
          onNext('$mockQuerySnapshot');
        });

        const collection = new FiresCollection($mockCollection);
        await collection._subscribe({
          $query: $mockCollection,
          options: {},
          onNext: docs => {
            expect(docs).toEqual(['doc1', 'doc2']);
            done();
          },
        });
      });

      it('should call onError', async done => {
        $mockCollection.onSnapshot.mockImplementation((options, onNext, onError) => {
          onError('$mockError');
        });

        const collection = new FiresCollection($mockCollection);
        await collection._subscribe({
          $query: $mockCollection,
          options: {},
          onError: e => {
            expect(e).toBe('$mockError');
            done();
          },
        });
      });
    });

    describe('firesCollection.subscribe(queryObj, onNext, onError)', () => {
      it('should call _subscribe with correct options', async () => {
        const collection = new FiresCollection($mockCollection);
        collection._subscribe = jest.fn();
        const onNext = () => {};
        const onError = () => {};

        await collection.subscribe({ country: ['>', 'us'] }, onNext, onError);
        expect(collection._subscribe).toHaveBeenCalledWith({
          $query: $mockQuery,
          options: {},
          onNext,
          onError,
        });
      });
    });

    describe('firesCollection.subscribe(onNext, onError)', () => {
      it('should call _subscribe with correct options', async () => {
        const collection = new FiresCollection($mockCollection);
        collection._subscribe = jest.fn();
        const onNext = () => {};
        const onError = () => {};

        await collection.subscribe(onNext, onError);
        expect(collection._subscribe).toHaveBeenCalledWith({
          $query: $mockCollection,
          options: {},
          onNext,
          onError,
        });
      });
    });

    describe('firesCollection.subscribeIncludingMetadata(queryObj, onNext, onError)', () => {
      it('should call _subscribe with correct options', async () => {
        const collection = new FiresCollection($mockCollection);
        collection._subscribe = jest.fn();
        const onNext = () => {};
        const onError = () => {};

        await collection.subscribeIncludingMetadata({ country: ['>', 'us'] }, onNext, onError);
        expect(collection._subscribe).toHaveBeenCalledWith({
          $query: $mockQuery,
          options: { includeMetadataChanges: true },
          onNext,
          onError,
        });
      });
    });

    describe('firesCollection.subscribeIncludingMetadata(onNext, onError)', () => {
      it('should call _subscribe with correct options', async () => {
        const collection = new FiresCollection($mockCollection);
        collection._subscribe = jest.fn();
        const onNext = () => {};
        const onError = () => {};

        await collection.subscribeIncludingMetadata(onNext, onError);
        expect(collection._subscribe).toHaveBeenCalledWith({
          $query: $mockCollection,
          options: { includeMetadataChanges: true },
          onNext,
          onError,
        });
      });
    });
  });
});
