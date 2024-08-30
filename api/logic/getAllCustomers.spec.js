import "dotenv/config"
import mongoose, { Types } from "mongoose"

import bcrypt from "bcryptjs"
import { expect } from "chai"

import { User } from "../model/index.js"
import getAllcustomers from "./getAllCustomers.js"
import { NotFoundError, ContentError } from "com/errors.js"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env


describe("getAllCUstomers", () => {
  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany()))
  beforeEach(() => User.deleteMany())

  it("succeeds on get all customers", () =>

    bcrypt.hash("1234", 10)
      .then((hash) => {
        return User.create({
          username: "Peter",
          email: "peter@parker.com",
          password: hash,
          role: "user",
        })
          .then((user) => {
            return User.create({
              username: "Jack",
              email: "jack@sparrow.com",
              password: hash,
              manager: user._id.toString(),
              role: "customer"
            })
              .then(() => {
                return User.create({
                  username: "John",
                  email: "john.doe@example.com",
                  password: hash,
                  manager: user._id.toString(),
                  role: "customer"
                })
              })
              .then(() => getAllcustomers(user._id.toString()))
              .then((customers) => {
                expect(customers).to.be.an.instanceOf(Array)
                expect(customers.length).to.be.equal(2)
                expect(customers[0]).to.be.an.instanceOf(Object)
                expect(customers[0].username).to.be.equal("Jack")
                expect(customers[0].email).to.be.equal("jack@sparrow.com")
                expect(customers[0].manager).to.be.equal(user._id.toString())
                expect(customers[1].username).to.be.equal("John")
                expect(customers[1].email).to.be.equal("john.doe@example.com")
                expect(customers[1].manager).to.be.equal(user._id.toString())
              })
          })
      })
  )

  it("fails on non-existing customers", () => {
    let errorThrown


    return bcrypt.hash("1234", 10)
      .then(hash => User.create({
        username: "Peter",
        email: "peter@email.es",
        password: hash,
      }))
      .then((user) => getAllcustomers(user.id.toString())
        .catch((error) => errorThrown = error)
        .finally(() => {
          expect(errorThrown).to.be.an.instanceOf(NotFoundError)
          expect(errorThrown.message).to.equal("Customers not found")
        }))
  })

  it("fails on non-existing user", () => {
    let errorThrown

    return getAllcustomers(new ObjectId().toString())
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("User not found")
      })
  })

  after(() => User.deleteMany().then(() => mongoose.disconnect()))
})