import FiresDocument from '../FiresDocument';
import transformDocumentData from './_transformDocumentData';

export default async $snapshot => {
  if (!$snapshot.exists) return null;

  const $docData = $snapshot.data();

  return new FiresDocument({
    $ref: $snapshot.ref,
    $metadata: $snapshot.metadata,
    data: await transformDocumentData($docData),
  });
};
