import { when } from 'jest-when';

jest.mock('firebase');
import { firestore } from 'firebase';

jest.mock('../Firecracker');
import firecracker, { Firecracker } from '..';

describe('firecracker (entry)', () => {
  it('should return a FirecrackerCollection', () => {
    when(firestore)
      .calledWith()
      .mockReturnValue('$mockFirestore');

    Firecracker.mockImplementation(($collection) => {
      if ($collection === '$mockFirestore') {
        return { type: 'mockFirecracker' };
      }
      return {};
    });

    expect(firecracker()).toEqual({ type: 'mockFirecracker' });
  });

  it('should return the same FirecrackerCollection for subsequent calls', () => {
    when(firestore)
      .calledWith()
      .mockReturnValue('$mockFirestore');

    Firecracker.mockImplementation(($collection) => {
      if ($collection === '$mockFirestore') {
        return { type: 'mockFirecracker' };
      }
      return {};
    });

    const firecracke1 = firecracker();
    const firecracke2 = firecracker();
    const firecracke3 = firecracker();
    expect(firecracke1).toBe(firecracke2);
    expect(firecracke2).toBe(firecracke3);
  });
});
