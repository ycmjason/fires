# Firecracker

Firestore simplified.

## Why?

Firestore is powerful and robust with high level of flexibility. However, I personally find the official API overly-complicated for simple operations.

For example, let's take a look at the following code for retrieving a single document.

```js
const collectionReference = db.collection('cities');
const documentReference = collectionReference.doc('LA');
const documentSnapshot = await documentReference.get();
const document = documentSnapshot.data();
/* after 4 transformation, we finally get our data!
 *   {
 *     name: "Los Angeles",
 *     state: "CA",
 *     country: "USA"
 *   }
 */
```

Firestore API is highly flexible; it takes care of all use case of Firestore. However, the flexibility comes at the cost of developer experience. Especially if you are only interested in the data itself.

Firecracker exposes a very simple API (merely 3 classes); allowing developers to focus on the data.

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
