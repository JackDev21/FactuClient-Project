import "dotenv/config"
import { expect } from "chai"
import mongoose, { Types } from "mongoose"
import bcrypt from "bcryptjs"
import { User } from "../model/index.js"

import { ContentError, NotFoundError } from "com/errors.js"

import updateCustomerProfile from "./updateCustomerProfile.js"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("updateCustomerProfile", () => {
  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany()))

  beforeEach(() => User.deleteMany())

  it("succeeds on updating customer profile", () =>
    bcrypt.hash("1234", 10)
      .then((hash) => User.create({ username: "Jack", email: "jack@email.es", password: hash }))
      .then((user) =>
        User.create({
          username: "Agustin",
          email: "agustin@email.es",
          password: "1234",
          companyName: "Agustin Enterprise, Inc.",
          address: "Avenida Agustin 23 , Alicante 03680",
          taxId: "B0123565",
          phone: "666555221",
          role: "customer",
          manager: user._id,
          active: false,
          fullName: "Agustin"
        }).then((customer) =>
          updateCustomerProfile(user.id.toString(), customer.id.toString(), {
            username: "Pepito",
            email: "Pepito@grillo.es",
            fullName: "Pepito Grillo",
            companyName: "Canta Pepito, S.L.",
            address: "Avenida Pepito, 123 Barcelona 03000",
            taxId: "B03413222",
            phone: "666555333",
          }).then(() => User.findById(customer._id))
            .then((updatedCustomer) => {
              expect(updatedCustomer).to.exist
              expect(updatedCustomer.username).to.equal("Pepito")
              expect(updatedCustomer.email).to.equal("Pepito@grillo.es")
              expect(updatedCustomer.fullName).to.equal("Pepito Grillo")
              expect(updatedCustomer.companyName).to.equal("Canta Pepito, S.L.")
              expect(updatedCustomer.address).to.equal("Avenida Pepito, 123 Barcelona 03000")
              expect(updatedCustomer.taxId).to.equal("B03413222")
              expect(updatedCustomer.phone).to.equal("666555333")
            })
        )
      )
  )

  it("fails on existing user", () => {
    let errorThrown

    return updateCustomerProfile(new ObjectId().toString(), new ObjectId().toString(), {
      username: "Pepito",
      email: "Pepito@grillo.es",
      fullName: "Pepito Grillo",
      companyName: "Canta Pepito, S.L.",
      address: "Avenida Pepito, 123 Barcelona 03000",
      taxId: "B03413222",
      phone: "666555333",
    })
      .catch((error) => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("User not found")
      })
  })


  it("fails on invalid username", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then((hash) => {
        return User.create({ username: "Jack", email: "jack@email.es", password: hash })
      })
      .then(() => User.findOne())
      .then((user) => updateCustomerProfile(user.id, new ObjectId().toString(), {
        username: 7777,
        email: "Pepito@grillo.es",
        fullName: "Pepito Grillo",
        companyName: "Canta Pepito, S.L.",
        address: "Avenida Pepito, 123 Barcelona 03000",
        taxId: "B03413222",
        phone: "666555333",
      }))
      .catch((error) => {
        errorThrown = error
      })
      .finally(() => {
        expect(errorThrown).to.be.instanceOf(ContentError)
        expect(errorThrown.message).to.equal("username is not valid")
      })
  })

  it("fails on invalid email", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then((hash) => {
        return User.create({ username: "Jack", email: "jack@email.es", password: hash })
      })
      .then(() => User.findOne())
      .then((user) => updateCustomerProfile(user.id, new ObjectId().toString(), {
        username: "Pepito",
        email: "Pepitgrillo.es",
        fullName: "Pepito Grillo",
        companyName: "Canta Pepito, S.L.",
        address: "Avenida Pepito, 123 Barcelona 03000",
        taxId: "B03413222",
        phone: "666555333",
      }))
      .catch((error) => {
        errorThrown = error
      })
      .finally(() => {
        expect(errorThrown).to.be.instanceOf(ContentError)
        expect(errorThrown.message).to.equal("email is not valid")
      })
  })

  it("fails on invalid fullName", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then((hash) => {
        return User.create({ username: "Jack", email: "jack@email.es", password: hash })
      })
      .then(() => User.findOne())
      .then((user) => updateCustomerProfile(user.id, new ObjectId().toString(), {
        username: "Pepito",
        email: "Pepito@grillo.es",
        fullName: 1234,
        companyName: "Canta Pepito, S.L.",
        address: "Avenida Pepito, 123 Barcelona 03000",
        taxId: "B03413222",
        phone: "666555333",
      }))
      .catch((error) => {
        errorThrown = error
      })
      .finally(() => {
        expect(errorThrown).to.be.instanceOf(ContentError)
        expect(errorThrown.message).to.equal("fullName is not valid")
      })
  })

  it("fails on invalid companyName", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then((hash) => {
        return User.create({ username: "Jack", email: "jack@email.es", password: hash })
      })
      .then(() => User.findOne())
      .then((user) => updateCustomerProfile(user.id, new ObjectId().toString(), {
        username: "Pepito",
        email: "Pepito@grillo.es",
        fullName: "Pepito Grillo",
        companyName: 9999,
        address: "Avenida Pepito, 123 Barcelona 03000",
        taxId: "B03413222",
        phone: "666555333",
      }))
      .catch((error) => {
        errorThrown = error
      })
      .finally(() => {
        expect(errorThrown).to.be.instanceOf(ContentError)
        expect(errorThrown.message).to.equal("companyName is not valid")
      })
  })

  it("fails on invalid address", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then((hash) => {
        return User.create({ username: "Jack", email: "jack@email.es", password: hash })
      })
      .then(() => User.findOne())
      .then((user) => updateCustomerProfile(user.id, new ObjectId().toString(), {
        username: "Pepito",
        email: "Pepito@grillo.es",
        fullName: "Pepito Grillo",
        companyName: "Canta Pepito, S.L.",
        address: 7777,
        taxId: "B03413222",
        phone: "666555333",

      }))
      .catch((error) => {
        errorThrown = error
      })
      .finally(() => {
        expect(errorThrown).to.be.instanceOf(ContentError)
        expect(errorThrown.message).to.equal("address is not valid")
      })
  })

  it("fails on invalid taxId", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then((hash) => {
        return User.create({ username: "Jack", email: "jack@email.es", password: hash })
      })
      .then(() => User.findOne())
      .then((user) => updateCustomerProfile(user.id, new ObjectId().toString(), {
        username: "Pepito",
        email: "Pepito@grillo.es",
        fullName: "Pepito Grillo",
        companyName: "Canta Pepito, S.L.",
        address: "Avenida Pepito, 123 Barcelona 03000",
        taxId: 7777,
        phone: "666555333",
      }))
      .catch((error) => {
        errorThrown = error
      })
      .finally(() => {
        expect(errorThrown).to.be.instanceOf(ContentError)
        expect(errorThrown.message).to.equal("taxId is not valid")
      })
  })

  it("fails on invalid phone", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then((hash) => {
        return User.create({ username: "Jack", email: "jack@email.es", password: hash })
      })
      .then(() => User.findOne())
      .then((user) => updateCustomerProfile(user.id, new ObjectId().toString(), {
        username: "Pepito",
        email: "Pepito@grillo.es",
        fullName: "Pepito Grillo",
        companyName: "Canta Pepito, S.L.",
        address: "Avenida Pepito, 123 Barcelona 03000",
        taxId: "B03413222",
        phone: "666",
      }))
      .catch((error) => {
        errorThrown = error
      })
      .finally(() => {
        expect(errorThrown).to.be.instanceOf(ContentError)
        expect(errorThrown.message).to.equal("phone is not valid")
      })
  })


  after(() => User.deleteMany().then(() => mongoose.disconnect()))
})