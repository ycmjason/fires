# Firecracker

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

Firecracker aims to improve the developer experience by exposing a very intuitive and relatively simple API (merely 3 classes). It hides some of the complexity from the Firestore API, allowing developers to focus on the data. Hoever this also loses some of the flexibility that the original Firestore API provides.

Conceptually, retriving a document from a collection should be as simple as `Collection -> Document`. This is exactly what you will do with Firecracker:

```js
const db = firecracker();
const collection = db.collection('cities');
const document = collection.findById('LA');
/* {
 *     name: "Los Angeles",
 *     state: "CA",
 *     country: "USA"
 * }
 */
```

For more detailed API documentation, please see below.

## Install

```
npm i @ycm.jason/firecracker
```

## Documentation

### Firecracker

### FirecrackerCollection

#### firecrackerCollection.find(queryObj: Object)

The `queryObj` specifies the criterias of the documents you wish to find.

```js
userCollection.find({
  country: 'us', // equivilant to ['==', 'us']
  age: ['range[)', 21, 30], // denotes 21 <= age < 30
  friends: ['array-contains', firecrackerDocument],
  thirdParty: { // nested query is supported, you can also speify 'thirdParty.facebook' if you wish
    facebook: true, // equivilant to ['==', true]
  },
});
```

Each entry of the `queryObj` contains a key and value pair of `field` and `query`. There are 3 types of queries:

1. `value`, e.g. `'us'` which is equivilant to `['==', 'us']`
2. `[operator, value]`, e.g. `['>=', 21]`, `['array-contains', doc]`, ...
3. `[rangeOperator, value, value]`, e.g. `['range[]', 0, 5]`

Multiple entries will be treated as logical `AND`. 

You can use the operators which you can use in [firestore queries](https://firebase.google.com/docs/firestore/query-data/queries), i.e. `<`, `<=`, `==`, `>`, `>=`, `array-contains`.

Addtion to the firestore operators, you can also use the following range operators:
- `range[]` - inclusive range, e.g. `age: ['range[]', 20, 50]` denotes `20 <= age <= 50`
- `range()` - exclusive range, e.g. `state: ['range()', 'CA', 'IN']` denotes `'CA' < state < 'IN'`
- `range[)` - inclusive start; exclusive end, e.g. `year: ['range[)', 1995, 2018]` denotes `1995 <= year < 2018`
- `range(]` - exclusive start; inclusive end, e.g. `year: ['range(]', 1995, 2018]` denotes `1995 < year <= 2018`


### FirecrackerDocument

## Author
Jason Yu
