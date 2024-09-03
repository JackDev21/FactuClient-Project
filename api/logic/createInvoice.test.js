import "dotenv/config"
import mongoose from "mongoose"
import createInvoice from "./createInvoice.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {
      createInvoice("66cde194da2e8a2e868346f9", "66d58e5992c70d1351ff7983", ["66d58f0ed567e8b81ea104c7"])
        .then(() => {
          console.log("Invoice created")
        })
        .catch((error) => console.error(error))

    } catch (error) {
      console.error(error)
    }
  })
  .catch((error) => console.error(error))