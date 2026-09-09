import "dotenv/config"
import authenticateUser from "./authenticateUser.js"
import mongoose from "mongoose"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {

      authenticateUser("Jack", "1234")
        .then((user) => {
          console.log(`User ${user.userId} authenticated with role ${user.role} `)
        })
        .catch(error => console.error(error))

    } catch (error) {
      console.error(error)
    }

  })
  .catch(error => console.error(error))