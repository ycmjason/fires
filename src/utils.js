export const mapValues = (xs, f) => {
  return fromEntries(Object.entries(xs).map(([k, v]) => [k, f(v)]));
};

export const aMapValues = async (xs, f) => {
  return fromEntries(await Promise.all(Object.entries(xs).map(async ([k, v]) => [k, await f(v)])));
};

export const fromEntries = entries => Object.assign({}, ...entries.map(([k, v]) => ({ [k]: v })));
