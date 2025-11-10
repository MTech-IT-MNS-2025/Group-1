
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from "socket.io-client";
import './App.css';

const ENDPOINT = `http://${window.location.hostname}:5000`;

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [form, setForm] = useState({ username: '', password: '' });
  const [user, setUser] = useState('');
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [to, setTo] = useState('');
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [message, setMessage] = useState('');
  const [unseen, setUnseen] = useState({});
  const [lastMessage, setLastMessage] = useState({});
  const socketRef = useRef(null);

  // Auto-login check on load
  useEffect(() => {
    axios.get(`${ENDPOINT}/me`, { withCredentials: true }).then(res => {
      if (res.data.loggedIn) {
        setUser(res.data.username);
        setLoggedIn(true);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (loggedIn && user) {
      socketRef.current = io(ENDPOINT, { transports: ['websocket'] });
      socketRef.current.emit('join', user);

      socketRef.current.on('private_message', (msg) => {
        if ((msg.from === user && msg.to === to) || (msg.from === to && msg.to === user)) {
          setMessages(prev => [...prev, msg]);
          setUnseen(prev => ({ ...prev, [msg.from]: 0 }));
        } else {
          setUnseen(prev => ({ ...prev, [msg.from]: (prev[msg.from] || 0) + 1 }));
        }
        setLastMessage(prev => {
          const chatPartner = msg.from === user ? msg.to : msg.from;
          return { ...prev, [chatPartner]: msg };
        });
      });

      socketRef.current.on('online', (list) => setOnlineUsers(list));

      return () => socketRef.current.disconnect();
    }
  }, [loggedIn, user, to]);

  useEffect(() => {
    if (loggedIn && user) {
      axios.get(`${ENDPOINT}/users/${user}`, { withCredentials: true }).then(res => setUsers(res.data));
      setUnseen({});
    }
  }, [loggedIn, user]);

  useEffect(() => {
    if (to && user) {
      axios.get(`${ENDPOINT}/messages/${user}/${to}`, { withCredentials: true }).then(res => setMessages(res.data));
      setUnseen(prev => ({ ...prev, [to]: 0 }));
    }
  }, [to, user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const url = `${ENDPOINT}/${authMode}`;
      const res = await axios.post(url, form, { withCredentials: true });
      setMessage(res.data);
      if (res.data.includes("successful")) {
        if (authMode === "login") {
          setUser(form.username);
          setLoggedIn(true);
          setMessage('');
        } else {
          setAuthMode("login");
        }
      }
    } catch {
      setMessage("Server error or network issue");
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    if (socketRef.current) {
      socketRef.current.emit('private_message', { from: user, to, content: msgInput });
      setMsgInput('');
    }
  };

  const handleLogout = () => {
    axios.post(`${ENDPOINT}/logout`, {}, { withCredentials: true }).then(() => {
      setLoggedIn(false);
      setUser('');
      setTo('');
      setMessages([]);
      setUnseen({});
    });
  };

  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sortedUsers = [...users].sort((a, b) => {
    const aTime = lastMessage[a.username]?.timestamp
      ? new Date(lastMessage[a.username].timestamp).getTime()
      : 0;
    const bTime = lastMessage[b.username]?.timestamp
      ? new Date(lastMessage[b.username].timestamp).getTime()
      : 0;
    return bTime - aTime;
  });

  if (!loggedIn) {
    return (
      <div className="auth-container">
        <h1>{authMode === 'login' ? "Login" : "Register"}</h1>
        {message && <p className="msg">{message}</p>}
        <form onSubmit={handleAuth}>
          <div>
            <label>Username:</label>
            <input name="username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" name="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit">{authMode === "login" ? "Login" : "Register"}</button>
        </form>
        <div>
          {authMode === "login"
            ? <>New user? <button onClick={() => { setAuthMode("register"); setMessage(""); }}>Register here</button></>
            : <>Already registered? <button onClick={() => { setAuthMode("login"); setMessage(""); }}>Login here</button></>
          }
        </div>
      </div>
    );
  }

  return (
    <div className="chat-app">
      <div className="sidebar">
        <div className="logged-in-banner">Logged in as <b>{user}</b></div>
        <h2>Users</h2>
        <ul>
          {sortedUsers.map(u => (
            <li key={u.username}>
              <button className={to === u.username ? "active" : ""}
                onClick={() => setTo(u.username)}>
                {u.username}
                {onlineUsers.includes(u.username) &&
                  <span style={{ marginLeft: "0.5em", color: "#18c922", fontWeight: "bold", fontSize: "1.1em" }}>●</span>
                }
                {unseen[u.username] > 0 &&
                  <span style={{
                    background: "#ff5630",
                    color: "#fff",
                    padding: "2px 7px",
                    marginLeft: ".4em",
                    borderRadius: "50%",
                    fontWeight: "bold",
                    fontSize: "0.9em"
                  }}>{unseen[u.username]}</span>
                }
                {lastMessage[u.username] &&
                  <span style={{ marginLeft: "0.5em", fontSize: "0.85em", color: "#6b6b6b" }}>
                    {lastMessage[u.username].content.length > 15
                      ? lastMessage[u.username].content.slice(0, 15) + "..."
                      : lastMessage[u.username].content}
                  </span>
                }
              </button>
            </li>
          ))}
        </ul>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </div>
      <div className="main-chat">
        <h2>Chat with {to ? to : "..."}</h2>
        <div className="chat-history">
          {messages.map((msg, idx) =>
            <div key={idx} className={msg.from === user ? "my-msg" : "their-msg"}>
              <span>
                <b>{msg.from}:</b> {msg.content}
              </span>
              <div className="time">{new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        {to &&
          <form className="send-form" onSubmit={handleSend}>
            <input value={msgInput} onChange={e => setMsgInput(e.target.value)} placeholder="Type a message..." />
            <button type="submit">Send</button>
          </form>
        }
      </div>
    </div>
  );
}

export default App;
