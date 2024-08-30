import "dotenv/config"
import mongoose from "mongoose"

import getAllDeliveryNotesCustomer from "./getAllDeliveryNotesCustomer.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {

      getAllDeliveryNotesCustomer("66bdb9e2859c06c6535cfb14", "66bdc5b554aa0a66b0c33832")
        .then((deliveryNotes) => {
          console.log(deliveryNotes)
        })
        .catch(error => console.error(error.message))

    } catch (error) {
      console.error(error.message)
    }
  })
  .catch(error => console.error(error.message))