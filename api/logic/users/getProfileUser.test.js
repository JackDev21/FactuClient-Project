import "dotenv/config"
import mongoose from "mongoose"
import getProfileUser from "./getProfileUser.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {
      getProfileUser("66ab9387e2e5e2ef52b61603", "66ab9478e2e5e2ef52b6160a")
        .then((targetUser) => {
          console.log(targetUser)
        })
        .catch((error) => console.error(error.message))
    } catch (error) {
      console.error(error.message)
    }
  })
  .catch((error) => console.error(error.message))