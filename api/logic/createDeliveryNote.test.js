import "dotenv/config"
import mongoose from "mongoose"
import createDeliveryNote from "./createDeliveryNote.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {
      createDeliveryNote("66bb972f98051f33903e9a7c", "66bb97fe98051f33903f5e65")
        .then(() => {
          console.log("Delivery Note created")
        })
        .catch(error => console.error(error))

    } catch (error) {
      console.error(error)
    }
  })
  .catch(error => console.error(error))