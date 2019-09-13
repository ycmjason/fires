import firestore from '../$firestore';
import { aMapValues } from '../utils';
import transformDocumentRef from './transformDocumentRef';

const transformValue = async v => {
  if (v instanceof firestore.DocumentReference) {
    return await transformDocumentRef(v);
  }

  if (v instanceof firestore.Timestamp) {
    return v.toDate();
  }

  if (Array.isArray(v)) {
    return await Promise.all(v.map(transformValue));
  }

  if (typeof v === 'object') {
    return await transformDocumentData(v);
  }

  return v;
};

const transformDocumentData = async $docData => {
  return await aMapValues($docData, transformValue);
};

export default transformDocumentData;
