'use strict';

const _       = require('lodash');
const nassert = require('n-assert');

exports.assertCollection = ({ model, initialDocs, changedDoc, typeOfChange, sortField }) => {
  if (!model) {
    throw new Error('<model> is undefined');
  }
  if (!_.isFunction(model.find)) {
    throw new Error('<model> is not mongoose model');
  }
  if (!_.isArray(initialDocs)) {
    throw new Error('<initialDocs> is undefined or not an array of documents');
  }
  if (typeOfChange) {
    if (!_.includes(['created', 'updated', 'deleted'], typeOfChange)) {
      throw new Error('Unknown <typeOfChange>');
    }
    if (!changedDoc) {
      throw new Error('<changedDoc> must be defined, when <typeOfChange> is defined');
    }
  }

  let temp;
  let expectedDocs = _.cloneDeep(initialDocs);
  return model
    .find()
    .lean()
    .exec()
    .then(actualDocs => {
      switch (typeOfChange) {
        case 'created':
          expectedDocs.push(changedDoc);
          break;
        case 'updated':
          temp = _.find(expectedDocs, doc => _safeToString(doc._id) === _safeToString(changedDoc._id));
          _.extend(temp, changedDoc);
          break;
        case 'deleted':
          _.remove(expectedDocs, doc => _safeToString(doc._id) === _safeToString(changedDoc._id));
          break;
      }

      if (sortField) {
        actualDocs = _.sortBy(actualDocs, sortField);
        expectedDocs = _.sortBy(expectedDocs, sortField);
      }

      nassert.assert(actualDocs, expectedDocs);
      return null;
    });
};

function _safeToString(val) {
  return _.isNil(val) ? val : val.toString();
}
