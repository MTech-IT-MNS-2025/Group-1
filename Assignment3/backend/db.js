// db.js
const mongoose = require('mongoose');

// ---------- MongoDB Connection ----------
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/loginDemo', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// ---------- Schemas & Models ----------

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});
const User = mongoose.model('User', userSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  from: String,
  to: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);

// Export everything
module.exports = {
  connectDB,
  User,
  Message
};
