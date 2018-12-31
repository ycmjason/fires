import { firestore } from 'firebase';
import Fires from './Fires';

export { default as FiresCollection } from './FiresCollection';
export { default as FiresDocument } from './FiresDocument';
export { Fires };

let firesSingleton;

export default () => {
  if (firesSingleton) return firesSingleton;

  firesSingleton = new Fires(firestore());
  return firesSingleton;
};
