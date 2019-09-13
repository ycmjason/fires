import { when } from 'jest-when';

jest.mock('../_transformDocumentData');
import transformDocumentData from '../_transformDocumentData';

jest.mock('../../FiresDocument');
import FiresDocument from '../../FiresDocument';

import transformDocumentSnapshot from '../transformDocumentSnapshot';

describe('transformDocumentSnapshot', () => {
  it('sould return a document', async () => {
    const $mockDocSnapshot = {
      ref: '$documentRef',
      data: jest.fn().mockReturnValue('$docData'),
      metadata: '$metadata',
      exists: true,
    };

    when(transformDocumentData)
      .calledWith('$docData')
      .mockResolvedValue('documentData');

    FiresDocument.mockImplementation(({ $ref, data, $metadata }) => {
      if (($ref, '$documentRef' && data === 'documentData' && $metadata === '$metadata')) {
        return { type: 'document' };
      }
      return {};
    });

    expect(await transformDocumentSnapshot($mockDocSnapshot)).toEqual({ type: 'document' });
  });

  it('should return null if the $docSnapshot does not exists', async () => {
    const $mockDocSnapshot = { exists: false };

    expect(await transformDocumentSnapshot($mockDocSnapshot)).toEqual(null);
  });
});
