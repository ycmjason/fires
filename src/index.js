import firestore from './$firestore';
import Fires from './Fires';
import settings from './settings';

export { default as FiresCollection } from './FiresCollection';
export { default as FiresDocument } from './FiresDocument';
export { Fires };

let firesSingleton;

const fires = () => {
  if (firesSingleton) return firesSingleton;

  firesSingleton = new Fires(firestore());
  return firesSingleton;
};

fires.settings = (opts) => {
  Object.assign(settings, opts);
};

export default fires;
