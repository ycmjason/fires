// const getServerTimestamp = () => firestore.FieldValue.serverTimestamp();
export default () => {
  // TODO: use proxy to allow intuitive API:
  //   Firecracker.[collectionName] -> Proxy -> FirecrackerCollection
  //   Firecracker.[collectionName].[documentId] -> FirecrackerDocument
};
