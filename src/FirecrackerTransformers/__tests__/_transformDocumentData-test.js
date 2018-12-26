jest.mock('../transformDocumentRef');
import transformDocumentRef from '../transformDocumentRef';

import transformDocumentData from '../_transformDocumentData';

describe('transformDocumentData', () => {
  it('should not alter normal objects', async () => {
    const $mockDocData = {
      a: 3,
      hello: 'world !!!',
      amazing: false,
      cheat: 'how do you turn this on',
    };

    expect(await transformDocumentData($mockDocData))
      .toEqual($mockDocData);
  });

  it('should not alter nested objects', async () => {
    const $mockDocData = {
      a: {
        very: {
          nested: {
            kind: {
              of: {
                object: {
                  haha: 'LOL',
                  this: 'is',
                  very: 'deep',
                },
              },
            },
          },
        },
      },
      hello: 'world !!!',
      amazing: false,
      cheat: 'how do you turn this on',
    };

    expect(await transformDocumentData($mockDocData))
      .toEqual($mockDocData);
  });
});
