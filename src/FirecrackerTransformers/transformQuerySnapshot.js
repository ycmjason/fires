import FirecrackerDocument from '../FirecrackerDocument';

export default async $querySnapshot => {
  const docs = await Promise.all(
    $querySnapshot.docs.map(FirecrackerDocument.from)
  );

  docs.$metadata = $querySnapshot.metadata;

  return docs;
};
