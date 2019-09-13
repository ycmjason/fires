import { when } from 'jest-when';

jest.mock('../transformDocumentSnapshot');
import transformDocumentSnapshot from '../transformDocumentSnapshot';

import transformDocumentRef from '../transformDocumentRef';

describe('transformDocumentRef', () => {
  it('should return a document', async () => {
    const $mockDocRef = { get: jest.fn().mockResolvedValue('$documentSnapshot') };

    when(transformDocumentSnapshot)
      .calledWith('$documentSnapshot')
      .mockResolvedValue('document');

    expect(await transformDocumentRef($mockDocRef)).toEqual('document');
  });
});
