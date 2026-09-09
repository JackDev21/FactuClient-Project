import "dotenv/config"
import mongoose from "mongoose";
import getAllCustomers from "./getAllCustomers.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {
      getAllCustomers("66ab9387e2e5e2ef52b61603")
        .then((customers) => {
          console.log(customers)
        })
        .catch(error => console.error(error))
    } catch (error) {
      console.error(error)
    }
  })
  .catch(error => console.error(error))