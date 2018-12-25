import FirecrackerDocument from './FirecrackerDocument';

export const executeQuery = async ($query) => {
  const $querySnapshot = await $query.get();
  return await transformQuerySnapshot($querySnapshot);
};

export const transformQuerySnapshot = async $querySnapshot => {
  return await Promise.all(
    $querySnapshot.docs.map(FirecrackerDocument.from)
  );
};
