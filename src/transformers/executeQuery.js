import transformQuerySnapshot from './transformQuerySnapshot';

export default async $query => {
  const $querySnapshot = await $query.get();
  return await transformQuerySnapshot($querySnapshot);
};
