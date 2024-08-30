import "dotenv/config"
import mongoose, { Types } from "mongoose"
import bcrypt from "bcryptjs"

import { expect } from "chai"
import { User, DeliveryNote } from "../model/index.js"

import deleteDeliveryNote from "./deleteDeliveryNote.js"
import { MatchError, NotFoundError, ContentError } from "com/errors.js"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("deleteDeliveryNote", () => {
  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany().then(() => DeliveryNote.deleteMany())))
  beforeEach(() => User.deleteMany().then(() => DeliveryNote.deleteMany()))

  it("succeeds on delete a delivery note", () => {
    return bcrypt.hash("1234", 8)
      .then(hash => User.create({
        username: "Peter",
        email: "peter@email.es",
        password: hash,
      }))
      .then(user => {
        return DeliveryNote.create({
          date: new Date(),
          number: "1234",
          customer: user.id,
          company: user.id,
          works: [new ObjectId(), new ObjectId()],
          observations: "Observations"
        })
          .then(deliveryNote => ({ user, deliveryNote }))
      })
      .then(({ user, deliveryNote }) => deleteDeliveryNote(user.id, deliveryNote.id)
        .then(() => DeliveryNote.findById(deliveryNote.id))
      )
      .then(deletedDeliveryNote => {
        expect(deletedDeliveryNote).to.be.null
      })
  })

  it("fails on non-existing user", () => {
    let errorThrown

    return deleteDeliveryNote(new ObjectId().toString(), new ObjectId().toString())
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("User not found")
      })
  })

  it("fails on non-existing delivery note", () => {
    let errorThrown

    return bcrypt.hash("1234", 8)
      .then(hash => User.create({
        username: "Peter",
        email: "Peter@email.es",
        password: hash,
        role: "company"
      }))
      .then(user => deleteDeliveryNote(user.id.toString(), new ObjectId().toString()))
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("Delivery Note not found")
      })
  })

  it("fails on non-match user", () => {
    let errorThrown

    return bcrypt.hash("1234", 8)
      .then(hash => User.create({
        username: "Peter",
        email: "peter@email.es",
        password: hash,
      }))
      .then(user => {
        return DeliveryNote.create({
          date: new Date(),
          number: "1234",
          customer: user.id,
          company: new ObjectId().toString(),
          works: [new ObjectId(), new ObjectId()],
          observations: "Observations"
        })
          .then(deliveryNote => ({ user, deliveryNote }))
      })
      .then(({ user, deliveryNote }) => deleteDeliveryNote(user.id.toString(), deliveryNote.id.toString()))
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(MatchError)
        expect(errorThrown.message).to.equal("Can not delete Delivery Note from another company")
      })
  })

  it("fails on invalid user", () => {
    let errorThrown

    try {
      deleteDeliveryNote(12345, new ObjectId().toString())
    } catch (error) {
      errorThrown = error

    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("userId is not valid")
    }
  })

  it("fails on invalid deliveryNoteId", () => {
    let errorThrown

    try {
      deleteDeliveryNote(new ObjectId().toString(), 6666)
    } catch (error) {
      errorThrown = error

    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("deliveryNoteId is not valid")
    }
  })

  after(() => User.deleteMany().then(() => DeliveryNote.deleteMany()).then(() => mongoose.disconnect()))
})