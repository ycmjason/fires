import Firecracker from '../Firecracker';
import * as admin from 'firebase-admin';

import serviceAccount from '../../firebaseServiceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://firecracker-test-17604.firebaseio.com',
});

describe('Firecracker', () => {
  it('should be defined', () => {
    expect(Firecracker).toBeDefined();
  });
});
