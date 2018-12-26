jest.mock('../FirecrackerDocument');
import { FirecrackerCollection, FirecrackerDocument } from '..';

jest.mock('../FirecrackerTransformers/executeQuery');
import executeQuery from '../FirecrackerTransformers/executeQuery';

import { when } from 'jest-when';

describe('FirecrackerCollection', () => {
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
});
