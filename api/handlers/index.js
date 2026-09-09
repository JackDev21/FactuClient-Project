import authHandlers from "./auth/index.js"
import userHandlers from "./users/index.js"
import customerHandlers from "./customers/index.js"
import deliveryNoteHandlers from "./deliveryNotes/index.js"
import invoiceHandlers from "./invoices/index.js"
import decaHandlers from "./deca/index.js"
import errorHandler from "./errorHandler.js"

// Re-export individual handlers
export * from "./auth/index.js"
export * from "./users/index.js"
export * from "./customers/index.js"
export * from "./deliveryNotes/index.js"
export * from "./invoices/index.js"
export * from "./deca/index.js"

// Domain bundles & error handler
export {
  authHandlers,
  userHandlers,
  customerHandlers,
  deliveryNoteHandlers,
  invoiceHandlers,
  decaHandlers,
  errorHandler,
}

// Backward-compatible named aliases
export const registerCustomHandler = customerHandlers.registerCustomerHandler
export const updateDateDeliveryNoteHandler = deliveryNoteHandlers.updateDeliveryNoteDateHandler
export const addNewObservation = deliveryNoteHandlers.addNewObservationHandler

// Unified default export for backwards compatibility
const handlers = {
  ...authHandlers,
  ...userHandlers,
  ...customerHandlers,
  ...deliveryNoteHandlers,
  ...invoiceHandlers,
  ...decaHandlers,

  // Legacy aliases
  registerCustomHandler,
  updateDateDeliveryNoteHandler,
  addNewObservation,
  errorHandler,
}

export default handlers