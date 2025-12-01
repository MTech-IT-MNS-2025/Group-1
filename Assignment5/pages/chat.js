// pages/chat.js
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useRouter } from "next/router";

import {
  kemEncapsulate,
  kemDecapsulate
} from "../utils/pqc";

import {
  deriveAESKey,
  aesEncrypt,
  aesDecrypt
} from "../utils/pqcMock";

let socket;

// ----------------------------------------------------
// Helpers: Convert Uint8Array → Base64
// ----------------------------------------------------
function u8ToB64(u8) {
  let bin = "";
  for (let i = 0; i < u8.length; i++) {
    bin += String.fromCharCode(u8[i]);
  }
  return btoa(bin);
}

export default function Chat() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [recipient, setRecipient] = useState("");
  const [text, setText] = useState("");

  const [messages, setMessages] = useState([]);
  const msgRef = useRef([]);

  const privateKeyRef = useRef("");

  // ----------------------------------------------------
  // LOGOUT → remove secret keys everywhere
  // ----------------------------------------------------
  function logout() {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("pqc_private_key");

    // cleanup localStorage (important!)
    localStorage.removeItem("pqc_seckey");
    localStorage.removeItem("pq_seckey");
    localStorage.removeItem("pqc_private_key");
    localStorage.removeItem("pqc_sk");
    localStorage.removeItem("token");

    if (socket) socket.disconnect();

    router.push("/");
  }

  // ----------------------------------------------------
  // INITIALIZE SOCKET + LOAD USER SESSION
  // ----------------------------------------------------
  useEffect(() => {
    const user = sessionStorage.getItem("username");
    const sk = sessionStorage.getItem("pqc_private_key");

    if (!user) {
      router.push("/");
      return;
    }

    setUsername(user);
    privateKeyRef.current = sk;

    socket = io();

    socket.on("connect", () => {
      socket.emit("register_user", user);
    });

    socket.on("receive_message", async (payload) => {
      const txt = await decryptMsg(payload, privateKeyRef.current);

      if (!txt) return;

      msgRef.current = [...msgRef.current, { sender: payload.sender, text: txt }];
      setMessages([...msgRef.current]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ----------------------------------------------------
  // DECRYPT HISTORY + LIVE MESSAGES
  // ----------------------------------------------------
  async function decryptMsg(m, mySK) {
    try {
      if (!m.kemCiphertext || !m.aesIv || !m.ciphertext) return null;
      if (!mySK) return null;

      const ss = await kemDecapsulate(m.kemCiphertext, mySK);
      const aesKey = await deriveAESKey(ss);

      const plaintext = await aesDecrypt(aesKey, m.aesIv, m.ciphertext);
      return plaintext;
    } catch (err) {
      console.error("decrypt failed:", err);
      return null;
    }
  }

  // ----------------------------------------------------
  // LOAD HISTORY
  // ----------------------------------------------------
  async function loadHistory() {
    const res = await fetch(
      `/api/messages?user1=${username}&user2=${recipient}`
    );
    const data = await res.json();

    const out = [];
    for (let m of data) {
      const txt = await decryptMsg(m, privateKeyRef.current);
      if (!txt) continue;

      out.push({ sender: m.sender, text: txt });
    }

    msgRef.current = out;
    setMessages([...out]);
  }

  // ----------------------------------------------------
  // SEND MESSAGE
  // ----------------------------------------------------
  async function sendMessage() {
    if (!recipient || !text) return;

    const res = await fetch(`/api/users/${recipient}`);
    const data = await res.json();
    const receiverPk = data.pqPublicKey;

    const { kemCiphertext, sharedSecret } =
      await kemEncapsulate(receiverPk);

    const aesKey = await deriveAESKey(sharedSecret);
    const enc = await aesEncrypt(aesKey, text);

    const kemB64 =
      kemCiphertext instanceof Uint8Array ? u8ToB64(kemCiphertext) : kemCiphertext;

    const ivB64 =
      enc.iv instanceof Uint8Array ? u8ToB64(enc.iv) : enc.iv;

    const ctB64 =
      enc.ciphertext instanceof Uint8Array ? u8ToB64(enc.ciphertext) : enc.ciphertext;

    const payload = {
      sender: username,
      receiver: recipient,
      kemCiphertext: kemB64,
      aesIv: ivB64,
      ciphertext: ctB64,
      timestamp: new Date().toISOString()
    };

    socket.emit("send_message", payload);

    msgRef.current = [...msgRef.current, { sender: username, text }];
    setMessages([...msgRef.current]);
    setText("");
  }

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------
  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Welcome {username}</h2>

        {/* Logout Button */}
        <button
          onClick={logout}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            height: "35px",
            marginTop: "10px"
          }}
        >
          Logout
        </button>
      </div>

      <input
        style={{ width: "60%" }}
        placeholder="Recipient username"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />

      <button onClick={loadHistory}>Load Chat</button>

      <div
        style={{
          marginTop: 20,
          height: 300,
          overflowY: "scroll",
          border: "1px solid black",
          padding: 10
        }}
      >
        {messages
          .filter(m => m && m.sender && m.text)
          .map((msg, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <b>{msg.sender}: </b> {msg.text}
            </div>
          ))}
      </div>

      <div style={{ marginTop: 15 }}>
        <input
          style={{ width: "70%" }}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

