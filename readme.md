# mongo-assert

Mongo assertion library.

[![Build Status](https://travis-ci.org/AlexanderMac/mongo-assert.svg?branch=master)](https://travis-ci.org/AlexanderMac/mongo-assert)
[![Code Coverage](https://codecov.io/gh/AlexanderMac/mongo-assert/branch/master/graph/badge.svg)](https://codecov.io/gh/AlexanderMac/mongo-assert)
[![npm version](https://badge.fury.io/js/mongo-assert.svg)](https://badge.fury.io/js/mongo-assert)

## Why
This library is created to assert made changes in mongodb. Useful when you want to be sure that method added, updated or deleted only one document, and other were unchanged.

## Commands
```bash
# Add to project, should install it as dev dependency
$ npm i -D mongo-assert
```

## Usage
```js
const nassert     = require('n-assert');
const mongoassert = require('mongo-assert');

const initialUsers = [
  {
    _id: nassert.getObjectId(),
    email: 'pen@mail.com',
    firstName: 'Piter',
    lastName: 'Pen'
  },
  {
    _id: nassert.getObjectId(),
    email: 'smith@mail.com',
    firstName: 'John',
    lastName: 'Smith'
  }
];

it('should update user', async () => {
  let filter = { _id: initialUsers[0]._id };
  let userData = {
      email: 'smith-another-email@mail.com'
  };
  let updatedUser = {
    _id: initialUsers[0]._id,
    email: 'smith-another-email@mail.com'
  };

  await User.create(initialUsers);
  await usersSrvc.updateUser({ filter, userData });

  await mongoassert.assertCollection({
    model: User,
    initialDocs: initialUsers,
    changedDoc: updatedUser,
    typeOfChange: updatedUser ? 'updated' : null,
    sortField: '_id'
  });
});
```

## API
- **assertCollection({ model, initialDocs, changedDoc, typeOfChange, sortField })**<br>
Asserts mongodb collection. Loads all documents in the collection, merges initial collection with changed document and asserts.

  - `model` - mongoose model.
  - `initialDocs` - initial documents collection.
  - `changedDoc` - changed document, must be omitted or undefined if collection is unchanged.
  - `typeOfChange` - the type of the change (_created_, _updated_, _deleted_), must be omitted if collection is unchanged.
  - `sortField` - the field which should be used for sorting actual and expected collections before asseting.

## Author
Alexander Mac

## Licence
Licensed under the MIT license.
