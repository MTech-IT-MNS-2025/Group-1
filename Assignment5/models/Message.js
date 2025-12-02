// models/Message.js
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  // plaintext text for classic non-encrypted mode; for PQ mode we'll use ciphertext fields
  text: { type: String, default: null },
  // PQ fields (nullable)
  kemCiphertext: { type: String, default: null }, // base64
  aesIv: { type: String, default: null }, // base64
  ciphertext: { type: String, default: null }, // base64 AES-GCM output (ciphertext+tag)
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Message || mongoose.model("Message", MessageSchema);

