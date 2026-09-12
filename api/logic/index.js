import authLogic from "./auth/index.js"
import userLogic from "./users/index.js"
import customerLogic from "./customers/index.js"
import deliveryNoteLogic from "./deliveryNotes/index.js"
import invoiceLogic from "./invoices/index.js"
import decaLogic from "./deca/index.js"
import driverLogic from "./drivers/index.js"
import verifactuLogic from "./verifactu/index.js"

// Re-export individual functions
export * from "./auth/index.js"
export * from "./users/index.js"
export * from "./customers/index.js"
export * from "./deliveryNotes/index.js"
export * from "./invoices/index.js"
export * from "./deca/index.js"
export * from "./drivers/index.js"
export * from "./verifactu/index.js"

// Re-export domain bundles
export {
  authLogic,
  userLogic,
  customerLogic,
  deliveryNoteLogic,
  invoiceLogic,
  decaLogic,
  driverLogic,
  verifactuLogic,
}

// Unified master object for backward compatibility
const logic = {
  ...authLogic,
  ...userLogic,
  ...customerLogic,
  ...deliveryNoteLogic,
  ...invoiceLogic,
  ...decaLogic,
  ...driverLogic,
  ...verifactuLogic,
}

export default logic