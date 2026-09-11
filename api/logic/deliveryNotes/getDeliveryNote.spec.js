import "dotenv/config"
import mongoose, { Types } from "mongoose"

import bcrypt from "bcryptjs"

import getDeliveryNote from "./getDeliveryNote.js"
import { User, DeliveryNote } from "../../model/index.js"
import { NotFoundError, ContentError } from "com/errors.js"

import { expect } from "chai"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("getDeliveryNote", () => {
  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany().then(() => DeliveryNote.deleteMany())))
  beforeEach(() => User.deleteMany().then(() => DeliveryNote.deleteMany()))

  it("succeeds on get delivery note", () => {

    return bcrypt.hash("1234", 8)
      .then(hash => User.create({
        username: "Peter",
        email: "Peter@email.es",
        password: hash,
        role: "company"
      }))
      .then(companyUser => {
        return bcrypt.hash("1234", 8)
          .then(hash => User.create({
            username: "Jack",
            email: "jack@email.es",
            password: hash,
            role: "customer"
          }))
          .then(customerUser => [companyUser, customerUser])
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
          .then(deliveryNote => ([companyUser, customerUser, deliveryNote]))
      })
      .then(([companyUser, customerUser, deliveryNote]) => getDeliveryNote(companyUser.id, deliveryNote.id))
      .then(deliveryNote => {
        expect(deliveryNote).to.be.an.instanceOf(Object)
        expect(deliveryNote.date).to.be.an.instanceOf(Date)
        expect(deliveryNote.number).to.be.equal("1234")
        expect(deliveryNote.customer).to.be.an.instanceOf(Object)
        expect(deliveryNote.company).to.be.an.instanceOf(Object)
        expect(deliveryNote.works).to.be.an.instanceOf(Array)
        expect(deliveryNote.observations).to.be.equal("Observations")
      })
  })

  it("fails when a user tries to access a delivery note from another company", () => {
    return bcrypt.hash("1234", 8)
      .then(hash => Promise.all([
        User.create({ username: "Owner1", email: "owner1@test.com", password: hash, role: "company" }),
        User.create({ username: "Owner2", email: "owner2@test.com", password: hash, role: "company" }),
        User.create({ username: "Cust1", email: "cust1@test.com", password: hash, role: "customer" })
      ]))
      .then(([owner1, owner2, cust1]) =>
        DeliveryNote.create({
          date: new Date(),
          number: "2026/001",
          customer: cust1.id,
          company: owner1.id,
          works: [],
          observations: "Secret note"
        }).then(dn => getDeliveryNote(owner2.id, dn.id))
      )
      .then(() => { throw new Error("should not succeed") })
      .catch(error => {
        expect(error.message).to.equal("Can not access delivery note from another company")
      })
  })

  it("fails on non-existing user", () => {
    let errorThrown

    return getDeliveryNote(new ObjectId().toString(), new ObjectId().toString())
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("User not found")
      })
  })

  it("fails on non-existing deliveryNote", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then(hash => User.create({
        username: "Peter",
        email: "peter@email.es",
        password: hash,
      }))
      .then(user => getDeliveryNote(user.id.toString(), new ObjectId().toString()))
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("DeliveryNote not found")
      })
  })

  it("fails on invalid userId", () => {
    let errorThrown

    try {
      getDeliveryNote(12345, new ObjectId().toString())
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
      getDeliveryNote(new ObjectId().toString(), 1234)
    } catch (error) {
      errorThrown = error

    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("deliveryNoteId is not valid")
    }
  })

  after(() => User.deleteMany().then(() => DeliveryNote.deleteMany()).then(() => mongoose.disconnect()))
})