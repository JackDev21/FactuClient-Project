import "dotenv/config"
import mongoose from "mongoose"
import deleteInvoice from "./deleteInvoice.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {

      deleteInvoice("66bdb9e2859c06c6535cfb14", "66bf45c2c7a4e1980b67af6d")
        .then(() => {
          console.log(`Invoice deleted`)
        })
        .catch(error => console.error(error))

    } catch (error) {
      console.error(error)
    }
  })
  .catch(error => console.error(error))