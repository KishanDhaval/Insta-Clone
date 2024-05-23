const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/InstaClone");

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post",
  }],
  picture: {
    type: String,
    default: "def.png",
  },
  contact: String,
  bio: String,
  saved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  stories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "story",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
});


module.exports = mongoose.model("user" , userSchema)