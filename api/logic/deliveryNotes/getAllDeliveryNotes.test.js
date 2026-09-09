import "dotenv/config"
import mongoose from "mongoose"

import getAllDeliveryNotes from "./getAllDeliveryNotes.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {

      getAllDeliveryNotes("66b1237dd5adf0eb620e97bc")
        .then((deliveryNotes) => {
          console.log(deliveryNotes)
        })
        .catch((error) => console.error(error))

    } catch (error) {
      console.error(error)
    }
  })
  .catch((error) => console.error(error))
