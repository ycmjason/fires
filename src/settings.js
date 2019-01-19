const settings = {
  autoTimestamps: false,
};

export default settings;

export const setSettings = (opts) => {
  Object.assign(settings, opts);
};
