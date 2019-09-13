jest.mock('../../$firestore');
import firestore from '../../$firestore';

jest.mock('../transformDocumentRef');
import transformDocumentRef from '../transformDocumentRef';

import { when } from 'jest-when';
import transformDocumentData from '../_transformDocumentData';

describe('transformDocumentData', () => {
  it('should not alter normal objects', async () => {
    const $mockDocData = {
      a: 3,
      hello: 'world !!!',
      amazing: false,
      cheat: 'how do you turn this on',
    };

    expect(await transformDocumentData($mockDocData)).toEqual($mockDocData);
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

    expect(await transformDocumentData($mockDocData)).toEqual($mockDocData);
  });

  it('should not alter normal objects', async () => {
    const $mockDocData = {
      a: 3,
      hello: 'world !!!',
      amazing: false,
      cheat: 'how do you turn this on',
    };

    expect(await transformDocumentData($mockDocData)).toEqual($mockDocData);
  });

  it('should be expend DocumentReference', async () => {
    const $mockDocRef = new firestore.DocumentReference();

    when(transformDocumentRef)
      .calledWith($mockDocRef)
      .mockResolvedValue({
        yo: 'hihi',
      });

    expect(
      await transformDocumentData({
        a: $mockDocRef,
        hello: 'world !!!',
      }),
    ).toEqual({
      a: {
        yo: 'hihi',
      },
      hello: 'world !!!',
    });
  });

  it('should be transform firestore.Timestamp to Date', async () => {
    const $mockTimestamp = new firestore.Timestamp();
    $mockTimestamp.toDate.mockReturnValue('Date');

    expect(
      await transformDocumentData({
        created: $mockTimestamp,
      }),
    ).toEqual({
      created: 'Date',
    });
  });

  it('should be transform each value in an array individually', async () => {
    const $mockTimestamp = new firestore.Timestamp();
    $mockTimestamp.toDate.mockReturnValue('Date');

    const $mockDocRef = new firestore.DocumentReference();

    when(transformDocumentRef)
      .calledWith($mockDocRef)
      .mockResolvedValue({
        yo: 'hihi',
      });

    expect(
      await transformDocumentData({
        mixed: [0, 'string', true, '', $mockTimestamp, $mockDocRef, { a: 3 }],
      }),
    ).toEqual({
      mixed: [0, 'string', true, '', 'Date', { yo: 'hihi' }, { a: 3 }],
    });
  });
});
