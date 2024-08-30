import "dotenv/config"
import { mongoose, Types } from "mongoose"
import bcrypt from "bcryptjs"

import { expect } from "chai"
import { User, Invoice } from "../model/index.js"

import createInvoice from "./createInvoice.js"
import { ContentError, NotFoundError } from "com/errors.js"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("createInvoice", () => {

  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany()).then(() => Invoice.deleteMany()))

  beforeEach(() => User.deleteMany().then(() => Invoice.deleteMany()))

  it("succeeds on new invoice", () => {

    return bcrypt.hash("1234", 10)
      .then((hash) => {
        const user = new User({
          username: "Bruce",
          email: "bruce@wayne.es",
          password: hash
        })
        const customer = new User({
          username: "Clark",
          email: "clark@kent.es",
          password: hash,
          manager: user.id,
        })
        return Promise.all([user.save(), customer.save()])
          .then(() => createInvoice(user.id, customer.id, []))
          .then(() => Invoice.findOne())
          .then(invoice => {
            expect(invoice.date).to.be.a("date")
            expect(invoice.number).to.be.a("string")
            expect(invoice.company.toString()).to.equal(user.id.toString())
            expect(invoice.customer.toString()).to.equal(customer.id).toString()
            expect(invoice.observations).to.be.a("string")
            expect(invoice.paymentType).to.be.a("string")
          })
      })
  })

  it("fails on existing user", () => {
    let errorThrown

    return createInvoice(new ObjectId().toString(), new ObjectId().toString(), [])
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("User not found")
      })
  })



  it("generates the first invoice number when there are no previous invoices", () => {
    return bcrypt.hash("1234", 10)
      .then(hash => {
        const user = new User({
          username: "Bruce",
          email: "bruce@email.es",
          password: hash
        });
        const customer = new User({
          username: "Clark",
          email: "clark@kent.es",
          password: hash,
        });

        return Promise.all([user.save(), customer.save()])
          .then(() => createInvoice(user.id, customer.id, []))
          .then(invoice => {
            const currentYear = new Date().getFullYear()
            expect(invoice.number).to.equal(`${currentYear}/001`)
          })
      })
  })

  it("generates the next invoice number when there is a previous invoice in the same year", () => {
    return bcrypt.hash("1234", 10)
      .then(hash => {
        const user = new User({
          username: "Bruce",
          email: "bruce@email.es",
          password: hash
        });
        const customer = new User({
          username: "Clark",
          email: "clark@kent.es",
          password: hash,
        });

        return Promise.all([user.save(), customer.save()])
          .then(() => Invoice.create({
            date: new Date(),
            number: `${new Date().getFullYear()}/001`,
            company: user.id,
            customer: customer.id,
            deliveryNotes: [],
            observations: "",
            paymentType: "Transferencia",
          }))
          .then(() => createInvoice(user.id, customer.id, []))
          .then(invoice => {
            const currentYear = new Date().getFullYear()
            expect(invoice.number).to.equal(`${currentYear}/002`)
          })
      })
  })

  it("generates the first invoice number of the new year when there is a previous invoice from the last year", () => {
    return bcrypt.hash("1234", 10)
      .then(hash => {
        const user = new User({
          username: "Bruce",
          email: "bruce@email.es",
          password: hash
        });
        const customer = new User({
          username: "Clark",
          email: "clark@kent.es",
          password: hash,
        });

        const lastYear = new Date().getFullYear() - 1

        return Promise.all([user.save(), customer.save()])
          .then(() => Invoice.create({
            date: new Date(`${lastYear}-12-31`),
            number: `${lastYear}/001`,
            company: user.id,
            customer: customer.id,
            deliveryNotes: [],
            observations: "",
            paymentType: "Transferencia",
          }))
          .then(() => createInvoice(user.id, customer.id, []))
          .then(invoice => {
            const currentYear = new Date().getFullYear()
            expect(invoice.number).to.equal(`${currentYear}/001`)
          })
      })
  })


  it("fails on invalid userId", () => {
    let errorThrown
    try {
      createInvoice(1234, new ObjectId().toString(), [])
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
      createInvoice(new ObjectId().toString(), 1234, [])
    } catch (error) {
      errorThrown = error
    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("customerId is not valid")
    }
  })


  after(() => User.deleteMany().then(() => Invoice.deleteMany()).then(() => mongoose.disconnect()))
})
