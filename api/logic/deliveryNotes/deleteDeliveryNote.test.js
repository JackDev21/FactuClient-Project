import "dotenv/config"
import mongoose from "mongoose"
import deleteDeliveryNote from "./deleteDeliveryNote.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {

    try {
      deleteDeliveryNote("66bdd4c732fcba8cafde2520", "66c0e39605d77f3a6c2fdb8c")
        .then(() => {
          console.log(`Delivery note deleted`)
        })
        .catch(error => console.error(error))

    } catch (error) {
      console.error(error)
    }

  })
  .catch(error => console.error(error))