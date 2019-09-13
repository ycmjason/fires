import FiresDocument from '../FiresDocument';

export default async $querySnapshot => {
  const docs = await Promise.all($querySnapshot.docs.map(FiresDocument.from));

  docs.$metadata = $querySnapshot.metadata;

  return docs;
};
