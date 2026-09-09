import "dotenv/config"
import mongoose from "mongoose"
import getUsername from "./getUserName.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {
      getUsername("66ab8bfdfe1709103dd2c982", "66ab8bfdfe1709103dd2c982")
        .then((user) => {
          console.log(`Username ${user} found`)
        })
        .catch((error) => console.error(error.message));
    } catch (error) {
      console.error(error.message)
    }

  })
  .catch((error) => console.error(error.message))


