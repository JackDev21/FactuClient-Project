import "dotenv/config"
import mongoose from "mongoose"
import resetPassword from "./resetPassword.js"

const { MONGODB_URL } = process.env


mongoose.connect(MONGODB_URL)
  .then(() => {
    try {
      resetPassword("66cddd1cda2e8a2e8682ee70", "1234", "1234", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NmNkZGQxY2RhMmU4YTJlODY4MmVlNzAiLCJpYXQiOjE3MjU2MjgwMTYsImV4cCI6MTcyNTYyODkxNn0.q_8u_uwA7RAAOf9FuBolA_VYlolMPFygnZ5I7QYkdWI")
        .then(() => {
          console.log("Password reset")
        })
        .catch(error => console.error(error))

    } catch (error) {
      console.error(error)
    }
  })
  .catch(error => console.error(error))