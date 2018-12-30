import { firestore } from 'firebase';
import Firecracker from './Firecracker';

export { default as FirecrackerCollection } from './FirecrackerCollection';
export { default as FirecrackerDocument } from './FirecrackerDocument';
export { Firecracker };

let firecrackerSingleton;

export default () => {
  if (firecrackerSingleton) return firecrackerSingleton;

  firecrackerSingleton = new Firecracker(firestore());
  return firecrackerSingleton;
};
