import "dotenv/config"
import { mongoose, Types } from "mongoose"
import bcrypt from "bcryptjs"

import { expect } from "chai"
import { ContentError, NotFoundError } from "com/errors.js"

import { Work, User, DeliveryNote } from "../model/index.js"
import createWork from "./createWork.js"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("createWork", () => {

  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => Promise.all([User.deleteMany(), Work.deleteMany(), DeliveryNote.deleteMany()])))

  beforeEach(() => Promise.all([User.deleteMany(), Work.deleteMany(), DeliveryNote.deleteMany()]))

  it("succeeds on new work", () =>
    bcrypt.hash("1234", 10)
      .then(hash => {
        const user = new User({
          username: "Bruce",
          email: "bruce@wayne.es",
          password: hash
        })
        const customer = new User({
          username: "Peter",
          email: "peter@parker.es",
          password: hash
        })
        const deliveryNote = new DeliveryNote({
          date: new Date(),
          number: "2024/" + Math.floor(Math.random() * 1000),
          company: user.id,
          customer: user.id,
          observations: "observations",
          works: [],
        })

        return Promise.all([user.save(), customer.save(), deliveryNote.save()])
      })
      .then(([user, customer, deliveryNote]) => {
        return createWork(user.id, deliveryNote.id, "concept", 1, 1)
      })
      .then(() => Work.findOne())
      .then(work => {
        expect(work.concept).to.be.a("string")
        expect(work.quantity).to.be.a("number")
        expect(work.price).to.be.a("number")
        expect(work.concept).to.equal("concept")
        expect(work.quantity).to.equal(1)
        expect(work.price).to.equal(1)
      })
  )

  it("fails on existing user", () => {
    let errorThrown

    return createWork(new ObjectId().toString(), new ObjectId().toString(), "concept", 1, 1)
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("User not found")
      })
  })

  it("fails on existing delivery-note", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then(hash => {
        return User.create({
          username: "Bruce",
          email: "bruce@wayne.es",
          password: hash,
        })
      })
      .then(() => User.findOne())
      .then((user) => createWork(user.id, new ObjectId().toString(), "concept", 1, 1))
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("Delivery note not found")
      })
  })

  it("fails on invalid userId", () => {
    let errorThrown
    try {
      createWork(1234, new ObjectId().toString(), "concept", 1, 1)
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
      createWork(new ObjectId().toString(), 1234, "concept", 1, 1)
    } catch (error) {
      errorThrown = error
    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("deliveryNoteId is not valid")
    }
  })

  it("fails on invalid concept", () => {
    let errorThrown
    try {
      createWork(new ObjectId().toString(), new ObjectId().toString(), 666, 1, 1)
    } catch (error) {
      errorThrown = error
    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("concept is not valid")
    }
  })

  it("fails on invalid quantity", () => {
    let errorThrown
    try {
      createWork(new ObjectId().toString(), new ObjectId().toString(), "concept", "buuhh", 1)
    } catch (error) {
      errorThrown = error
    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("quantity is not valid")
    }
  })

  it("fails on invalid price", () => {
    let errorThrown
    try {
      createWork(new ObjectId().toString(), new ObjectId().toString(), "concept", 1, "buuhh")
    } catch (error) {
      errorThrown = error
    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("price is not valid")
    }
  })

  after(() => Promise.all([User.deleteMany(), Work.deleteMany(), DeliveryNote.deleteMany()]).then(() => mongoose.disconnect()))
})