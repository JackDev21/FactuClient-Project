import isUserLoggedIn from "./isUserLoggedIn.js"
import registerUser from "./registerUser.js"
import loginUser from "./loginUser.js"
import getUserName from "./getUserName.js"
import logoutUser from "./logoutUser.js"
import getInfo from "./getInfo.js"

import getAllCustomers from "./getAllCustomers.js"
import registerCustomer from "./registerCustomer.js"
import deleteCustomer from "./deleteCustomer.js"

import updateProfile from "./updateProfile.js"
import getProfileUser from "./getProfileUser.js"

import getAllDeliveryNotesCustomer from "./getAllDeliveryNotesCustomer.js"
import getAllDeliveryNotes from "./getAllDeliveryNotes.js"
import getDeliveryNote from "./getDeliveryNote.js"
import deleteDeliveryNote from "./deleteDeliveryNote.js"
import updateDeliveryNoteDate from "./updateDeliveryNoteDate.js"
import updateInvoiceDate from "./updateInvoiceDate.js"

import createDeliveryNote from "./createDeliveryNote.js"
import createWork from "./createWork.js"
import updateInvoicePaymentType from "./updateInvoicePaymentType.js"

import getAllInvoices from "./getAllInvoices.js"
import getInvoice from "./getInvoice.js"
import createInvoice from "./createInvoice.js"
import deleteInvoice from "./deleteInvoice.js"
import getAllInvoicesCustomer from "./getAllInvoicesCustomer.js"
import updateCustomerProfile from "./updateCustomerProfile.js"

import addNewObservation from "./addNewObservation.js"

import requestPasswordReset from "./requestPasswordReset.js"
import resetPassword from "./resetPassword.js"


const logic = {
  isUserLoggedIn,
  loginUser,
  registerUser,
  logoutUser,
  getUserName,
  getInfo,

  registerCustomer,
  updateInvoicePaymentType,

  updateProfile,
  getProfileUser,
  getAllCustomers,
  deleteCustomer,
  updateCustomerProfile,

  getAllDeliveryNotesCustomer,
  getAllDeliveryNotes,
  getDeliveryNote,
  deleteDeliveryNote,
  updateDeliveryNoteDate,
  updateInvoiceDate,


  createDeliveryNote,
  createWork,

  getAllInvoices,
  getInvoice,
  createInvoice,
  deleteInvoice,
  getAllInvoicesCustomer,

  addNewObservation,

  requestPasswordReset,
  resetPassword,

}

export default logic
