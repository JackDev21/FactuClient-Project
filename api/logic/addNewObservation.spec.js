import "dotenv/config"
import { mongoose, Types } from "mongoose"
import bcrypt from "bcryptjs"

import { expect } from "chai"
import { ContentError, NotFoundError } from "com/errors.js"

import { User, DeliveryNote } from "../model/index.js"
import addNewObservation from "./addNewObservation.js"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("addNewObservation", () => {

  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => Promise.all([User.deleteMany(), DeliveryNote.deleteMany()])))

  beforeEach(() => Promise.all([User.deleteMany(), DeliveryNote.deleteMany()]))

  it("succeeds on new observation", () =>
    bcrypt.hash("1234", 10)
      .then(hash => {
        const user = new User({
          username: "Bruce",
          email: "bruce@dc.es",
          password: "hash"
        })
        const deliveryNote = new DeliveryNote({
          date: new Date(),
          number: "2024/001",
          company: user.id,
          customer: user.id,
          observations: "observations",
          works: [],
        })
        return Promise.all([user.save(), deliveryNote.save()])
      })
      .then(([user, deliveryNote]) => {
        return addNewObservation(user.id, deliveryNote.id, "new observation")
      })
      .then(() => DeliveryNote.findOne())
      .then(deliveryNote => {
        expect(deliveryNote.observations).to.be.a("string")
        expect(deliveryNote.observations).to.equal("new observation")
      })

  )

  it("fails on existing user", () => {
    let errorThrown

    return addNewObservation(new ObjectId().toString(), new ObjectId().toString(), "new Observation")
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
      .then((user) => addNewObservation(user.id, new ObjectId().toString(), "new Observation"))
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("Delivery note not found")
      })
  })

  it("fails on invalid userId", () => {
    let errorThrown
    try {
      addNewObservation(1234, new ObjectId().toString(), "new Observation")
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
      addNewObservation(new ObjectId().toString(), 1234, "new Observation")
    } catch (error) {
      errorThrown = error
    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("deliveryNoteId is not valid")
    }
  })

  it("fails on invalid quantity", () => {
    let errorThrown
    try {
      addNewObservation(new ObjectId().toString(), new ObjectId().toString(), 123)
    } catch (error) {
      errorThrown = error
    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("observation is not valid")
    }
  })


  after(() => Promise.all([User.deleteMany(), DeliveryNote.deleteMany()]).then(() => mongoose.disconnect()))
})