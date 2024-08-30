import "dotenv/config"
import mongoose, { Types } from "mongoose"
import bcrypt from "bcryptjs"

import getAllDeliveryNotesCustomer from "./getAllDeliveryNotesCustomer.js"
import { User, DeliveryNote } from "../model/index.js"
import { NotFoundError, MatchError, ContentError } from "com/errors.js"

import { expect } from "chai"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("getDeliveryNotesCustomer", () => {

  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany().then(() => DeliveryNote.deleteMany())))
  beforeEach(() => User.deleteMany().then(() => DeliveryNote.deleteMany()))

  it("succeeds on get all delivery notes", () => {

    return bcrypt.hash("1234", 10)
      .then(hash => User.create({
        username: "Peter",
        email: "peter@email.es",
        password: hash,

      }))
      .then(companyUser => {
        return bcrypt.hash("1234", 10)
          .then(hash => User.create({
            username: "Jack",
            email: "jack@email.es",
            password: hash,
            manager: companyUser.id,
          }))
          .then((customerUser) => [companyUser, customerUser])
      })
      .then(([companyUser, customerUser]) => {
        return DeliveryNote.create({
          date: new Date,
          number: "1234",
          customer: customerUser.id,
          company: companyUser.id,
          works: [new ObjectId(), new ObjectId()],
          observations: "Observations"
        })
          .then(() => [customerUser, companyUser])
      })
      .then(([customerUser, companyUser]) => getAllDeliveryNotesCustomer(companyUser._id.toString(), customerUser._id.toString()))
      .then(deliveryNotes => {
        expect(deliveryNotes).to.be.an.instanceOf(Array)
        expect(deliveryNotes[0]).to.be.an.instanceOf(Object)
        expect(new Date(deliveryNotes[0].date)).to.be.an.instanceOf(Date)
        expect(deliveryNotes[0].number).to.be.equal("1234")
        expect(deliveryNotes[0].customer).to.be.an.instanceOf(Object)
        expect(deliveryNotes[0].company).to.be.an.instanceOf(Object)
        expect(deliveryNotes[0].works).to.be.an.instanceOf(Array)
        expect(deliveryNotes[0].observations).to.be.equal("Observations")
      })
  })

  it("fails on non-existing user", () => {
    let errorThrown

    return getAllDeliveryNotesCustomer(new ObjectId().toString(), new ObjectId().toString())
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("User not found")
      })
  })

  it("fails on non-existing customer user", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then(hash => User.create({
        username: "Peter",
        email: "peter@email.es",
        password: hash,
      }))
      .then((user) => getAllDeliveryNotesCustomer(user.id.toString(), new ObjectId().toString()))
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("Customer not found")
      })
  })

  it("fails on non-existing delivery notes", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then(hash => User.create({
        username: "Peter",
        email: "peter@email.es",
        password: hash,
      }))
      .then(companyUser => {
        return bcrypt.hash("1234", 10)
          .then(hash => User.create({
            username: "Jack",
            email: "jack@email.es",
            password: hash,
          }))
          .then(customerUser => [companyUser, customerUser])
      })
      .then(([companyUser, customerUser]) => getAllDeliveryNotesCustomer(companyUser.id.toString(), customerUser.id.toString()))
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("DeliveryNotes not found")
      })
  })

  it("fails on invalid userId", () => {
    let errorThrown

    try {
      getAllDeliveryNotesCustomer(12345, new ObjectId().toString())
    } catch (error) {
      errorThrown = error

    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("userId is not valid")
    }
  })

  it("fails on invalid CustomerId", () => {
    let errorThrown

    try {
      getAllDeliveryNotesCustomer(new ObjectId().toString(), 1234)
    } catch (error) {
      errorThrown = error

    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("customerId is not valid")
    }
  })

  after(() => User.deleteMany().then(() => DeliveryNote.deleteMany()).then(() => mongoose.disconnect()))
})