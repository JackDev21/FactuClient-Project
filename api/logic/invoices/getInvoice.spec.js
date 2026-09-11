import "dotenv/config"
import mongoose, { Types } from "mongoose"
import bcrypt from "bcryptjs"

import getInvoice from "./getInvoice.js"
import { User, Invoice } from "../../model/index.js"
import { NotFoundError, ContentError } from "com/errors.js"

import { expect } from "chai"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("getInvoice", () => {
  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany().then(() => Invoice.deleteMany())))
  beforeEach(() => User.deleteMany().then(() => Invoice.deleteMany()))

  it("succeeds on get invoice", () => {

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
        return Invoice.create({
          date: new Date,
          number: "1234",
          customer: customerUser.id,
          company: companyUser.id,
          deliveryNotes: [new ObjectId(), new ObjectId()],
          observations: "Observations",
          paymentType: "Cash"
        }).then(invoice => [companyUser, customerUser, invoice])
      })
      .then(([companyUser, customerUser, invoice]) => getInvoice(companyUser.id.toString(), invoice.id.toString()))
      .then(invoice => {
        expect(invoice).to.be.an.instanceOf(Object)
        expect(invoice.date).to.be.an.instanceOf(Date)
        expect(invoice.number).to.be.equal("1234")
        expect(invoice.customer).to.be.an.instanceOf(Object)
        expect(invoice.company).to.be.an.instanceOf(Object)
        expect(invoice.deliveryNotes).to.be.an.instanceOf(Array)
        expect(invoice.observations).to.be.equal("Observations")
        expect(invoice.paymentType).to.be.equal("Cash")
      })
  })

  it("fails when a user tries to access an invoice from another company", () => {
    return bcrypt.hash("1234", 8)
      .then(hash => Promise.all([
        User.create({ username: "Owner1", email: "owner1@test.com", password: hash, role: "company" }),
        User.create({ username: "Owner2", email: "owner2@test.com", password: hash, role: "company" }),
        User.create({ username: "Cust1", email: "cust1@test.com", password: hash, role: "customer" })
      ]))
      .then(([owner1, owner2, cust1]) =>
        Invoice.create({
          date: new Date(),
          number: "2026/001",
          customer: cust1.id,
          company: owner1.id,
          deliveryNotes: [],
          observations: "Secret invoice",
          paymentType: "Transfer"
        }).then(inv => getInvoice(owner2.id, inv.id))
      )
      .then(() => { throw new Error("should not succeed") })
      .catch(error => {
        expect(error.message).to.equal("Can not access invoice from another company")
      })
  })

  it("fails on non-existing user", () => {
    let errorThrown

    return getInvoice(new ObjectId().toString(), new ObjectId().toString())
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("User not found")
      })
  })

  it("fails on non-existing invoice", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then(hash => User.create({
        username: "Peter",
        email: "peter@email.es",
        password: hash,
      }))
      .then(user => getInvoice(user.id.toString(), new ObjectId().toString()))
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("Invoice not found")
      })
  })

  it("fails on invalid userId", () => {
    let errorThrown

    try {
      getInvoice(12345, new ObjectId().toString())
    } catch (error) {
      errorThrown = error

    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("userId is not valid")
    }
  })

  it("fails on invalid userId", () => {
    let errorThrown

    try {
      getInvoice(new ObjectId().toString(), 12345)
    } catch (error) {
      errorThrown = error

    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("invoiceId is not valid")
    }
  })
  after(() => User.deleteMany().then(() => Invoice.deleteMany()).then(() => mongoose.disconnect()))
})