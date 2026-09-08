import registerUserHandler from "./registerUserHandler.js"
import authenticateUserHandler from "./authenticateUserHandler.js"
import getUserNameHandler from "./getUserNameHandler.js"
import updateProfileHandler from "./updateProfileHandler.js"

import registerCustomHandler from "./registerCustomerHandler.js"
import getAllCustomersHandler from "./getAllCustomersHandler.js"
import getProfileUserHandler from "./getProfileUserHandler.js"
import deleteCustomerHandler from "./deleteCustomerHandler.js"
import updateCustomerProfileHandler from "./updateCustomerProfileHandler.js"

import getAllDeliveryNotesHandler from "./getAlldeliveryNotesHandler.js"
import getDeliveryNoteHandler from "./getDeliveryNoteHandler.js"
import deleteDeliveryNoteHandler from "./deleteDeliveryNoteHandler.js"
import getAllDeliveryNotesCustomerHandler from "./getAllDeliveryNotesCustomerHandler.js"
import updateDateDeliveryNoteHandler from "./updateDeliveryNoteDateHandler.js"

import createDeliveryNoteHandler from "./createDeliveryNoteHandler.js"
import createWorkHandler from "./createWorkHandler.js"
import updateWorkHandler from "./updateWorkHandler.js"
import deleteWorkHandler from "./deleteWorkHandler.js"

import getAllInvoicesHandler from "./getAllInvoicesHandler.js"
import getInvoiceHandler from "./getInvoiceHandler.js"
import createInvoiceHandler from "./createInvoiceHandler.js"
import updateInvoiceDateHandler from "./updateInvoiceDateHandler.js"
import updateInvoicePaymentTypeHandler from "./updateInvoicePaymentTypeHandler.js"
import deleteInvoiceHandler from "./deleteInvoiceHandler.js"
import getAllInvoicesCustomerHandler from "./getAllInvoicesCustomerHandler.js"

import addNewObservation from "./addNewObservationHandler.js"

import requestPasswordResetHandler from "./requestPasswordResetHandler.js"
import resetPasswordHandler from "./resetPasswordHandler.js"

import createDecaHandler from "./createDecaHandler.js"
import getDecaHandler from "./getDecaHandler.js"
import getAllDecasHandler from "./getAllDecasHandler.js"
import downloadDecaPublicHandler from "./downloadDecaPublicHandler.js"
import updateDecaHandler from "./updateDecaHandler.js"
import updateDecaTransportEndHandler from "./updateDecaTransportEndHandler.js"


export default {
  registerUserHandler,
  authenticateUserHandler,
  getUserNameHandler,
  updateProfileHandler,

  registerCustomHandler,
  getAllCustomersHandler,
  getProfileUserHandler,
  deleteCustomerHandler,
  updateCustomerProfileHandler,

  getAllDeliveryNotesCustomerHandler,
  getAllDeliveryNotesHandler,
  getDeliveryNoteHandler,
  deleteDeliveryNoteHandler,
  updateDateDeliveryNoteHandler,

  createDeliveryNoteHandler,

  createWorkHandler,
  updateWorkHandler,
  deleteWorkHandler,

  getAllInvoicesHandler,
  getInvoiceHandler,
  createInvoiceHandler,
  updateInvoiceDateHandler,
  updateInvoicePaymentTypeHandler,
  deleteInvoiceHandler,
  getAllInvoicesCustomerHandler,

  addNewObservation,

  requestPasswordResetHandler,
  resetPasswordHandler,

  createDecaHandler,
  getDecaHandler,
  getAllDecasHandler,
  downloadDecaPublicHandler,
  updateDecaHandler,
  updateDecaTransportEndHandler,
}