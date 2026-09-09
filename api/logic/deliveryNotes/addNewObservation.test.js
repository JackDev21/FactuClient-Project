import "dotenv/config"
import mongoose from "mongoose"
import addNewObservation from "./addNewObservation.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {
      addNewObservation("66cc6efcc4857b5de3d10ec8", "66cc71f585b6d3b4faed454c", "Observacion de Prueba")
        .then((observation) => {
          console.log(observation)
        })
        .catch(error => console.error(error))

    } catch (error) {
      console.error(error)
    }
  })
  .catch(error => console.error(error))
