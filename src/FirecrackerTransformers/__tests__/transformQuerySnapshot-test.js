import { when } from 'jest-when';

jest.mock('../../FirecrackerDocument');
import FirecrackerDocument from '../../FirecrackerDocument';

import transformQuerySnapshot from '../transformQuerySnapshot';

describe('FirecrackerTransformers.transformQuerySnapshot', () => {
  it ('should return a list of dcouments', async () => {
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
