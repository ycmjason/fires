import { when } from 'jest-when';

jest.mock('../transformQuerySnapshot');
import transformQuerySnapshot from '../transformQuerySnapshot';

import executeQuery from '../executeQuery';

describe('executeQuery', () => {
  it('should execute query', async () => {
    const $mockQuery = { get: jest.fn() };
    const $mockQuerySnapshot = { docs: ['$doc1', '$doc2'] };

    $mockQuery.get.mockResolvedValue($mockQuerySnapshot);

    when(transformQuerySnapshot)
      .calledWith($mockQuerySnapshot)
      .mockResolvedValue(['doc1', 'doc2']);

    expect(await executeQuery($mockQuery)).toEqual(['doc1', 'doc2']);
  });
});
