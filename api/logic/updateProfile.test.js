import "dotenv/config"
import mongoose from "mongoose"

import updateProfile from "./updateProfile.js"

const { MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    try {
      // updateProfile(
      //   "66ab9387e2e5e2ef52b61603",
      //   {
      //     username: "Jack",
      //     email: "jack@email.es",
      //     fullName: "Jack",
      //     companyName: "Sparrow Enterprice, Ltd.",
      //     address: "Calle Ron 21 Alicante 03680 Aspe",
      //     taxId: "74004321D",
      //     phone: "618111223",
      //     bankAccount: "ES61 1234 3456 42 0456323532",
      //     companyLogo: "https://media.giphy.com/media/SvFocn0wNMx0iv2rYz/giphy.gif?cid=ecf05e4754stf3bh4aak1rx98onmuiuder1iacipdfrq7jpb&ep=v1_gifs_search&rid=giphy.gif&ct=g"
      //   }
      // )
      updateProfile(
        "66ab9387e2e5e2ef52b61603",
        {
          username: "Jack"
        }
      )
        .then(() => {
          console.log("User Edited")
        })
        .catch((error) => console.error(error.message))

    } catch (error) {
      console.error(error.message)
    }
  })
  .catch(error => console.error(error.message)) 
