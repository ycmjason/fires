import { when } from 'jest-when';

jest.mock('../FirecrackerDocument');
import { FirecrackerDocument } from '..';

import {
  executeQuery,
  transformQuerySnapshot,
} from '../FirecrackerTransformers';

describe('FirecrackerTransformers', () => {
  it ('executeQuery', async () => {
    const $mockQuery = { get: jest.fn() };
    const $mockQuerySnapshot = { docs: ['$doc1', '$doc2'] };

    $mockQuery.get.mockResolvedValue($mockQuerySnapshot);

    when(FirecrackerDocument.from)
      .calledWith('$doc1')
      .mockResolvedValue('doc1');

    when(FirecrackerDocument.from)
      .calledWith('$doc2')
      .mockResolvedValue('doc2');

    expect(await executeQuery($mockQuery))
      .toEqual(['doc1', 'doc2']);
  });

  it ('transformQuerySnapshot', async () => {
    const $mockQuerySnapshot = {
      docs: ['$doc1', '$doc2'],
    };

    when(FirecrackerDocument.from)
      .calledWith('$doc1')
      .mockResolvedValue('doc1');

    when(FirecrackerDocument.from)
      .calledWith('$doc2')
      .mockResolvedValue('doc2');

    expect(await transformQuerySnapshot($mockQuerySnapshot))
      .toEqual(['doc1', 'doc2']);
  });
});
