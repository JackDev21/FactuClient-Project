import "dotenv/config"
import mongoose, { Types } from "mongoose"

import bcrypt from "bcryptjs"
import { expect } from "chai"

import { User, DeliveryNote } from "../model/index.js"
import getAllDeliveryNotes from "./getAllDeliveryNotes.js"
import { NotFoundError, ContentError } from "com/errors.js"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("getAllDeliveryNotes", () => {
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
          .then(() => companyUser)
      })
      .then((companyUser) => getAllDeliveryNotes(companyUser._id.toString()))
      .then(deliveryNotes => {
        expect(deliveryNotes).to.be.an.instanceOf(Array)
        expect(deliveryNotes[0]).to.be.an.instanceOf(Object)
        expect(deliveryNotes[0].date).to.be.an.instanceOf(Date)
        expect(deliveryNotes[0].number).to.be.equal("1234")
        expect(deliveryNotes[0].customer).to.be.an.instanceOf(Object)
        expect(deliveryNotes[0].company).to.be.an.instanceOf(Object)
        expect(deliveryNotes[0].works).to.be.an.instanceOf(Array)
        expect(deliveryNotes[0].observations).to.be.equal("Observations")
      })
  })

  it("fails on non-exisiting delivery notes", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then(hash => User.create({
        username: "Peter",
        email: "peter@email.es",
        password: hash,
      }))
      .then(user => getAllDeliveryNotes(user.id.toString()))
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("DeliveryNotes not found")

      })
  })

  it("fails on non-existing user", () => {
    let errorThrown

    return getAllDeliveryNotes(new ObjectId().toString(), new ObjectId().toString())
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("User not found")
      })
  })

  it("fails on invalid userId", () => {
    let errorThrown

    try {
      getAllDeliveryNotes(12345, new ObjectId().toString())
    } catch (error) {
      errorThrown = error

    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("userId is not valid")
    }
  })

  after(() => User.deleteMany().then(() => mongoose.disconnect()))
})
