import FirecrackerDocument from './FirecrackerDocument';

export default class FirecrackerCollection {
  constructor ($collection) {
    this.$collection = $collection;
  }

  // CREATE
  async create (doc) {
    const $docRef = await this.$collection.add(doc);
    return await FirecrackerDocument.from($docRef);
  }

  async createWithId (id, doc) {
    const $docRef = this.$collection.doc(id);
    await $docRef.set(doc);
    return await FirecrackerDocument.from($docRef);
  }

  // READ
  async findById (id) {
    const $docRef = this.$collection.doc(id);
    return await FirecrackerDocument.from($docRef);
  }

  async findAll () {
    // CollectionReference extends Query
    return await executeQuery(this.$collection);
  }

  async find (field, operator, value) {
    const $query = this.$collection.where(field, operator, value);
    return await executeQuery($query);
  }
}

const executeQuery = async $query => {
  const $querySnapshot = await $query.get();
  return await FirecrackerDocument.from($querySnapshot.docs);
};
