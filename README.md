# Firecracker

Firestore simplified.

## Why?

Firestore is powerful and robust. However the official API seems a little bit too complicated. So I created this to expose limited functionality of Firestore which might hopefully make it easier to use.

## Install

```
npm i @ycm.jason/firecracker
```

## Documentation

### Firecracker

### FirecrackerCollection

#### firecrackerCollection.find(queryObj: Object)

The `queryObj` contains what documents you wish to find. E.g.

```js
userCollection.find({
  country: 'us', // equivilant to ['==', 'us']
  age: ['range[)', 21, 30],
  friends: ['array-contains', doc],
});
```

Each entry of the `queryObj` contains a key and value pair of `field` and `query`. There are 2 types of queries:

1. `value` - exact value match, e.g. `'us'`, equivilant to `['==', 'us']`
2. `[operator, value]` - custom query, e.g. `['>=', 21]`, `['array-contains', doc]`, `['range[]', 0, 5]`...

Multiple entries will be treated as logical `AND`. 

You can use the operators which you can use in [firestore queries](https://firebase.google.com/docs/firestore/query-data/queries), i.e. `<`, `<=`, `==`, `>`, `>=`, `array-contains`.

There is an extra `range` operator added in Firecracker:
- `range[]` - inclusive range, e.g. `age: ['range[]', 20, 50]` denotes `20 <= age <= 50`
- `range()` - exclusive range, e.g. `state: ['range()', 'CA', 'IN']` denotes `'CA' < state < 'IN'`
- `range[)` or `range(]` - mixing both inclusive and exclusive brackets, e.g. `year: ['range[)', 1995, 2018]` denotes `1995 <= year < 2018` and `year: ['range(]', 1995, 2018]` denotes `1995 < year <= 2018`


### FirecrackerDocument

## Author
Jason Yu
