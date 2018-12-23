export const aMapValues = async (xs, f) => {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(xs).map(async ([k, v]) => [k, await f(v)])
    )
  );
};
