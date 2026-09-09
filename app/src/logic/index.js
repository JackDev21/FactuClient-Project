// --- 1. Autenticación y Sesión ---
import isUserLoggedIn from "./auth/isUserLoggedIn.js"
import registerUser from "./auth/registerUser.js"
import loginUser from "./auth/loginUser.js"
import logoutUser from "./auth/logoutUser.js"
import requestPasswordReset from "./auth/requestPasswordReset.js"
import resetPassword from "./auth/resetPassword.js"

// --- 2. Perfil de Empresa y Usuario ---
import getInfo from "./users/getInfo.js"
import getUserName from "./users/getUserName.js"
import getProfileUser from "./users/getProfileUser.js"
import updateProfile from "./users/updateProfile.js"

// --- 3. Clientes ---
import getAllCustomers from "./customers/getAllCustomers.js"
import registerCustomer from "./customers/registerCustomer.js"
import deleteCustomer from "./customers/deleteCustomer.js"
import updateCustomerProfile from "./customers/updateCustomerProfile.js"

// --- 4. Albaranes y Partidas (Works) ---
import getAllDeliveryNotes from "./deliveryNotes/getAllDeliveryNotes.js"
import getAllDeliveryNotesCustomer from "./deliveryNotes/getAllDeliveryNotesCustomer.js"
import getDeliveryNote from "./deliveryNotes/getDeliveryNote.js"
import createDeliveryNote from "./deliveryNotes/createDeliveryNote.js"
import deleteDeliveryNote from "./deliveryNotes/deleteDeliveryNote.js"
import updateDeliveryNoteDate from "./deliveryNotes/updateDeliveryNoteDate.js"
import addNewObservation from "./deliveryNotes/addNewObservation.js"
import createWork from "./deliveryNotes/createWork.js"
import updateWork from "./deliveryNotes/updateWork.js"
import deleteWork from "./deliveryNotes/deleteWork.js"

// --- 5. Facturas y Cobros ---
import getAllInvoices from "./invoices/getAllInvoices.js"
import getAllInvoicesCustomer from "./invoices/getAllInvoicesCustomer.js"
import getInvoice from "./invoices/getInvoice.js"
import createInvoice from "./invoices/createInvoice.js"
import deleteInvoice from "./invoices/deleteInvoice.js"
import updateInvoiceDate from "./invoices/updateInvoiceDate.js"
import updateInvoicePaymentType from "./invoices/updateInvoicePaymentType.js"

// --- 6. DeCA (Documento Electrónico de Control Administrativo) ---
import createDeca from "./deca/createDeca.js"
import getDeca from "./deca/getDeca.js"
import getAllDecas from "./deca/getAllDecas.js"
import updateDeca from "./deca/updateDeca.js"
import updateDecaTransportEnd from "./deca/updateDecaTransportEnd.js"

const logic = {
  // Auth
  isUserLoggedIn,
  loginUser,
  registerUser,
  logoutUser,
  requestPasswordReset,
  resetPassword,

  // Users
  getInfo,
  getUserName,
  getProfileUser,
  updateProfile,

  // Customers
  getAllCustomers,
  registerCustomer,
  deleteCustomer,
  updateCustomerProfile,

  // Delivery Notes
  getAllDeliveryNotes,
  getAllDeliveryNotesCustomer,
  getDeliveryNote,
  createDeliveryNote,
  deleteDeliveryNote,
  updateDeliveryNoteDate,
  addNewObservation,
  createWork,
  updateWork,
  deleteWork,

  // Invoices
  getAllInvoices,
  getAllInvoicesCustomer,
  getInvoice,
  createInvoice,
  deleteInvoice,
  updateInvoiceDate,
  updateInvoicePaymentType,

  // DeCA
  createDeca,
  getDeca,
  getAllDecas,
  updateDeca,
  updateDecaTransportEnd,
}

export default logic
