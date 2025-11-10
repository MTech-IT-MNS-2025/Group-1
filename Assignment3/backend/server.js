
// server.js
const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Import DB connection and models
const { connectDB, User, Message } = require('./db');

// ---------- Connect to Database ----------
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = 5000;
const onlineUsers = new Set();

// ---------- Middlewares ----------
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'a_random_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/loginDemoSessions' }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'lax',
    httpOnly: true,
    secure: false
  }
}));

// ---------- API Routes ----------
app.get('/me', async (req, res) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).select('username');
      if (!user) return res.json({ loggedIn: false });
      res.json({ loggedIn: true, username: user.username });
    } catch {
      res.json({ loggedIn: false });
    }
  } else {
    res.json({ loggedIn: false });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Logout failed');
    res.clearCookie('connect.sid');
    res.send('Logged out');
  });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) return res.send('User already exists. Please login or choose another username.');
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  res.send('Registration successful! Please login.');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.send('Not registered yet. Please register first.');
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.send('Incorrect password. Please try again.');
  req.session.userId = user._id;
  res.send('Login successful');
});

app.get('/users/:current', async (req, res) => {
  const allUsers = await User.find().select('username -_id');
  res.json(allUsers.filter(u => u.username !== req.params.current));
});

app.get('/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  const messages = await Message.find({
    $or: [{ from: user1, to: user2 }, { from: user2, to: user1 }]
  }).sort({ timestamp: 1 });
  res.json(messages);
});

// ---------- Socket.io ----------
io.on('connection', (socket) => {
  socket.on('join', (username) => {
    socket.username = username;
    onlineUsers.add(username);
    io.emit('online', Array.from(onlineUsers));
    socket.join(username);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      onlineUsers.delete(socket.username);
      io.emit('online', Array.from(onlineUsers));
    }
  });

  socket.on('private_message', async ({ from, to, content }) => {
    const newMsg = new Message({ from, to, content });
    await newMsg.save();
    io.to(to).emit('private_message', { from, to, content, timestamp: newMsg.timestamp });
    io.to(from).emit('private_message', { from, to, content, timestamp: newMsg.timestamp });
  });
});

// ---------- Start Server ----------
server.listen(PORT, () => {
  console.log(`🚀 Server with Socket.io running on http://localhost:${PORT}`);
});
