import "dotenv/config"
import { mongoose, Types } from "mongoose"
import bcrypt from "bcryptjs"

import { expect } from "chai"
import { User } from "../model/index.js"

import updateProfile from "./updateProfile.js"
import { ContentError, NotFoundError } from "com/errors.js"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("updateProfile", () => {
  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany()))

  beforeEach(() => User.deleteMany())

  it("succeds on update profile", () =>
    bcrypt.hash("1234", 10)
      .then((hash) => User.create({ username: "Jack", email: "jack@email.es", password: hash }))
      .then((user) =>
        updateProfile(user.id, {
          username: "Pepito",
          email: "Pepito@grillo.es",
          fullName: "Pepito Grillo",
          companyName: "Canta Pepito, S.L.",
          address: "Avenida Pepito, 123 Barcelona 03000",
          taxId: "B03413222",
          phone: "666555333",
          bankAccount: "ES1234567890123456789012",
          companyLogo: "https://canta.es/logo.png"
        })
      )
      .then(() => User.findOne())
      .then(user => {
        expect(user._id).to.be.instanceOf(ObjectId)
        expect(user.username).to.equal("Pepito")
        expect(user.email).to.equal("Pepito@grillo.es")
        expect(user.fullName).to.equal("Pepito Grillo")
        expect(user.companyName).to.equal("Canta Pepito, S.L.")
        expect(user.address).to.equal("Avenida Pepito, 123 Barcelona 03000")
        expect(user.taxId).to.equal("B03413222")
        expect(user.phone).to.equal("666555333")
        expect(user.bankAccount).to.equal("ES1234567890123456789012")
        expect(user.companyLogo).to.equal("https://canta.es/logo.png")
      })
  )

  it("fails on existing user", () => {
    let errorThrown

    return updateProfile(new ObjectId().toString(), {
      username: "Pepito",
      email: "Pepito@grillo.es",
      fullName: "Pepito Grillo",
      companyName: "Canta Pepito, S.L.",
      address: "Avenida Pepito, 123 Barcelona 03000",
      taxId: "B03413222",
      phone: "666555333",
      bankAccount: "ES1234567890123456789012",
      companyLogo: "https://canta.es/logo.png"
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
      .then((user) => updateProfile(user.id, {
        username: 7777,
        email: "Pepito@grillo.es",
        fullName: "Pepito Grillo",
        companyName: "Canta Pepito, S.L.",
        address: "Avenida Pepito, 123 Barcelona 03000",
        taxId: "B03413222",
        phone: "666555333",
        bankAccount: "ES1234567890123456789012",
        companyLogo: "https://canta.es/logo.png"
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
      .then((user) => updateProfile(user.id, {
        username: "Pepito",
        email: "Pepitgrillo.es",
        fullName: "Pepito Grillo",
        companyName: "Canta Pepito, S.L.",
        address: "Avenida Pepito, 123 Barcelona 03000",
        taxId: "B03413222",
        phone: "666555333",
        bankAccount: "ES1234567890123456789012",
        companyLogo: "https://canta.es/logo.png"
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
      .then((user) => updateProfile(user.id, {
        username: "Pepito",
        email: "Pepito@grillo.es",
        fullName: 1234,
        companyName: "Canta Pepito, S.L.",
        address: "Avenida Pepito, 123 Barcelona 03000",
        taxId: "B03413222",
        phone: "666555333",
        bankAccount: "ES1234567890123456789012",
        companyLogo: "https://canta.es/logo.png"
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
      .then((user) => updateProfile(user.id, {
        username: "Pepito",
        email: "Pepito@grillo.es",
        fullName: "Pepito Grillo",
        companyName: 9999,
        address: "Avenida Pepito, 123 Barcelona 03000",
        taxId: "B03413222",
        phone: "666555333",
        bankAccount: "ES1234567890123456789012",
        companyLogo: "https://canta.es/logo.png"
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
      .then((user) => updateProfile(user.id, {
        username: "Pepito",
        email: "Pepito@grillo.es",
        fullName: "Pepito Grillo",
        companyName: "Canta Pepito, S.L.",
        address: 7777,
        taxId: "B03413222",
        phone: "666555333",
        bankAccount: "ES1234567890123456789012",
        companyLogo: "https://canta.es/logo.png"
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
      .then((user) => updateProfile(user.id, {
        username: "Pepito",
        email: "Pepito@grillo.es",
        fullName: "Pepito Grillo",
        companyName: "Canta Pepito, S.L.",
        address: "Avenida Pepito, 123 Barcelona 03000",
        taxId: 7777,
        phone: "666555333",
        bankAccount: "ES1234567890123456789012",
        companyLogo: "https://canta.es/logo.png"
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
      .then((user) => updateProfile(user.id, {
        username: "Pepito",
        email: "Pepito@grillo.es",
        fullName: "Pepito Grillo",
        companyName: "Canta Pepito, S.L.",
        address: "Avenida Pepito, 123 Barcelona 03000",
        taxId: "B03413222",
        phone: "666",
        bankAccount: "ES1234567890123456789012",
        companyLogo: "https://canta.es/logo.png"
      }))
      .catch((error) => {
        errorThrown = error
      })
      .finally(() => {
        expect(errorThrown).to.be.instanceOf(ContentError)
        expect(errorThrown.message).to.equal("phone is not valid")
      })
  })

  it("fails on invalid bankAccount", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then((hash) => {
        return User.create({ username: "Jack", email: "jack@email.es", password: hash })
      })
      .then(() => User.findOne())
      .then((user) => updateProfile(user.id, {
        username: "Pepito",
        email: "Pepito@grillo.es",
        fullName: "Pepito Grillo",
        companyName: "Canta Pepito, S.L.",
        address: "Avenida Pepito, 123 Barcelona 03000",
        taxId: "B03413222",
        phone: "666555333",
        bankAccount: 7777,
        companyLogo: "https://canta.es/logo.png"
      }))
      .catch((error) => {
        errorThrown = error
      })
      .finally(() => {
        expect(errorThrown).to.be.instanceOf(ContentError)
        expect(errorThrown.message).to.equal("bankAccount is not valid")
      })
  })

  it("fails on invalid companyLogo", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then((hash) => {
        return User.create({ username: "Jack", email: "jack@email.es", password: hash })
      })
      .then(() => User.findOne())
      .then((user) => updateProfile(user.id, {
        username: "Pepito",
        email: "Pepito@grillo.es",
        fullName: "Pepito Grillo",
        companyName: "Canta Pepito, S.L.",
        address: "Avenida Pepito, 123 Barcelona 03000",
        taxId: "B03413222",
        phone: "666555333",
        bankAccount: "ES1234567890123456789012",
        companyLogo: ":canta.es/logo.png"
      }))
      .catch((error) => {
        errorThrown = error
      })
      .finally(() => {
        expect(errorThrown).to.be.instanceOf(ContentError)
        expect(errorThrown.message).to.equal("companyLogo is not valid")
      })
  })

  after(() => User.deleteMany().then(() => mongoose.disconnect()))
})
