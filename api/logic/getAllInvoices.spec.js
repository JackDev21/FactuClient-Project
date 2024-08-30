import "dotenv/config"
import { mongoose, Types } from "mongoose"
import bcrypt from "bcryptjs"
import { expect } from "chai"
import { User, Invoice } from "../model/index.js"
import getAllInvoices from "./getAllInvoices.js"
import { NotFoundError, ContentError } from "com/errors.js"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("getAllInvoices", () => {
  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany().then(() => Invoice.deleteMany())))

  beforeEach(() => User.deleteMany().then(() => Invoice.deleteMany()))

  it("succeeds on getting all invoices", () =>
    bcrypt.hash("1234", 10)
      .then((hash) => User.create({ username: "Jack", email: "jack@email.es", password: hash }))
      .then((user) => {
        const { id } = user

        return Invoice.create({ company: id, customer: id, number: "2024/123", date: new Date(), observations: "test", paymentType: "cash" })
          .then(() => Invoice.create({ company: id, customer: id, number: "2024/124", date: new Date(), observations: "test2", paymentType: "credit card" }))
          .then(() => getAllInvoices(id))
          .then((invoices) => {
            expect(invoices).to.be.an("array")
            expect(invoices.length).to.equal(2)

            invoices.map(invoice => {
              expect(invoice.id).to.be.a("string")
              expect(invoice.company).to.be.an("object")
              expect(invoice.customer).to.be.an("object")
              expect(invoice.date).to.be.an.instanceOf(Date)
              expect(invoice.number).to.be.a("string")
              expect(invoice.deliveryNotes).to.be.an("array")
              expect(invoice.observations).to.be.a("string")
              expect(invoice.paymentType).to.be.a("string")
            });
          });
      })
  )

  it("fails on existing customer user", () => {
    let errorThrown

    return getAllInvoices(new ObjectId().toString())
      .catch((error) => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("User not found")
      })
  })

  it("fails on existing invoices", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then((hash) => User.create({ username: "Jack", email: "jack@email.es", password: hash }))
      .then((user) => {
        return getAllInvoices(user.id.toString())
          .catch((error) => errorThrown = error)
          .finally(() => {
            expect(errorThrown).to.be.instanceOf(NotFoundError)
            expect(errorThrown.message).to.equal("Invoices not found")
          })
      })
  })

  it("fails on invalid userId", () => {
    let errorThrown

    try {
      getAllInvoices(77777)
    } catch (error) {
      errorThrown = error

    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("userId is not valid")
    }
  })

  after(() => User.deleteMany().then(() => mongoose.disconnect()))
})