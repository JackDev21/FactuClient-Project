import registerUser from "./registerUser.js"
import authenticateUser from "./authenticateUser.js"
import getUserName from "./getUserName.js"

import updateProfile from "./updateProfile.js"

import registerCustomer from "./registerCustomer.js"
import getAllCustomers from "./getAllCustomers.js"
import getProfileUser from "./getProfileUser.js"
import deleteCustomer from "./deleteCustomer.js"

import deleteDeliveryNote from "./deleteDeliveryNote.js"
import getAllDeliveryNotes from "./getAllDeliveryNotes.js"
import getDeliveryNote from "./getDeliveryNote.js"
import getAllDeliveryNotesCustomer from "./getAllDeliveryNotesCustomer.js"
import updateCustomerProfile from "./updateCustomerProfile.js"

import createDeliveryNote from "./createDeliveryNote.js"
import createWork from "./createWork.js"

import getAllInvoices from "./getAllInvoices.js"
import getInvoice from "./getInvoice.js"
import createInvoice from "./createInvoice.js"
import deleteInvoice from "./deleteInvoice.js"
import getAllInvoicesCustomer from "./getAllInvoicesCustomer.js"
import updateDeliveryNoteDate from "./updateDeliveryNoteDate.js"
import updateInvoiceDate from "./updateInvoiceDate.js"

import addNewObservation from "./addNewObservation.js"

import requestPasswordReset from "./requestPasswordReset.js"
import resetPassword from "./resetPassword.js"


const logic = {
  registerUser,
  authenticateUser,
  getUserName,

  updateProfile,

  registerCustomer,
  getAllCustomers,
  getProfileUser,
  deleteCustomer,
  updateCustomerProfile,

  getAllDeliveryNotes,
  getDeliveryNote,
  deleteDeliveryNote,
  getAllDeliveryNotesCustomer,
  updateDeliveryNoteDate,

  createDeliveryNote,
  createWork,

  getAllInvoices,
  getInvoice,
  createInvoice,
  deleteInvoice,
  getAllInvoicesCustomer,
  updateInvoiceDate,

  addNewObservation,

  requestPasswordReset,
  resetPassword,
}

export default logic