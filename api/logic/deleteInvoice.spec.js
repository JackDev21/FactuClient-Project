import "dotenv/config"
import mongoose, { Types } from "mongoose"
import bcrypt from "bcryptjs"

import { expect } from "chai"
import { User, Invoice } from "../model/index.js"

import deleteInvoice from "./deleteInvoice.js"
import { MatchError, NotFoundError, ContentError } from "com/errors.js"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("deleteInvoice", () => {
  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany().then(() => Invoice.deleteMany())))
  beforeEach(() => User.deleteMany().then(() => Invoice.deleteMany()))


  it("succeeds on delete a invoice", () => {
    return bcrypt.hash("1234", 8)
      .then(hash => User.create({
        username: "Peter",
        email: "peter@email.es",
        password: hash,
      }))
      .then(user => {
        return Invoice.create({
          date: new Date(),
          number: "1234",
          customer: user.id,
          company: user.id,
          deliveryNotes: [new ObjectId(), new ObjectId()],
          observations: "Observations",
          paymentType: "cash",
        })
          .then(invoice => ({ user, invoice }))
      })
      .then(({ user, invoice }) => deleteInvoice(user.id, invoice.id)
        .then(() => Invoice.findById(invoice.id))
      )
      .then(deletedInvoice => {
        expect(deletedInvoice).to.be.null
      })
  })

  it("fails on non-existing user", () => {
    let errorThrown

    return deleteInvoice(new ObjectId().toString(), new ObjectId().toString())
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("User not found")
      })
  })

  it("fails on non-existing invoice", () => {
    let errorThrown

    return bcrypt.hash("1234", 8)
      .then(hash => User.create({
        username: "Peter",
        email: "Peter@email.es",
        password: hash,
        role: "company"
      }))
      .then(user => deleteInvoice(user.id.toString(), new ObjectId().toString()))
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("Invoice not found")
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
        return Invoice.create({
          date: new Date(),
          number: "1234",
          customer: user.id,
          company: new ObjectId().toString(),
          deliveryNotes: [new ObjectId(), new ObjectId()],
          observations: "Observations",
          paymentType: "cash",
        })
          .then(invoice => ({ user, invoice }))
      })
      .then(({ user, invoice }) => deleteInvoice(user.id.toString(), invoice.id.toString()))
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(MatchError)
        expect(errorThrown.message).to.equal("Can not delete Invoice from another company")
      })
  })

  it("fails on invalid user", () => {
    let errorThrown

    try {
      deleteInvoice(12345, new ObjectId().toString())
    } catch (error) {
      errorThrown = error

    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("userId is not valid")
    }
  })

  it("fails on invalid invoice", () => {
    let errorThrown

    try {
      deleteInvoice(new ObjectId().toString(), 6666)
    } catch (error) {
      errorThrown = error

    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("invoiceId is not valid")
    }
  })





  after(() => User.deleteMany().then(() => Invoice.deleteMany()).then(() => mongoose.disconnect()))
})