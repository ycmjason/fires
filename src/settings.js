const INITIAL_SETTINGS = {
  autoTimestamps: false
};

const settings = { ...INITIAL_SETTINGS };

export const set = opts => Object.assign(settings, opts);

export const reset = () => Object.assign(settings, INITIAL_SETTINGS);

export default settings;
