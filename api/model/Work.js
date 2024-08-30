import { Schema, model } from "mongoose"

const work = new Schema({
  concept: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
  }
})

const Work = model("Work", work)

export default Work