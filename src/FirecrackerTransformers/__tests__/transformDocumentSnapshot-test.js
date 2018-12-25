import { when } from 'jest-when';

jest.mock('../_transformDocumentData');
import transformDocumentData from '../_transformDocumentData';

jest.mock('../../FirecrackerDocument');
import FirecrackerDocument from '../../FirecrackerDocument';

import transformDocumentSnapshot from '../transformDocumentSnapshot';

describe('transformDocumentSnapshot', () => {
  it('sould return a document', async () => {
    const $mockDocSnapshot = {
      ref: '$documentRef',
      data: jest.fn().mockReturnValue('$docData'),
    };

    when(transformDocumentData)
      .calledWith('$docData')
      .mockResolvedValue('documentData');

    FirecrackerDocument.mockImplementation(({ $ref, data }) => {
      if ($ref === '$documentRef' && data === 'documentData') {
        return { type: 'document' };
      }
      return {};
    });

    expect(await transformDocumentSnapshot($mockDocSnapshot))
      .toEqual({ type: 'document' });
  });
});
