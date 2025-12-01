const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  
  // Plaintext text (fallback/system messages)
  text: { type: String, default: null },
  
  // --- 1. Copy for Receiver ---
  kemCiphertext: { type: String, default: null }, // base64
  aesIv: { type: String, default: null },         // base64
  ciphertext: { type: String, default: null },    // base64

  // --- 2. Copy for Sender (Self-Encryption) ---
  senderKemCiphertext: { type: String, default: null }, // base64
  senderAesIv: { type: String, default: null },         // base64
  senderCiphertext: { type: String, default: null },    // base64

  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Message || mongoose.model("Message", MessageSchema);