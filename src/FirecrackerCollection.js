import FirecrackerDocument from './FirecrackerDocument';
import { executeQuery, transformQuerySnapshot } from './FirecrackerTransformers';

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
    for (const [field, operator, value] of _parseQueryObj(queryObj)) {
      $query = $query.where(field, operator, value);
    }
    return await executeQuery($query);
  }

  // SUBSCRIBE
  subscribe (onNext, onError) {
    const { $collection } = this;
    return _subscribe({
      $collection,
      onNext,
      onError,
    });
  }

  subscribeIncludingMetadata (onNext, onError) {
    const { $collection } = this;
    return _subscribe({
      $collection,
      options: { includeMetadataChanges: true },
      onNext,
      onError,
    });
  }
}

const _subscribe = ({ $collection, options = {}, onNext, onError }) => {
  return $collection.onSnapshot(
    options,
    async $querySnapshot => {
      const docs = await transformQuerySnapshot($querySnapshot);
      return onNext(docs, $querySnapshot.metadata);
    },
    err => {
      if (!onError) throw err;
      onError(err);
    },
  );
};

const _parseQueryObj = queryObj => {
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
      return _parseQueryObj(query).map(([subfield, operator, value]) => {
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
