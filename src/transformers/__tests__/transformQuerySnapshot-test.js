import { when } from 'jest-when';

jest.mock('../../FiresDocument');
import FiresDocument from '../../FiresDocument';

import transformQuerySnapshot from '../transformQuerySnapshot';

describe('FirecrackerTransformers.transformQuerySnapshot', () => {
  it('should return a list of dcouments with $metadata', async () => {
    const $mockQuerySnapshot = {
      docs: ['$doc1', '$doc2'],
      metadata: '$metadata',
    };

    when(FiresDocument.from)
      .calledWith('$doc1')
      .mockResolvedValue('doc1');

    when(FiresDocument.from)
      .calledWith('$doc2')
      .mockResolvedValue('doc2');

    expect(await transformQuerySnapshot($mockQuerySnapshot)).toEqual(
      (() => {
        const expectedDocs = ['doc1', 'doc2'];
        expectedDocs.$metadata = '$metadata';
        return expectedDocs;
      })(),
    );
  });
});
