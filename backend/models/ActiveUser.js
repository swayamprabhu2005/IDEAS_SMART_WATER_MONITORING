const mongoose = require("mongoose");

const activeUserSchema = new mongoose.Schema({
  email: String,
  lastActive: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ActiveUser", activeUserSchema);