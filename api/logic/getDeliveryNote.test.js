import "dotenv/config"
import mongoose from "mongoose"

import getDeliveryNote from "./getDeliveryNote.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {

      getDeliveryNote("66b1237dd5adf0eb620e97bc", "66b22fce104bbfc07bb77cd6")
        .then((deliveryNote) => {
          console.log(deliveryNote)
        })
        .catch(error => console.error(error.message))

    } catch (error) {
      console.error(error.message)
    }
  })
  .catch(error => console.error(error.message))