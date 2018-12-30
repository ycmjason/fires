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

  describe('firecrackerCollection.subscribe(queryObj, onNext, onError)', () => {
    it('should call onNext', async done => {
      when(transformQuerySnapshot)
        .calledWith('$mockQuerySnapshot')
        .mockResolvedValue(['doc1', 'doc2']);

      const $mockQuery = { onSnapshot: jest.fn() };
      $mockQuery.onSnapshot.mockImplementation((options, onNext, onError) => {
        onNext('$mockQuerySnapshot');
      });

      const $mockCollection = { where: jest.fn() };
      when($mockCollection.where)
        .calledWith('country', '>', 'us')
        .mockReturnValue($mockQuery);

      const collection = new FirecrackerCollection($mockCollection);
      await collection.subscribe(
        { country: ['>', 'us'] },
        (doc) => {
          expect(doc).toEqual(['doc1', 'doc2']);
          done();
        }
      );
    });

    it('should call onError', async () => {
      const $mockQuery = { onSnapshot: jest.fn() };
      $mockQuery.onSnapshot.mockImplementation((options, onNext, onError) => {
        onError('$mockError');
      });

      const $mockCollection = { where: jest.fn() };
      when($mockCollection.where)
        .calledWith('country', '>', 'us')
        .mockReturnValue($mockQuery);

      const collection = new FirecrackerCollection($mockCollection);
      try {
        await collection.subscribe(
          { country: ['>', 'us'] },
          (doc) => {
            expect(doc).toEqual(['doc1', 'doc2']);
            done();
          }
        );
      } catch (e) {
        expect(e).toBe('$mockError');
      }
    });
  });
});
