# Firecracker

[![Build Status](https://travis-ci.com/ycmjason/firecracker.svg?branch=master)](https://travis-ci.com/ycmjason/firecracker)
[![codecov](https://codecov.io/gh/ycmjason/firecracker/branch/master/graph/badge.svg)](https://codecov.io/gh/ycmjason/firecracker)

Firestore simplified.

## Why?

Firestore is powerful and robust with high level of flexibility. However, I personally find the official API overly-complicated for simple operations.

For example, let's take a look at the following code for retrieving a single document.

```js
const db = firebase.firestore();
const collectionReference = db.collection('cities');
const documentReference = collectionReference.doc('LA');
const documentSnapshot = await documentReference.get();
const documentData = documentSnapshot.data();
/* after 4 operations, we finally get our data!
 *   {
 *       name: "Los Angeles",
 *       state: "CA",
 *       country: "USA"
 *   }
 */
```

As illustrated above, in order to retrieve a single document, 4 unintuitive steps are involved: `CollectionReference > DocumentReference > DocumentSnapshot > DocumentData`.

Firestore API is highly flexible. It takes care of many use cases; allowing developers to do all sorts of optimisation. However, this flexibility comes at a cost of DX (developer experience) as illustrated previously how a presumably simple operation requires 4 unintuitive steps.

Firecracker aims to improve the developer experience by exposing a very intuitive and relatively simple API (merely 3 classes). It hides most of the complexity from the Firestore API, allowing developers to focus on the data. Hoever this also sacrifices some of the flexibility the original Firestore API provides.

Conceptually, retriving a document from a collection should be as simple as `Collection -> Document`. This is exactly what you will do with Firecracker:

```js
const db = firecracker();
const collection = db.collection('cities');
const doc = await collection.findById('LA');
/* {
 *     name: "Los Angeles",
 *     state: "CA",
 *     country: "USA"
 * }
 */
```

For a more detailed API documentation, please see below.

## Install

```
npm i @ycm.jason/firecracker
```

## API Documentation

There are *3 and only 3* classes in Firecracker.
1. `Firecracker`
2. `FirecrackerCollection`
3. `FirecrackerDocument`

### 1. Firecracker

#### firecracker(): Firecracker

This method returns a `Firecracker` instance representing the database (`db`). You will need to import the `firebase/firestore` module yourself. It is also required to set `timestampsInSnapshots` to `true`. All subsequent calls will return the same instance of `Firecracker`.

Example:

```js
// Initialise Firebase
import firebase from 'firebase';
import 'firebase/firestore';

import firecracker from '@ycm.jason/firecracker';

// Initialise firebase
firebase.initializeApp({
  apiKey: '### FIREBASE API KEY ###',
  authDomain: '### FIREBASE AUTH DOMAIN ###',
  projectId: '### CLOUD FIRESTORE PROJECT ID ###'
});

// Disable deprecated features
firebase.firestore().settings({
  timestampsInSnapshots: true
});

const db = firecracker();

firecracker() === firecracker(); // true
```

#### db.collection(collectionName: String): FirecrackerCollection

This methods returns the collection with the `collectionName`. Subsequent calls with the same `collectionName` will return the same instance.

Example:

```js
const db = firecracker();
const collection = db.collection('countries');
```

### 2. FirecrackerCollection

#### collection.create(data: Object): Promise\<FirecrackerDocument\>

This method creates a new entry in the collection with the given `data` and returns a `Promise` that resolves to the document after it has been written to the backend.

Example:

```js
const db = firecracker();
const countries = db.collection('countries');
const hongKong = await countries.create({
  name: 'Hong Kong',
});
```

#### collection.createWithId(id: String, data: Object): Promise\<FirecrackerDocument\>

This method is the same as `collection.create` except it creates a new entry in the collection with the given `id`. If a document with the same `id` already existed, this function will throw an error.

Example:

```js
const db = firecracker();
const countries = db.collection('countries');
try {
  const hk = await countries.createWithId('HK', {
    name: 'Hong Kong',
  });
} catch (err) {
  // document might already exist
}
```

#### collection.findById(id: String): Promise\<FirecrackerDocument or null\>

This method returns a `Promise` that resolves to the document with `id` in `collection` if it exists, `null` otherwise.

Example:

```js
const db = firecracker();
const countries = db.collection('countries');
const hk = await countries.findById('HK');
if (hk === null) {
  // document with ID 'HK' does not exist
}
```

#### collection.findAll(): Promise\<[FirecrackerDocument]\>

This method returns a `Promise` that resolves to all documents in the `collection`. This is essentially equivalent to `collection.find({})`.

Example:

```js
const db = firecracker();
const countriesCollection = db.collection('countries');
const countries = await countriesCollection.findAll();
```

#### collection.find(queryObj: Object): Promise\<[FirecrackerDocument]\>

This method returns a `Promise` that resolves to all documents in the `collection` with each document meeting the criteria specified by the `queryObj`. 

Example:

```js
const db = firecracker();
const users = db.collection('users');
const specialUsers = await users.find({
  country: 'us', // equivilant to ['==', 'us']
  age: ['range[)', 21, 30], // denotes 21 <= age < 30
  friends: ['array-contains', firecrackerDocument],
  thirdParty: { // nested query is supported, you can also speify 'thirdParty.facebook' if you wish
    facebook: true, // equivilant to ['==', true]
  },
});
```

Each entry in the `queryObj` contains a key and value pair of `field` and `query`.

Multiple entries are called compound queries; they are combined with logical `AND`.  E.g. `await collection.find({ a: 3, b: 7})` will return all documents with `doc.a == 3 && doc.b == 7`.

There are 3 types of queries:

1. `value`, e.g. `'us'` which is equivilant to `['==', 'us']`
2. `[operator, value]`, e.g. `['>=', 21]`, `['array-contains', doc]`, ...
3. `[rangeOperator, value, value]`, e.g. `['range[]', 0, 5]`

All operators supported in [firestore query](https://firebase.google.com/docs/firestore/query-data/queries) are also supported, i.e. `<`, `<=`, `==`, `>`, `>=`, `array-contains`. An additional operator `!=` can also be used which means "not equals".

In addition to the firestore operators, firecracker also support a set of "range" operators:
- `range[]` - inclusive range, e.g. `{ age: ['range[]', 20, 50] }` denotes `20 <= age <= 50`
- `range()` - exclusive range, e.g. `{state: ['range()', 'CA', 'IN'] }` denotes `'CA' < state < 'IN'`
- `range[)` - inclusive start; exclusive end, e.g. `{ year: ['range[)', 1995, 2018] }` denotes `1995 <= year < 2018`
- `range(]` - exclusive start; inclusive end, e.g. `{ year: ['range(]', 1995, 2018] }` denotes `1995 < year <= 2018`

All rules and limitations applies to firestore query also applies here:

-  `!=` is implemented with both `<` and `>`. E.g. `a != 3` is expanded into `a < 3 && a > 3`.
- To combine the equality operator (`==`) with `<`, `<=`, `>`, `>=`, `!=`, `range` or `array_contains`, make sure to create a [composite index](https://firebase.google.com/docs/firestore/query-data/indexing).
- You can only perform range comparisons (`<`, `<=`, `>`, `>=`, `!=`, `range`) on a single field, and you can include at most one `array_contains` clause in a compound query.
-  Logical  `OR`  queries is not supported. In this case, you should do `collection.find` for each  `OR`  condition and merge the query results in your app.

#### collection.subscribe(?queryObj: Object, onNext: function, ?onError: function): function

This method subscribes to `collection`, returning an unsubscribe function.

If `queryObj` is provided, it only subscribes to documents meeting the criteria.

`onNext` will be invoked immediately, and whenever documents in `collection` are added/deleted/mutated.

Example:

```js
const db = firecracker();
const users = db.collection('users');
const unsubscribe = users.subscribe(
  allUsers => {
    // allUsers: [FirecrackerDocument]
  },
  err => {
    // optional: handle error
  },
);

// example with queryObj
users.subscribe(
  { country: 'us' }
  usUsers => {
    // usUsers: [FirecrackerDocument]
  },
  err => {
    // optional: handle error
  },
);
```

#### collection.subscribeIncludingMetadata(?queryObj: Object, onNext: function, ?onError: function): function

This method works the same as `collection.subscribe` except they also subscribes to metadata changes. This essentially set `includeMetadataChanges` to `true`. See [here](https://firebase.google.com/docs/reference/js/firebase.firestore.SnapshotListenOptions) for more information.

### 3. FirecrackerDocument

#### doc.update(data: Object): Promise\<FirecrackerDocument\>

This method updates specific fields in a document returning a `Promise` which resolves to a new document after writing to the backend.

Example:

```js
const db = firecracker();
const cars = db.collection('cars');
const tesla = await cars.findById('tesla'); // { color: 'black', type: 'electric' }
const newTesla = await tesla.update({ color: 'red' }); // { color: 'red', type: 'electric' }
```

#### doc.delete(): Promise\<undefined\>

This methods removes the document from the collection.

Example:

```js
const db = firecracker();
const cars = db.collection('cars');
const tesla = await cars.findById('tesla');
await tesla.delete();
```

#### doc.subscribe(onNext: function, onError: function): function

Same as `collection.subscribe` except `onNext` receives a single document instead of an array.

Example:

```js
const db = firecracker();
const animals = db.collection('animals');
const lion = await cars.findById('lion');
await lion.subscribe(
  nextLion => {
    // nextLion: FirecrackerDocument
  },
);
```
#### doc.subscribeIncludingMetadata(onNext: function, onError: function): function

This method works the same as `doc.subscribe` except they also subscribes to metadata changes. This essentially set `includeMetadataChanges` to `true`. See [here](https://firebase.google.com/docs/reference/js/firebase.firestore.SnapshotListenOptions) for more information.

## Author
Jason Yu
