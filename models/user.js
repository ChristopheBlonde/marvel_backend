const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    require: true,
    unique: true,
    type: String,
  },
  account: {
    username: {
      type: String,
      unique: true,
    },
    avatar: Object,
  },
  favorites: {
    comics: Array,
    characters: Array,
  },
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
