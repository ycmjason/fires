import { aMapValues, fromEntries } from '../utils';

describe('utils', () => {
  describe('aMapValues', () => {
    it('should return Proise that reolve when all map to values finishes', async () => {
      expect(
        await aMapValues(
          {
            size: 30,
            taste: 1,
          },
          async n => n + 1,
        ),
      ).toEqual({
        size: 31,
        taste: 2,
      });
    });
  });

  describe('fromEntries', () => {
    it('should build object from entries', () => {
      expect(fromEntries([['size', 31], ['what', true]])).toEqual({
        size: 31,
        what: true,
      });
    });
  });
});
