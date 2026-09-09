import "dotenv/config"
import mongoose from "mongoose"

import getInvoice from "./getInvoice.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {

      getInvoice("66b1237dd5adf0eb620e97bc", "66b79aa87a52e317f23a0394")
        .then((invoice) => {
          console.log(invoice)
        })
        .catch(error => console.error(error.message))

    } catch (error) {
      console.error(error.message)
    }
  })
  .catch(error => console.error(error))
