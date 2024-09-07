import "dotenv/config"
import mongoose from "mongoose"
import requestPasswordReset from "./requestPasswordReset.js"

const { MONGODB_URL } = process.env


mongoose.connect(MONGODB_URL)
  .then(() => {
    try {
      requestPasswordReset("jose.a.c.lopez@gmail.com")
        .then(() => {
          console.log("Email sent")
        })
        .catch(error => console.error(error))

    } catch (error) {
      console.error(error)
    }
  })
  .catch(error => console.error(error))