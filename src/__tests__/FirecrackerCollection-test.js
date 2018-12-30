jest.mock('../FirecrackerDocument');
import { FirecrackerCollection, FirecrackerDocument } from '..';

jest.mock('../FirecrackerTransformers/executeQuery');
import executeQuery from '../FirecrackerTransformers/executeQuery';

jest.mock('../FirecrackerTransformers/transformQuerySnapshot');
import transformQuerySnapshot from '../FirecrackerTransformers/transformQuerySnapshot';

import { when } from 'jest-when';

describe('FirecrackerCollection', () => {
  it('firecrackerCollection.create(doc)', async () => {
    const $mockCollection = { add: jest.fn() };

    when($mockCollection.add)
      .calledWith({ a: 3 })
      .mockReturnValue('the ref');

    when(FirecrackerDocument.from)
      .calledWith('the ref')
      .mockResolvedValue('yoyo');

    const collection = new FirecrackerCollection($mockCollection);

    expect(await collection.create({ a: 3 })).toBe('yoyo');
  });

  it('firecrackerCollection.createWithId(doc)', async () => {
    const $mockCollection = { doc: jest.fn() };

    const $mockDocRef = { set: jest.fn() };

    when($mockCollection.doc)
      .calledWith('the id')
      .mockReturnValue($mockDocRef);

    when(FirecrackerDocument.from)
      .calledWith($mockDocRef)
      .mockResolvedValue('yoyo');

    const collection = new FirecrackerCollection($mockCollection);

    expect(await collection.createWithId('the id', { a: 3 })).toBe('yoyo');
    expect($mockDocRef.set).toHaveBeenCalledWith({ a: 3 });
  });

  it('firecrackerCollection.findById(id)', async () => {
    const $mockCollection = { doc: jest.fn() };

    when($mockCollection.doc)
      .calledWith('id')
      .mockReturnValue('the ref');

    when(FirecrackerDocument.from)
      .calledWith('the ref')
      .mockResolvedValue('yoyo');

    const collection = new FirecrackerCollection($mockCollection);

    expect(await collection.findById('id')).toBe('yoyo');
  });

  it ('firecrackerCollection.findAll()', async () => {
    const $mockCollection = '$mockCollection';

    when(executeQuery)
      .calledWith($mockCollection)
      .mockResolvedValue(['doc1', 'doc2']);

    const collection = new FirecrackerCollection($mockCollection);
    expect(await collection.findAll()).toEqual(['doc1', 'doc2']);
  });

  it ('firecrackerCollection.find(queryObj)', async () => {
    const $mockCollection = { where: jest.fn() };
    const $mockQuery = {
      get: jest.fn().mockResolvedValue({
        docs: ['$doc1', '$doc2'],
      }),
    };

    when($mockCollection.where)
      .calledWith('country', '==', 'us')
      .mockReturnValue($mockQuery);

    when(executeQuery)
      .calledWith($mockQuery)
      .mockResolvedValue(['doc1', 'doc2']);

    const collection = new FirecrackerCollection($mockCollection);
    expect(await collection.find({
      country: 'us',
    })).toEqual(['doc1', 'doc2']);
  });

  describe('firecrackerCollection.subscribe', () => {
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

    describe('firecrackerCollection._subscribe', () => {
      it('should call onNext', async done => {
        $mockCollection.onSnapshot.mockImplementation((options, onNext, onError) => {
          onNext('$mockQuerySnapshot');
        });

        const collection = new FirecrackerCollection($mockCollection);
        await collection._subscribe({
          $query: $mockCollection,
          options: {},
          onNext: (docs) => {
            expect(docs).toEqual(['doc1', 'doc2']);
            done();
          },
        });
      });

      it('should call onError', async done => {
        $mockCollection.onSnapshot.mockImplementation((options, onNext, onError) => {
          onError('$mockError');
        });

        const collection = new FirecrackerCollection($mockCollection);
        await collection._subscribe({
          $query: $mockCollection,
          options: {},
          onError: (e) => {
            expect(e).toBe('$mockError');
            done();
          },
        });
      });
    });

    describe('firecrackerCollection.subscribe(queryObj, onNext, onError)', () => {
      it('should call _subscribe with correct options', async () => {
        const collection = new FirecrackerCollection($mockCollection);
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

    describe('firecrackerCollection.subscribe(onNext, onError)', () => {
      it('should call _subscribe with correct options', async () => {
        const collection = new FirecrackerCollection($mockCollection);
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

    describe('firecrackerCollection.subscribeIncludingMetadata(queryObj, onNext, onError)', () => {
      it('should call _subscribe with correct options', async () => {
        const collection = new FirecrackerCollection($mockCollection);
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

    describe('firecrackerCollection.subscribeIncludingMetadata(onNext, onError)', () => {
      it('should call _subscribe with correct options', async () => {
        const collection = new FirecrackerCollection($mockCollection);
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
