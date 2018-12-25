import firebase from 'firebase';
import { aMapValues } from './utils';
import transformDocumentRef from './transformDocumentRef';

const transformDocumentData = async $docData => {
  const transformValue = async v => {
    if (v instanceof firebase.firestore.DocumentReference) {
      return await transformDocumentRef(v);
    }

    if (v instanceof firebase.firestore.Timestamp) {
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

  return await aMapValues($docData, transformValue);
};

export default transformDocumentData;
