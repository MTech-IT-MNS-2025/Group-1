// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },

  // PQC Public Key (base64 string)
  pqPublicKey: { type: String, default: "" },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);

