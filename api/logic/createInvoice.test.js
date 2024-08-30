import "dotenv/config"
import mongoose from "mongoose"
import createInvoice from "./createInvoice.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {
      createInvoice("66bb972f98051f33903e9a7c", "66bb97fe98051f33903f5e65", ["66bb9a3498051f33904105f1"])
        .then(() => {
          console.log("Invoice created")
        })
        .catch((error) => console.error(error))

    } catch (error) {
      console.error(error)
    }
  })
  .catch((error) => console.error(error))