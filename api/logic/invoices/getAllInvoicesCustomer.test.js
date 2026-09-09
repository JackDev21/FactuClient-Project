import "dotenv/config"
import mongoose from "mongoose";

import getAllInvoicesCustomer from "./getAllInvoicesCustomer.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {
      getAllInvoicesCustomer("66cddd1cda2e8a2e8682ee70", "66cdde45da2e8a2e8683466d")
        .then((invoices) => {
          console.log(invoices)
        })
        .catch(error => console.error(error))
    } catch (error) {
      console.error(error)
    }
  })
  .catch(error => console.error(error))