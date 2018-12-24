export const aMapValues = async (xs, f) => {
  return fromEntries(
    await Promise.all(
      Object.entries(xs).map(async ([k, v]) => [k, await f(v)])
    )
  );
};

export const fromEntries = (entries) => Object.assign(
  {},
  ...entries.map(([k, v]) => ({[k]: v})),
);
