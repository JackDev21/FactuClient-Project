import "dotenv/config"
import mongoose from "mongoose"

import updateDeliveryNoteDate from "./updateDeliveryNoteDate.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {

    try {
      updateDeliveryNoteDate(
        "66cddd1cda2e8a2e8682ee70", "66e15bda2e27acebef8f345b",
        "25/09/2024"
      )
        .then(() => {
          console.log("Delivery note date updated")
        })
        .catch((error) => console.error(error.message))


    } catch (error) {
      console.error(error.message)
    }

  })
  .catch(error => console.error(error.message))