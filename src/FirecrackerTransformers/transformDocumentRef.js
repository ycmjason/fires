import transformDocumentSnapshot from './transformDocumentSnapshot';

export default async $docRef => {
  return await transformDocumentSnapshot(await $docRef.get());
};
