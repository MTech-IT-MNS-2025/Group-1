// pages/api/register.js
import dbConnect from "../../utils/mongo";
import User from "../../models/User";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { username, pqPublicKey } = req.body;

    if (!username) {
      return res.status(400).json({ error: "username required" });
    }

    try {
      let user = await User.findOne({ username });

      if (user) {
        // Update only public key if new one is provided
        if (pqPublicKey) user.pqPublicKey = pqPublicKey;
        await user.save();
        return res.status(200).json({ ok: true, user });
      }

      user = await User.create({
        username,
        pqPublicKey: pqPublicKey || ""
      });

      return res.status(201).json({ ok: true, user });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

