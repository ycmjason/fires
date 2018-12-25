import FirecrackerDocument from '../FirecrackerDocument';
import transformDocumentData from './_transformDocumentData';

export default async $snapshot => {
  const $docData = $snapshot.data();

  if (!$docData) return null;

  return new FirecrackerDocument({
    $ref: $snapshot.ref,
    data: await transformDocumentData($docData),
  });
};

