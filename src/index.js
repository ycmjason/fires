import firestore from './$firestore';
import Fires from './Fires';
import { set as setSettings } from './settings';

export { default as FiresCollection } from './FiresCollection';
export { default as FiresDocument } from './FiresDocument';
export { Fires };

let firesSingleton;

const fires = () => {
  if (firesSingleton) return firesSingleton;

  firesSingleton = new Fires(firestore());
  return firesSingleton;
};

fires.settings = setSettings;

export default fires;
