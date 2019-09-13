import { when } from 'jest-when';

jest.mock('../$firestore');
import firestore from '../$firestore';

jest.mock('../Fires');
import fires, { Fires } from '..';

describe('fires (entry)', () => {
  it('should return a FiresCollection', () => {
    when(firestore)
      .calledWith()
      .mockReturnValue('$mockFirestore');

    Fires.mockImplementation($collection => {
      if ($collection === '$mockFirestore') {
        return { type: 'mockFires' };
      }
      return {};
    });

    expect(fires()).toEqual({ type: 'mockFires' });
  });

  it('should return the same FiresCollection for subsequent calls', () => {
    when(firestore)
      .calledWith()
      .mockReturnValue('$mockFirestore');

    Fires.mockImplementation($collection => {
      if ($collection === '$mockFirestore') {
        return { type: 'mockFires' };
      }
      return {};
    });

    const firecracke1 = fires();
    const firecracke2 = fires();
    const firecracke3 = fires();
    expect(firecracke1).toBe(firecracke2);
    expect(firecracke2).toBe(firecracke3);
  });
});
