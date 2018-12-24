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

  async find (queryObj) {
    let $query = this.$collection;
    for (const [field, operator, value] of parseQueryObj(queryObj)) {
      $query = $query.where(field, operator, value);
    }
    return await executeQuery($query);
  }

  // SUBSCRIBE
  async subscribe (fn) {
    return this.$collection.onSnapshot(async $querySnapshot => {
      const docs = await transformQuerySnapshot($querySnapshot);
      return fn(docs);
    });
  }

  async subscribeIncludingMetadata (fn) {
    return this.$collection.onSnapshot(
      { includeMetadataChanges: true },
      async $querySnapshot => {
        const docs = await transformQuerySnapshot($querySnapshot);
        return fn(docs, $querySnapshot.metadata);
      },
    );
  }
}

const transformQuerySnapshot = async $querySnapshot => {
  return await Promise.all(
    $querySnapshot.docs.map(FirecrackerDocument.from)
  );
};

const executeQuery = async $query => {
  const $querySnapshot = await $query.get();
  return await transformQuerySnapshot($querySnapshot);
};

const parseQueryObj = queryObj => {
  const parseQueryEntry = (field, query) => {
    if (['boolean', 'string', 'number'].includes(typeof query)) {
      return [[field, '==', query]];
    }

    if (Array.isArray(query)) {
      const operator = query[0];
      if (['<', '<=', '==', '>', '>=', 'array-contains'].includes(operator)) {
        const [operator, value] = query;
        return [[field, operator, value]];
      } else if (/^range[[(][)\]]$/.test(operator)) {
        const [operator, start, end] = query;
        const inclusiveStart = /^range\[/.test(operator);
        const inclusiveEnd = /\]$/.test(operator);
        return [
          [field, inclusiveStart ? '>=': '>', start],
          [field, inclusiveEnd ? '<=': '<', end],
        ];
      }

      throw Error(`Unknown operator ${operator}.`);
    }

    if (typeof query === 'object') {
      return parseQueryObj(query).map(([subfield, operator, value]) => {
        return [`${field}.${subfield}`, operator, value];
      });
    }

    throw Error(`Unsupported ${query}.`);
  };

  let queries = [];
  for (const [field, query] of Object.entries(queryObj)) {
    queries = queries.concat(parseQueryEntry(field, query));
  }
  return queries;
};
