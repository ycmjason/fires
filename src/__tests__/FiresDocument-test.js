import { when } from 'jest-when';

import { FiresDocument } from '..';

jest.mock('../$firestore');
import firestore from '../$firestore';

jest.mock('../transformers/transformDocumentSnapshot');
import transformDocumentSnapshot from '../transformers/transformDocumentSnapshot';

jest.mock('../transformers/transformDocumentRef');
import transformDocumentRef from '../transformers/transformDocumentRef';

jest.mock('../fieldValues/serverTimestamp');
import serverTimestamp from '../fieldValues/serverTimestamp';

describe('FiresDocument', () => {
  describe('FiresCollection.from', () => {
    it('FiresCollection.from($docRef)', async () => {
      const $mockDocRef = new firestore.DocumentReference();

      when(transformDocumentRef)
        .calledWith($mockDocRef)
        .mockResolvedValue('document');

      expect(await FiresDocument.from($mockDocRef)).toBe('document');
    });

    it('FiresCollection.from($docSnapshot)', async () => {
      const $mockDocSnapshot = new firestore.DocumentSnapshot();

      when(transformDocumentSnapshot)
        .calledWith($mockDocSnapshot)
        .mockResolvedValue('document');

      expect(await FiresDocument.from($mockDocSnapshot)).toBe('document');
    });
  });

  it('firesDocument.update(data)', async () => {
    const $mockDocRef = new firestore.DocumentReference();

    serverTimestamp.mockReturnValue('now');

    when(transformDocumentRef)
      .calledWith($mockDocRef)
      .mockResolvedValue('updated doc');

    const doc = new FiresDocument({
      $ref: $mockDocRef,
      $metadata: {},
      data: { a: 3 },
    });

    const newDocument = await doc.update({ a: 4 });
    expect(newDocument).toBe('updated doc');
    expect($mockDocRef.update).toHaveBeenCalledWith({
      a: 4,
      $updated: 'now',
    });
  });

  it('firesDocument.delete()', async () => {
    const $mockDocRef = new firestore.DocumentReference();

    const doc = new FiresDocument({
      $ref: $mockDocRef,
      $metadata: {},
      data: { a: 3 },
    });

    await doc.delete();
    expect($mockDocRef.delete).toHaveBeenCalled();
  });

  describe('firesDocument.subscribe', () => {
    describe('firesDocument._subscribe(onNext, onError)', () => {
      it('should call onNext', async done => {
        const $mockDocRef = new firestore.DocumentReference();

        $mockDocRef.onSnapshot.mockImplementation((options, onNext, onError) => {
          onNext('$nextMockDocSnapshot');
        });

        when(transformDocumentSnapshot)
          .calledWith('$nextMockDocSnapshot')
          .mockResolvedValue('document');

        new FiresDocument({
          $ref: $mockDocRef,
          $metadata: {},
          data: { a: 3 },
        })._subscribe({
          $ref: $mockDocRef,
          options: {},
          onNext: doc => {
            expect(doc).toBe('document');
            done();
          },
        });
      });

      it('should call onError', async done => {
        const $mockDocRef = new firestore.DocumentReference();

        $mockDocRef.onSnapshot.mockImplementation((options, onNext, onError) => {
          onError('error');
        });

        new FiresDocument({
          $ref: $mockDocRef,
          $metadata: {},
          data: { a: 3 },
        })._subscribe({
          $ref: $mockDocRef,
          options: {},
          onError: err => {
            expect(err).toBe('error');
            done();
          },
        });
      });
    });

    it('firesDocument.subscribe(onNext, onError)', () => {
      const $mockDocRef = new firestore.DocumentReference();
      const doc = new FiresDocument({
        $ref: $mockDocRef,
        $metadata: {},
        data: { a: 3 },
      });
      doc._subscribe = jest.fn();

      const onNext = () => {};
      const onError = () => {};

      doc.subscribe(onNext, onError);
      expect(doc._subscribe).toHaveBeenCalledWith({
        $ref: $mockDocRef,
        options: {},
        onNext,
        onError,
      });
    });

    it('firesDocument.subscribeIncludingMetadata(onNext, onError)', () => {
      const $mockDocRef = new firestore.DocumentReference();
      const doc = new FiresDocument({
        $ref: $mockDocRef,
        $metadata: {},
        data: { a: 3 },
      });
      doc._subscribe = jest.fn();

      const onNext = () => {};
      const onError = () => {};

      doc.subscribeIncludingMetadata(onNext, onError);
      expect(doc._subscribe).toHaveBeenCalledWith({
        $ref: $mockDocRef,
        options: { includeMetadataChanges: true },
        onNext,
        onError,
      });
    });
  });
});
