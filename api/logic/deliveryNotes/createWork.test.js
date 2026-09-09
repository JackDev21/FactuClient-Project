import "dotenv/config"
import mongoose from "mongoose"
import createWork from "./createWork.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {
      createWork("66b1237dd5adf0eb620e97bc", "66b5b0e7f5d70331b6465d60", "Trabajo de Lolo reparacion", 1, 50)
        .then((work) => {
          console.log(work)
        })
        .catch(error => console.error(error))

    } catch (error) {
      console.error(error)
    }
  })
  .catch(error => console.error(error))