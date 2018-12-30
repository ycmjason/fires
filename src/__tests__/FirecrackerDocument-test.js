import { FirecrackerDocument } from '..';

jest.mock('firebase');
import { firestore } from 'firebase';

jest.mock('../FirecrackerTransformers/transformDocumentSnapshot');
import transformDocumentSnapshot from '../FirecrackerTransformers/transformDocumentSnapshot';

jest.mock('../FirecrackerTransformers/transformDocumentRef');
import transformDocumentRef from '../FirecrackerTransformers/transformDocumentRef';

import { when } from 'jest-when';

describe('FirecrackerDocument', () => {
  describe('FirecrackerCollection.from', () => {
    it('FirecrackerCollection.from($docRef)', async () => {
      const $mockDocRef = new firestore.DocumentReference();

      when(transformDocumentRef)
        .calledWith($mockDocRef)
        .mockResolvedValue('document');

      expect(await FirecrackerDocument.from($mockDocRef)).toBe('document');
    });

    it('FirecrackerCollection.from($docSnapshot)', async () => {
      const $mockDocSnapshot = new firestore.DocumentSnapshot();

      when(transformDocumentSnapshot)
        .calledWith($mockDocSnapshot)
        .mockResolvedValue('document');

      expect(await FirecrackerDocument.from($mockDocSnapshot)).toBe('document');
    });
  });

  it('firecrackerDocument.update(data)', async () => {
    const $mockDocRef = new firestore.DocumentReference();

    when(transformDocumentRef)
      .calledWith($mockDocRef)
      .mockResolvedValue('updated doc');

    const doc= new FirecrackerDocument({
      $ref: $mockDocRef,
      $metadata: {},
      data: { a: 3 },
    });

    const newDocument = await doc.update({ a: 4 });
    expect(newDocument).toBe('updated doc');
  });

  it('firecrackerDocument.delete()', async () => {
    const $mockDocRef = new firestore.DocumentReference();

    const doc= new FirecrackerDocument({
      $ref: $mockDocRef,
      $metadata: {},
      data: { a: 3 },
    });

    await doc.delete();
    expect($mockDocRef.delete).toHaveBeenCalled();
  });

  describe('firecrackerDocument.subscribe', () => {
    describe('firecrackerDocument._subscribe(onNext, onError)', () => {
      it('should call onNext', async done => {
        const $mockDocRef = new firestore.DocumentReference();

        $mockDocRef.onSnapshot.mockImplementation((options, onNext, onError) => {
          onNext('$nextMockDocSnapshot');
        });

        when(transformDocumentSnapshot)
          .calledWith('$nextMockDocSnapshot')
          .mockResolvedValue('document');

        new FirecrackerDocument({
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

        new FirecrackerDocument({
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

    it('firecrackerDocument.subscribe(onNext, onError)', () => {
      const $mockDocRef = new firestore.DocumentReference();
      const doc = new FirecrackerDocument({
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

    it('firecrackerDocument.subscribeIncludingMetadata(onNext, onError)', () => {
      const $mockDocRef = new firestore.DocumentReference();
      const doc = new FirecrackerDocument({
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
