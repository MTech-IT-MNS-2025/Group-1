// pages/api/users/[username].js
import dbConnect from "../../../utils/mongo";
import User from "../../../models/User";

export default async function handler(req, res) {
  await dbConnect();

  const { username } = req.query;

  const user = await User.findOne({ username }).lean();

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({
    username: user.username,
    pqPublicKey: user.pqPublicKey || ""
  });
}

