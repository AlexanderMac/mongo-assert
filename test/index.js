const _ = require('lodash')
const mongoose = require('mongoose')
const sinon = require('sinon')
const should = require('should')
const nassert = require('n-assert')
const mongoassert = require('../')

const Schema = mongoose.Schema
const UserSchema = new Schema({
  name: String,
  email: String
})

mongoose.model('user', UserSchema)
const User = mongoose.model('user')

nassert.initSinon(sinon)

describe('mongo-assert', () => {
  describe('assertCollection', () => {
    let initialUsers = [
      { _id: nassert.getObjectId(), name: 'John', email: 'john@mail.com' },
      { _id: nassert.getObjectId(), name: 'Ted', email: 'ted@mail.com' },
      { _id: nassert.getObjectId(), name: 'Matt', email: 'matt@mail.com' }
    ]

    function test(model, initialDocs, changedUser, typeOfChange, sortField = 'name') {
      return mongoassert.assertCollection({
        model,
        initialDocs,
        changedDoc: changedUser,
        typeOfChange,
        sortField
      })
    }

    before(() => {
      const MONGODB_URL = 'mongodb://localhost:27017/mongoassert'
      return mongoose.connection.openUri(MONGODB_URL, { useNewUrlParser: true })
    })

    beforeEach(() => User.create(initialUsers))

    afterEach(() => User.deleteMany())

    after(() => mongoose.connection.close())

    it('should throw an error when model is undefined', () => {
      let changedUser = { name: 'Max', email: 'max@mail.com' }
      let expectedError = new Error('<model> is undefined')
      return User
        .create(changedUser)
        .then(() => test(undefined, initialUsers, changedUser, 'created'))
        .catch(err => should(err).eql(expectedError))
    })

    it('should throw an error when model is not mongoose model', () => {
      let changedUser = { name: 'Max', email: 'max@mail.com' }
      let expectedError = new Error('<model> is not mongoose model')
      return User
        .create(changedUser)
        .then(() => test({}, initialUsers, changedUser, 'created'))
        .catch(err => should(err).eql(expectedError))
    })

    it('should throw an error when intialCollection is not an array', () => {
      let changedUser = { name: 'Max', email: 'max@mail.com' }
      let expectedError = new Error('<initialDocs> is undefined or not an array of documents')
      return User
        .create(changedUser)
        .then(() => test(User, initialUsers[0], changedUser, 'created'))
        .catch(err => should(err).eql(expectedError))
    })

    it('should throw an error when typeOfChange has invalid value', () => {
      let changedUser = { name: 'Max', email: 'max@mail.com' }
      let expectedError = new Error('Unknown <typeOfChange>')
      return User
        .create(changedUser)
        .then(() => test(User, initialUsers, changedUser, 'wrong type'))
        .catch(err => should(err).eql(expectedError))
    })

    it('should throw an error when typeOfChange is defined, but changedDoc not', () => {
      let changedUser = { name: 'Max', email: 'max@mail.com' }
      let expectedError = new Error('<changedDoc> must be defined, when <typeOfChange> is defined')
      return User
        .create(changedUser)
        .then(() => test(User, initialUsers, undefined, 'created'))
        .catch(err => should(err).eql(expectedError))
    })

    it('should pass assertion when no one document is changed', () => {
      return test(User, initialUsers)
    })

    it('should pass assertion when no one document is changed', () => {
      return test(User, initialUsers)
    })

    it('should pass assertion when an existing document is updated', () => {
      let changedUser = { _id: initialUsers[1]._id, name: 'Roy', email: 'roy@mail.com' }
      return User
        .findById(changedUser._id)
        .then(user => {
          _.extend(user, changedUser)
          return user.save()
        })
        .then(() => test(User, initialUsers, changedUser, 'updated'))
    })

    it('should pass assertion when an existing document is deleted', () => {
      let changedUser = { _id: initialUsers[2]._id.toString() }
      return User
        .findById(changedUser._id)
        .then(user => user.remove())
        .then(() => test(User, initialUsers, changedUser, 'deleted'))
    })
  })
})
