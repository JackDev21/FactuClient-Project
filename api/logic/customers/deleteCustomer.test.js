import "dotenv/config"
import mongoose from "mongoose"
import deleteCustomer from "./deleteCustomer.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {

    try {
      deleteCustomer("66c44e9b220373c3309cfa43", "66c44efa220373c3309d24d3")
        .then(() => {
          console.log(`Customer deactivated`)
        })
        .catch(error => console.error(error))
    } catch (error) {
      console.error(error)
    }
  })
  .catch(error => console.error(error))
