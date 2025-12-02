// server.js
require("dotenv").config();
const next = require("next");
const http = require("http");
const { Server: IOServer } = require("socket.io");
const dbConnect = require("./utils/mongo");
const Message = require("./models/Message");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const users = {}; // username => socket.id

app.prepare().then(async () => {
  await dbConnect();

  const server = http.createServer((req, res) => {
    return handle(req, res);
  });

  const io = new IOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("register_user", (username) => {
      if (!username) return;
      users[username] = socket.id;
      socket.username = username;
      console.log("Registered user:", username, "->", socket.id);
    });

    socket.on("send_message", async (payload) => {
      // payload expected:
      // { sender, receiver, text, kemCiphertext?, aesIv?, ciphertext? , timestamp? }
      try {
        const saved = await Message.create({
          sender: payload.sender,
          receiver: payload.receiver,
          text: payload.text || null,
          kemCiphertext: payload.kemCiphertext || null,
          aesIv: payload.aesIv || null,
          ciphertext: payload.ciphertext || null,
          timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date()
        });
        // forward to receiver if online
        const receiverSocketId = users[payload.receiver];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", {
            sender: payload.sender,
            receiver: payload.receiver,
            text: payload.text || null,
            kemCiphertext: payload.kemCiphertext || null,
            aesIv: payload.aesIv || null,
            ciphertext: payload.ciphertext || null,
            timestamp: saved.timestamp
          });
        }
      } catch (err) {
        console.error("error saving message:", err);
      }
    });

    socket.on("disconnect", () => {
      if (socket.username) {
        delete users[socket.username];
        console.log("Disconnected:", socket.username);
      }
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});

