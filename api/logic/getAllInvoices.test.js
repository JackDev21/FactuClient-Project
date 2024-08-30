import "dotenv/config"
import mongoose from "mongoose";

import getAllInvoices from "./getAllInvoices.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {
      getAllInvoices("66b1237dd5adf0eb620e97bc")
        .then((invoices) => {
          console.log(invoices)
        })
        .catch(error => console.error(error))
    } catch (error) {
      console.error(error)
    }
  })
  .catch(error => console.error(error))