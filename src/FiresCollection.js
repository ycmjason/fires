import FiresDocument from './FiresDocument';
import { executeQuery, transformQuerySnapshot } from './transformers';
import serverTimestamp from './fieldValues/serverTimestamp';

const prepareToBeInsertedDocument = doc => {
  const d = { ...doc };

  d.$created = serverTimestamp();
  d.$updated = serverTimestamp();

  return d;
};

export default class FiresCollection {
  constructor($collection) {
    this.$collection = $collection;
  }

  // CREATE
  async create(doc) {
    const $docRef = await this.$collection.add(prepareToBeInsertedDocument(doc));
    return await FiresDocument.from($docRef);
  }

  async createWithId(id, doc) {
    const { $collection } = this;
    const $docRef = this.$collection.doc(id);

    const $docSnapshot = await $docRef.get();
    if ($docSnapshot.exists) {
      throw Error(`${$collection.id}.${id} already exists`);
    }

    await $docRef.set(prepareToBeInsertedDocument(doc));
    return await FiresDocument.from($docRef);
  }

  // READ
  async findById(id) {
    const $docRef = this.$collection.doc(id);
    return await FiresDocument.from($docRef);
  }

  async findOne(queryObj) {
    const $query = _where(this.$collection, queryObj).limit(1);
    const docs = await executeQuery($query);
    return docs[0] || null;
  }

  async findAll() {
    return await this.find();
  }

  async find(queryObj) {
    // CollectionRef extends Query
    const $query = _where(this.$collection, queryObj);
    return await executeQuery($query);
  }

  // SUBSCRIBE
  subscribe(...args) {
    const { queryObj, onNext, onError } = _parseSubscribeArgs(...args);
    const $query = _where(this.$collection, queryObj);
    return this._subscribe({
      $query,
      options: {},
      onNext,
      onError,
    });
  }

  subscribeIncludingMetadata(...args) {
    const { queryObj, onNext, onError } = _parseSubscribeArgs(...args);
    const $query = _where(this.$collection, queryObj);
    return this._subscribe({
      $query,
      options: { includeMetadataChanges: true },
      onNext,
      onError,
    });
  }

  _subscribe({ $query, options, onNext, onError }) {
    return $query.onSnapshot(
      options,
      async $querySnapshot => {
        const docs = await transformQuerySnapshot($querySnapshot);
        return onNext(docs);
      },
      err => {
        if (!onError) throw err;
        onError(err);
      },
    );
  }
}

const _parseSubscribeArgs = (queryObjOrOnNext, onNextOrOnError, onError) => {
  if (typeof queryObjOrOnNext === 'object') {
    return {
      queryObj: queryObjOrOnNext,
      onNext: onNextOrOnError,
      onError,
    };
  }

  if (typeof queryObjOrOnNext === 'function') {
    return {
      queryObj: undefined,
      onNext: queryObjOrOnNext,
      onError: onNextOrOnError,
    };
  }

  throw Error(
    'Unexpected error. Please check the arguments of subscribe or subscribeIncludingMetadata',
  );
};

const _where = ($query, queryObj) => {
  let $q = $query;
  for (const [field, operator, value] of _parseQueryObj(queryObj)) {
    $q = $q.where(field, operator, value);
  }
  return $q;
};

const _parseQueryObj = (queryObj = {}) => {
  const parseQueryEntry = (field, query) => {
    if (['boolean', 'string', 'number'].includes(typeof query)) {
      return [[field, '==', query]];
    }

    if (Array.isArray(query)) {
      const operator = query[0];
      if (['<', '<=', '==', '>', '>=', 'array-contains'].includes(operator)) {
        const [operator, value] = query;
        return [[field, operator, value]];
      } else if (operator === '!=') {
        const value = query[1];
        return [[field, '<', value], [field, '>', value]];
      } else if (/^range[[(][)\]]$/.test(operator)) {
        const [operator, start, end] = query;
        const inclusiveStart = /^range\[/.test(operator);
        const inclusiveEnd = /\]$/.test(operator);
        return [
          [field, inclusiveStart ? '>=' : '>', start],
          [field, inclusiveEnd ? '<=' : '<', end],
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
