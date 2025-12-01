// pages/api/messages.js
import connectDB from "../../utils/mongo";
import Message from "../../models/Message";

export default async function handler(req, res) {
  await connectDB();

  const { user1, user2 } = req.query;

  if (!user1 || !user2) {
    return res.status(400).json({ error: "Missing users" });
  }

  const messages = await Message.find({
    $or: [
      { sender: user1, receiver: user2 },
      { sender: user2, receiver: user1 }
    ]
  }).sort({ timestamp: 1 });

  res.json(messages);
}

