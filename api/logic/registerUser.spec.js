import "dotenv/config"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"

import { expect } from "chai"
import { User } from "../model/index.js"

import registerUser from "./registerUser.js"
import { ContentError, DuplicityError, MatchError } from "com/errors.js"

const { MONGODB_URL_TEST } = process.env

describe("registerUser", () => {
  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany()))

  beforeEach(() => User.deleteMany())

  it("succeeds on new user", () =>
    registerUser("Bruce", "bruce@wayne.es", "1234", "1234")
      .then(() => User.findOne())
      .then(user => {
        expect(user.username).to.equal("Bruce")
        expect(user.email).to.equal("bruce@wayne.es")

        return bcrypt.compare("1234", user.password)
      })
      .then((match) => expect(match).to.be.true)
  )

  it("fails on existing user", () => {
    let errorThrown

    return bcrypt.hash("1234", 10)
      .then(hash => User.create({ username: "Bruce", email: "bruce@wayne.es", password: hash }))
      .then(() => registerUser("Bruce", "bruce@wayne.es", "1234", "1234"))
      .catch((error) => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.instanceOf(DuplicityError)
        expect(errorThrown.message).to.equal("User already exists")
      })
  })

  it("fails on invalid username", () => {
    let errorThrown
    try {
      registerUser(1234, "hulk@marvel.com", "1234", "1234")
    } catch (error) {
      errorThrown = error
    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("Username is not valid")
    }
  })

  it("fails on invalid email", () => {
    let errorThrown
    try {
      registerUser("Peter", "spiderman.com", "1234", "1234")
    } catch (error) {
      errorThrown = error
    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("email is not valid")
    }
  })

  it("fails on invalid password", () => {
    let errorThrown
    try {
      registerUser("Bruce", "hulk@marvel.com", 1234, "1234")
    } catch (error) {
      errorThrown = error
    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("Password is not valid")
    }
  })

  it("fails on non-matching password repeat", () => {
    let errorThrown
    try {
      registerUser("Bruce", "hulk@marvel.com", "1234", 6666)
    } catch (error) {
      errorThrown = error
    } finally {
      expect(errorThrown).to.be.instanceOf(MatchError)
      expect(errorThrown.message).to.equal("passwords don\'t match")
    }
  })

  after(() => User.deleteMany().then(() => mongoose.disconnect()))
})