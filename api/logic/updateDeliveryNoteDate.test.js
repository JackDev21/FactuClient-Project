import "dotenv/config"
import mongoose from "mongoose"

import updateDeliveryNoteDate from "./updateDeliveryNoteDate.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {

    try {
      updateDeliveryNoteDate(
        "66cddd1cda2e8a2e8682ee70", "66cdde45da2e8a2e8683466d", "66debaeb996c3e147553826f",
        "13/09/2024"
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