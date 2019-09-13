# Fires

[![npm version](https://img.shields.io/npm/v/fires.svg?colorB=brightgreen)](https://www.npmjs.com/package/fires)
[![Build Status](https://travis-ci.com/ycmjason/fires.svg?branch=master)](https://travis-ci.com/ycmjason/fires)
[![codecov](https://codecov.io/gh/ycmjason/fires/branch/master/graph/badge.svg)](https://codecov.io/gh/ycmjason/fires)

Firestore simplified.

## Why?

Firestore is powerful and robust with high level of flexibility. I personally find the official API overly-complicated for simple operations.

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

As illustrated above, retrieving a single document involves 4 unintuitive steps: `CollectionReference > DocumentReference > DocumentSnapshot > DocumentData`.

Firestore API is highly flexible. It takes care of many use cases; allowing developers to do all sorts of optimisation. This flexibility comes at a cost of DX (developer experience) as illustrated previously how a presumably simple operation requires 4 unintuitive steps.

Fires aims to improve the developer experience by exposing a relatively more intuitive and simpler API (merely 3 classes). It hides most of the complexity from the Firestore API, allowing developers to focus on the data. However this also sacrifices some of the flexibility the original Firestore API provides.

Conceptually, retriving a document from a collection should be as simple as `Collection -> Document`. This is what you will do with Fires:

```js
const db = fires();
const collection = db.collection('cities');
const doc = await collection.findById('LA');
/* {
 * .   $id: "...",
 *     name: "Los Angeles",
 *     state: "CA",
 *     country: "USA"
 * }
 */
```

For a more detailed API documentation, please see below.

## Install

```
npm i fires
```

## Usage Overview

The following example demonstrates the basic CRUD operations with Fires.

```js
import firebase from 'firebase';
import 'firebase/firestore';

import fires from 'fires';

// Initialise firebase
firebase.initializeApp({
  apiKey: '### FIREBASE API KEY ###',
  authDomain: '### FIREBASE AUTH DOMAIN ###',
  projectId: '### CLOUD FIRESTORE PROJECT ID ###',
});

const db = fires();
const people = db.collection('people');

// Create
let peter = await people.create({
  name: 'Peter',
  age: 30,
});
// peter: { $id: "...", name: "Peter", age: 30, $created: Date, $updated: Date }

// Read
const adults = await people.find({
  age: ['>=', 18],
});
// adults: [ { $id: "...", name: "Peter", age: 30, $created: Date, $updated: Date}, ... ]

// Update
peter = await peter.update({ age: 40 });
// peter: { $id: "...", name: "Peter", age: 40, $created: Date, $updated: Date }

// Delete
await peter.delete();

// Subscribe
people.subscribe(
  ppl => {
    // ppl: [ { $id: "...", name: "Mary", age: 10, $created: Date, $updated: Date }, ... ]
  },
  err => {
    // ...
  },
);

people.subscribe(
  {
    age: ['<', 18],
  },
  children => {
    // children: [ { $id: "...", name: "Mary", age: 10, $created: Date, $updated: Date }, ... ]
  },
  err => {
    // ...
  },
);
```

## API Documentation

The **3 and only 3** classes in Fires.

1. `Fires`
2. `FiresCollection`
3. `FiresDocument`

### 1. Fires

#### fires(): Fires

This method returns a `Fires` instance representing the database (`db`). You will need to import the `firebase/firestore` module yourself. It is also required to set `timestampsInSnapshots` to `true`. All subsequent calls will return the same instance of `Fires`.

Example:

```js
import firebase from 'firebase';
import 'firebase/firestore';

import fires from '@ycm.jason/fires';

// Initialise firebase
firebase.initializeApp({
  apiKey: '### FIREBASE API KEY ###',
  authDomain: '### FIREBASE AUTH DOMAIN ###',
  projectId: '### CLOUD FIRESTORE PROJECT ID ###',
});

const db = fires();

fires() === fires(); // true
```

#### db.collection(collectionName: String): FiresCollection

This methods returns the collection with the `collectionName`. Subsequent calls with the same `collectionName` will return the same instance.

Example:

```js
const db = fires();
const collection = db.collection('countries');
```

### 2. FiresCollection

#### collection.create(data: Object): Promise\<FiresDocument\>

This method creates a new entry in the collection with the given `data` and returns a `Promise` that resolves to the document after it has been written to the backend.

Example:

```js
const db = fires();
const countries = db.collection('countries');
const hongKong = await countries.create({
  name: 'Hong Kong',
});
```

#### collection.createWithId(id: String, data: Object): Promise\<FiresDocument\>

This method is the same as `collection.create` except it creates a new entry in the collection with the given `id`. If a document with the same `id` already existed, this function will throw an error.

Example:

```js
const db = fires();
const countries = db.collection('countries');
try {
  const hk = await countries.createWithId('HK', {
    name: 'Hong Kong',
  });
} catch (err) {
  // document might already exist
}
```

#### collection.findById(id: String): Promise\<FiresDocument or null\>

This method returns a `Promise` that resolves to the document with `id` in `collection` if it exists, `null` otherwise.

Example:

```js
const db = fires();
const countries = db.collection('countries');
const hk = await countries.findById('HK');
if (hk === null) {
  // document with ID 'HK' does not exist
}
```

#### collection.findOne(queryObj: Object): Promise\<FiresDocument or null\>

This method returns a `Promise` that resolves to a document meeting the criteria of `queryObj` in `collection` if it exists, `null` otherwise.

Example:

```js
const db = fires();
const countries = db.collection('countries');
const hk = await countries.findOne({ name: 'Hong Kong' });
if (hk === null) {
  // document with ID 'HK' does not exist
}
```

#### collection.findAll(): Promise\<[FiresDocument]\>

This method returns a `Promise` that resolves to all documents in the `collection`. This is equivalent to `collection.find({})`.

Example:

```js
const db = fires();
const countriesCollection = db.collection('countries');
const countries = await countriesCollection.findAll();
```

#### collection.find(queryObj: Object): Promise\<[FiresDocument]\>

This method returns a `Promise` that resolves to all documents in the `collection` with each document meeting the criteria specified by the `queryObj`.

Example:

```js
const db = fires();
const users = db.collection('users');
const specialUsers = await users.find({
  country: 'us', // equivilant to ['==', 'us']
  age: ['range[)', 21, 30], // denotes 21 <= age < 30
  friends: ['array-contains', firesDocument],
  thirdParty: {
    // nested query is supported, you can also speify 'thirdParty.facebook' if you wish
    facebook: true, // equivilant to ['==', true]
  },
});
```

Each entry in the `queryObj` contains a key and value pair of `field` and `query`.

Multiple entries are implemented as compound queries; they are combined with logical `AND`. E.g. `await collection.find({ a: 3, b: 7})` will return all documents with `doc.a == 3 && doc.b == 7`.

There are 3 types of queries:

1. `value`, e.g. `'us'` which is equivilant to `['==', 'us']`
2. `[operator, value]`, e.g. `['>=', 21]`, `['array-contains', doc]`, ...
3. `[rangeOperator, value, value]`, e.g. `['range[]', 0, 5]`

All operators supported in [firestore query](https://firebase.google.com/docs/firestore/query-data/queries) are also supported, i.e. `<`, `<=`, `==`, `>`, `>=`, `array-contains`. An additional operator `!=` can also be used which means "not equals".

In addition to the firestore operators, fires also support a set of "range" operators:

- `range[]` - inclusive range, e.g. `{ age: ['range[]', 20, 50] }` denotes `20 <= age <= 50`
- `range()` - exclusive range, e.g. `{state: ['range()', 'CA', 'IN'] }` denotes `'CA' < state < 'IN'`
- `range[)` - inclusive start; exclusive end, e.g. `{ year: ['range[)', 1995, 2018] }` denotes `1995 <= year < 2018`
- `range(]` - exclusive start; inclusive end, e.g. `{ year: ['range(]', 1995, 2018] }` denotes `1995 < year <= 2018`

All rules and limitations applies to firestore query also applies here:

- `!=` is implemented with both `<` and `>`. E.g. `a != 3` is expanded into `a < 3 && a > 3`.
- To combine the equality operator (`==`) with `<`, `<=`, `>`, `>=`, `!=`, `range` or `array_contains`, make sure to create a [composite index](https://firebase.google.com/docs/firestore/query-data/indexing).
- You can only perform range comparisons (`<`, `<=`, `>`, `>=`, `!=`, `range`) on a single field, and you can include at most one `array_contains` clause in a compound query.
- Logical `OR` queries is not supported. In this case, you should do `collection.find` for each `OR` condition and merge the query results in your app.

#### collection.subscribe(?queryObj: Object, onNext: function, ?onError: function): function

This method subscribes to `collection`, returning an unsubscribe function.

If `queryObj` is provided, it only subscribes to documents meeting the criteria.

`onNext` will be invoked immediately, and whenever documents in `collection` are added/deleted/mutated.

Example:

```js
const db = fires();
const users = db.collection('users');
const unsubscribe = users.subscribe(
  allUsers => {
    // allUsers: [FiresDocument]
  },
  err => {
    // optional: handle error
  },
);

// example with queryObj
users.subscribe(
  { country: 'us' }
  usUsers => {
    // usUsers: [FiresDocument]
  },
  err => {
    // optional: handle error
  },
);
```

#### collection.subscribeIncludingMetadata(?queryObj: Object, onNext: function, ?onError: function): function

This method works the same as `collection.subscribe` except they also subscribes to metadata changes. This essentially set `includeMetadataChanges` to `true`. See [here](https://firebase.google.com/docs/reference/js/firebase.firestore.SnapshotListenOptions) for more information.

### 3. FiresDocument

#### doc.update(data: Object): Promise\<FiresDocument\>

This method updates specific fields in a document returning a `Promise` which resolves to a new document after writing to the backend.

Example:

```js
const db = fires();
const cars = db.collection('cars');
const tesla = await cars.findById('tesla'); // { color: 'black', type: 'electric' }
const newTesla = await tesla.update({ color: 'red' }); // { color: 'red', type: 'electric' }
```

#### doc.delete(): Promise\<undefined\>

This methods removes the document from the collection.

Example:

```js
const db = fires();
const cars = db.collection('cars');
const tesla = await cars.findById('tesla');
await tesla.delete();
```

#### doc.subscribe(onNext: function, onError: function): function

Same as `collection.subscribe` except `onNext` receives a single document instead of an array.

Example:

```js
const db = fires();
const animals = db.collection('animals');
const lion = await cars.findById('lion');
await lion.subscribe(nextLion => {
  // nextLion: FiresDocument
});
```

#### doc.subscribeIncludingMetadata(onNext: function, onError: function): function

This method works the same as `doc.subscribe` except they also subscribes to metadata changes. This essentially set `includeMetadataChanges` to `true`. See [here](https://firebase.google.com/docs/reference/js/firebase.firestore.SnapshotListenOptions) for more information.

## Author

Jason Yu<Paste>
