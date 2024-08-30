import "dotenv/config"
import mongoose, { Types } from "mongoose"
import bcrypt from "bcryptjs"

import { expect } from "chai"
import { User } from "../model/index.js"

import deleteCustomer from "./deleteCustomer.js"
import { MatchError, NotFoundError, ContentError } from "com/errors.js"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("deleteCustomer", () => {

  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany()))
  beforeEach(() => User.deleteMany())


  it("succeeds on deactivate a customer", () => {
    return bcrypt.hash("1234", 8)
      .then(hash => User.create({
        username: "Peter",
        email: "peter@email.es",
        password: hash,
      }))
      .then(user => {
        return bcrypt.hash("1234", 8)
          .then(hash => User.create({
            username: "Jack",
            email: "jack@email.es",
            password: hash,
            manager: user.id
          }))
          .then(customer => ({ user, customer }))
      })
      .then(({ user, customer }) => deleteCustomer(user.id, customer.id)
        .then(() => User.findById(customer.id))
      )
      .then(deactivatedCustomer => {
        expect(deactivatedCustomer).to.exist
        expect(deactivatedCustomer.active).to.be.false
      })
  })

  it("fails on non-existing user", () => {
    let errorThrown

    return deleteCustomer(new ObjectId().toString(), new ObjectId().toString())
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("User not found")
      })
  })

  it("fails on non-existing customer", () => {
    let errorThrown

    return bcrypt.hash("1234", 8)
      .then(hash => User.create({
        username: "Peter",
        email: "peter@email.es",
        password: hash,
      }))
      .then((user) => deleteCustomer(user.id.toString(), new ObjectId().toString()))
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("Customer not found")
      })
  })

  it("fails on non-match user", () => {
    let errorThrown;

    return bcrypt.hash("1234", 8)
      .then(hash => User.create({
        username: "Peter",
        email: "Peter@email.es",
        password: hash,
      }))
      .then(user => {
        return bcrypt.hash("1234", 8)
          .then(hash => User.create({
            username: "Jack",
            email: "jack@email.es",
            password: hash,
            manager: new ObjectId().toString()
          }))
          .then(customer => ({ user, customer }))
      })
      .then(({ user, customer }) => {
        return deleteCustomer(user.id.toString(), customer.id.toString())
          .catch(error => errorThrown = error)
      })
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(MatchError)
        expect(errorThrown.message).to.equal("Can not deactivate Customer from another user")
      })
  })

  it("fails on invalid userId", () => {
    let errorThrown

    try {
      deleteCustomer(6666, new ObjectId().toString())
    } catch (error) {
      errorThrown = error

    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("userId is not valid")
    }
  })

  it("fails on invalid customerId", () => {
    let errorThrown

    try {
      deleteCustomer(new ObjectId().toString(), 6655)
    } catch (error) {
      errorThrown = error

    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("customerId is not valid")
    }
  })

  after(() => User.deleteMany().then(() => mongoose.disconnect()))
})