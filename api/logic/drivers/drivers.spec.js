import "dotenv/config"
import { mongoose, Types } from "mongoose"
import bcrypt from "bcryptjs"
import { expect } from "chai"

import { User } from "../../model/index.js"
import registerDriver from "./registerDriver.js"
import getAllDrivers from "./getAllDrivers.js"
import deleteDriver from "./deleteDriver.js"
import updateDriver from "./updateDriver.js"
import createDeliveryNote from "../deliveryNotes/createDeliveryNote.js"
import createWork from "../deliveryNotes/createWork.js"
import getDeliveryNote from "../deliveryNotes/getDeliveryNote.js"
import { DeliveryNote, Work } from "../../model/index.js"
import { NotFoundError, CredentialsError, DuplicityError } from "com/errors.js"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("Drivers logic suite", () => {
  let ownerUser
  let customerUser

  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany()))

  beforeEach(() =>
    User.deleteMany()
      .then(() => bcrypt.hash("1234", 10))
      .then(hash =>
        Promise.all([
          User.create({
            username: "transportista_admin",
            email: "admin@transportes.com",
            password: hash,
            role: "user",
            fullName: "Transportes García",
          }),
          User.create({
            username: "cliente_empresa",
            email: "cliente@empresa.com",
            password: hash,
            role: "customer",
            fullName: "Cliente S.L.",
          }),
        ])
      )
      .then(([owner, customer]) => {
        ownerUser = owner
        customerUser = customer
      })
  )

  after(() => User.deleteMany().then(() => mongoose.disconnect()))

  describe("registerDriver", () => {
    it("succeeds on registering a new driver", () =>
      registerDriver(
        ownerUser.id,
        "chofer_paco",
        "1234",
        "Francisco Chofer",
        "612345678",
        "",
        " 1234-xyz ",
        " r-5678-abc "
      )
        .then(() => User.findOne({ username: "chofer_paco" }))
        .then(driver => {
          expect(driver).to.exist
          expect(driver.role).to.equal("driver")
          expect(driver.fullName).to.equal("Francisco Chofer")
          expect(driver.vehiclePlate).to.equal("1234-XYZ")
          expect(driver.trailerPlate).to.equal("R-5678-ABC")
          expect(driver.manager.toString()).to.equal(ownerUser.id)
          expect(driver.active).to.be.true
          return bcrypt.compare("1234", driver.password)
        })
        .then(match => expect(match).to.be.true)
    )

    it("fails if requester is not a company owner", () =>
      registerDriver(
        customerUser.id,
        "chofer_fallo",
        "1234",
        "Chofer Fallo"
      )
        .then(() => {
          throw new Error("should not succeed")
        })
        .catch(error => {
          expect(error).to.be.instanceOf(CredentialsError)
          expect(error.message).to.equal("Only company owners can register drivers")
        })
    )

    it("fails on duplicate username", () =>
      registerDriver(ownerUser.id, "chofer_paco", "1234", "Paco Primero")
        .then(() => registerDriver(ownerUser.id, "chofer_paco", "1234", "Paco Segundo"))
        .then(() => {
          throw new Error("should not succeed")
        })
        .catch(error => {
          expect(error).to.be.instanceOf(DuplicityError)
        })
    )

    it("succeeds on registering a driver with the same email and fullName as an existing customer", () =>
      registerDriver(
        ownerUser.id,
        "chofer_cliente_mismo_email",
        "1234",
        customerUser.fullName,
        "612345678",
        customerUser.email
      )
        .then(() => User.findOne({ username: "chofer_cliente_mismo_email" }))
        .then(driver => {
          expect(driver).to.exist
          expect(driver.role).to.equal("driver")
          expect(driver.fullName).to.equal(customerUser.fullName)
          expect(driver.email).to.equal(customerUser.email)
          expect(driver.manager.toString()).to.equal(ownerUser.id)
        })
    )
  })

  describe("getAllDrivers", () => {
    it("lists all active drivers belonging to the owner", () =>
      registerDriver(ownerUser.id, "chofer_1", "1234", "Chofer Uno")
        .then(() => registerDriver(ownerUser.id, "chofer_2", "1234", "Chofer Dos"))
        .then(() => getAllDrivers(ownerUser.id))
        .then(drivers => {
          expect(drivers).to.be.an("array").with.lengthOf(2)
          expect(drivers[0].username).to.be.oneOf(["chofer_1", "chofer_2"])
          expect(drivers[0].role).to.equal("driver")
        })
    )
  })

  describe("deleteDriver", () => {
    it("deactivates an existing driver", () =>
      registerDriver(ownerUser.id, "chofer_eliminar", "1234", "Chofer A Eliminar")
        .then(() => User.findOne({ username: "chofer_eliminar" }))
        .then(driver => deleteDriver(ownerUser.id, driver.id))
        .then(() => User.findOne({ username: "chofer_eliminar" }))
        .then(driver => {
          expect(driver).to.exist
          expect(driver.active).to.be.false
        })
        .then(() => getAllDrivers(ownerUser.id))
        .then(activeDrivers => {
          expect(activeDrivers).to.be.an("array").with.lengthOf(0)
        })
    )
  })

  describe("Driver delivery notes & works workflow", () => {
    it("allows a driver to create an unvalued delivery note and work lines without price", () =>
      registerDriver(ownerUser.id, "chofer_ruta", "1234", "Chofer En Ruta")
        .then(() => User.findOne({ username: "chofer_ruta" }))
        .then(driver =>
          createDeliveryNote(driver.id, customerUser.id)
            .then(deliveryNote => {
              expect(deliveryNote).to.exist
              expect(deliveryNote.company._id.toString()).to.equal(ownerUser.id)
              expect(deliveryNote.isValued).to.be.false
              expect(deliveryNote.createdBy._id.toString()).to.equal(driver.id)

              // Chofer añade bultos sin indicar precio
              return createWork(driver.id, deliveryNote.id, "Porte 4 palets refrigerados", 4)
                .then(updatedDn => {
                  expect(updatedDn.works).to.be.an("array").with.lengthOf(1)
                  expect(updatedDn.works[0].concept).to.equal("Porte 4 palets refrigerados")
                  expect(updatedDn.works[0].quantity).to.equal(4)
                  expect(updatedDn.works[0].price).to.equal(0)

                  // Cuando el chofer consulta el albarán, el precio no aparece
                  return getDeliveryNote(driver.id, deliveryNote.id)
                    .then(driverView => {
                      expect(driverView.works[0].price).to.be.undefined
                    })
                })
            })
        )
    )
  })

  describe("updateDriver", () => {
    it("updates driver password, fullName and phone successfully", () =>
      registerDriver(ownerUser.id, "chofer_update", "clave1234", "Nombre Original", "600000001")
        .then(() => User.findOne({ username: "chofer_update" }))
        .then(driver =>
          updateDriver(ownerUser.id, driver.id, {
            password: "nuevaclave5678",
            fullName: "Nombre Modificado",
            phone: "699999999",
            vehiclePlate: "9876-ZZZ",
            trailerPlate: "R-1111-AAA"
          })
            .then(() => User.findById(driver.id))
            .then(updatedDriver => {
              expect(updatedDriver.fullName).to.equal("Nombre Modificado")
              expect(updatedDriver.phone).to.equal("699999999")
              expect(updatedDriver.vehiclePlate).to.equal("9876-ZZZ")
              expect(updatedDriver.trailerPlate).to.equal("R-1111-AAA")
              return bcrypt.compare("nuevaclave5678", updatedDriver.password)
                .then(match => {
                  expect(match).to.be.true
                })
            })
        )
    )

    it("fails if requester is not the company owner", () =>
      registerDriver(ownerUser.id, "chofer_test_owner", "clave1234", "Chofer Test")
        .then(() => User.findOne({ username: "chofer_test_owner" }))
        .then(driver => {
          let error = null
          return updateDriver(customerUser.id, driver.id, { password: "nueva" })
            .catch(err => { error = err })
            .then(() => {
              expect(error).to.exist
              expect(error).to.be.an.instanceOf(CredentialsError)
            })
        })
    )

    it("succeeds on updating driver email to match an existing customer email", () =>
      registerDriver(ownerUser.id, "chofer_update_email", "clave1234", "Chofer Email Test", "600000001")
        .then(() => User.findOne({ username: "chofer_update_email" }))
        .then(driver =>
          updateDriver(ownerUser.id, driver.id, {
            email: customerUser.email
          })
            .then(() => User.findById(driver.id))
            .then(updatedDriver => {
              expect(updatedDriver.email).to.equal(customerUser.email)
            })
        )
    )
  })
})


