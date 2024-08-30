import "dotenv/config"
import mongoose, { Types } from "mongoose"
import bcrypt from "bcryptjs"

import getProfileUser from "./getProfileUser.js"
import { User } from "../model/index.js"
import { NotFoundError, ContentError } from "com/errors.js"

import { expect } from "chai"
const { MONGODB_URL_TEST } = process.env
const { ObjectId } = Types

describe("getProfileUser", () => {
  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany()))
  beforeEach(() => User.deleteMany())

  it("succeeds on get profile user", () =>
    bcrypt.hash("1234", 8)
      .then(hash => Promise.all([User.create({
        username: "Peter",
        email: "peter@parker.com",
        password: hash
      }), User.create({
        username: "Jack",
        email: "jack@sparrow.com",
        password: hash
      })]))
      .then(([user, targetUser]) => getProfileUser(user.id, targetUser.id))
      .then(user => {
        expect(user).to.be.an.instanceOf(Object)
        expect(user.username).to.be.equal("Jack")
        expect(user.email).to.be.equal("jack@sparrow.com")
      })
  )

  it("fails on non-existing user", () => {
    let errorThrown

    return bcrypt.hash("1234", 8)
      .then(hash => User.create({ username: "mochachai", email: "mocha@chai.es", password: hash }))
      .then(targetUserId => getProfileUser(new ObjectId().toString(), targetUserId.id))
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("User not found")
      })
  })

  it("fails on non-existing targetUser", () => {
    let errorThrown

    return bcrypt.hash("1234", 8)
      .then(hash => User.create({ username: "mochachai", email: "mocha@chai.es", password: hash }))
      .then(user => getProfileUser(user.id, new ObjectId().toString()))
      .catch(error => errorThrown = error)
      .finally(() => {
        expect(errorThrown).to.be.an.instanceOf(NotFoundError)
        expect(errorThrown.message).to.equal("TargetUser not found")
      })
  })

  it("fails on invalid userId", () => {
    let errorThrown

    try {
      getProfileUser(12345, new ObjectId().toString())
    } catch (error) {
      errorThrown = error

    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("userId is not valid")
    }
  })

  it("fails on invalid targetUserId", () => {
    let errorThrown

    try {
      getProfileUser(new ObjectId().toString(), 12345)
    } catch (error) {
      errorThrown = error

    } finally {
      expect(errorThrown).to.be.instanceOf(ContentError)
      expect(errorThrown.message).to.equal("targetUserId is not valid")
    }
  })

  after(() => User.deleteMany().then(() => mongoose.disconnect()))
})