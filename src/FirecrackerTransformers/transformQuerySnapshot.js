import FirecrackerDocument from '../FirecrackerDocument';

export default async $querySnapshot => {
  return await Promise.all(
    $querySnapshot.docs.map(FirecrackerDocument.from)
  );
};
