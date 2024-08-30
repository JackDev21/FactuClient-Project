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

import createDeliveryNote from "./createDeliveryNote.js"
import createWork from "./createWork.js"

import getAllInvoices from "./getAllInvoices.js"
import getInvoice from "./getInvoice.js"
import createInvoice from "./createInvoice.js"
import deleteInvoice from "./deleteInvoice.js"
import getAllInvoicesCustomer from "./getAllInvoicesCustomer.js"
import updateCustomerProfile from "./updateCustomerProfile.js"

import addNewObservation from "./addNewObservation.js"


const logic = {
  isUserLoggedIn,
  loginUser,
  registerUser,
  logoutUser,
  getUserName,
  getInfo,

  registerCustomer,

  updateProfile,
  getProfileUser,
  getAllCustomers,
  deleteCustomer,
  updateCustomerProfile,

  getAllDeliveryNotesCustomer,
  getAllDeliveryNotes,
  getDeliveryNote,
  deleteDeliveryNote,


  createDeliveryNote,
  createWork,

  getAllInvoices,
  getInvoice,
  createInvoice,
  deleteInvoice,
  getAllInvoicesCustomer,

  addNewObservation
}

export default logic
