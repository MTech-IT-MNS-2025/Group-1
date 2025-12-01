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
  // LOGOUT
  // ----------------------------------------------------
  function logout() {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("pqc_private_key");
    if (socket) socket.disconnect();
    router.push("/");
  }

  // ----------------------------------------------------
  // INITIALIZE SOCKET
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
      // Incoming live messages are always FOR ME (Receiver)
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
  // DECRYPT LOGIC (Updated for Self-Encryption)
  // ----------------------------------------------------
  async function decryptMsg(m, mySK) {
    try {
      if (!mySK) return null;

      let targetKem, targetIv, targetCt;

      // 1. Determine which "Box" to open
      if (m.sender === username) {
        // I am the sender -> Open the Sender Box
        targetKem = m.senderKemCiphertext;
        targetIv = m.senderAesIv;
        targetCt = m.senderCiphertext;
      } else {
        // I am the receiver -> Open the Receiver Box
        targetKem = m.kemCiphertext;
        targetIv = m.aesIv;
        targetCt = m.ciphertext;
      }

      // 2. Validate availability
      if (!targetKem || !targetIv || !targetCt) return null;

      // 3. PQC Decapsulate
      const ss = await kemDecapsulate(targetKem, mySK);
      
      // 4. Derive AES Key
      const aesKey = await deriveAESKey(ss);

      // 5. Decrypt Text
      const plaintext = await aesDecrypt(aesKey, targetIv, targetCt);
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
    if (!username || !recipient) return;

    const res = await fetch(
      `/api/messages?user1=${username}&user2=${recipient}`
    );
    const data = await res.json();

    const out = [];
    for (let m of data) {
      // decryptMsg now intelligently chooses which ciphertext to use
      const txt = await decryptMsg(m, privateKeyRef.current);
      if (!txt) continue;

      out.push({ sender: m.sender, text: txt });
    }

    msgRef.current = out;
    setMessages([...out]);
  }

  // ----------------------------------------------------
  // SEND MESSAGE (Updated for Dual Encryption)
  // ----------------------------------------------------
  async function sendMessage() {
    if (!recipient || !text) return;

    try {
      // 1. Fetch Recipient's Public Key
      const bobRes = await fetch(`/api/users/${recipient}`);
      if (!bobRes.ok) throw new Error("Recipient not found");
      const bobData = await bobRes.json();
      const bobPk = bobData.pqPublicKey;

      // 2. Fetch My Own Public Key (for self-encryption)
      const aliceRes = await fetch(`/api/users/${username}`);
      const aliceData = await aliceRes.json();
      const alicePk = aliceData.pqPublicKey;

      // --- PATH A: Encrypt for Recipient (Bob) ---
      const bobPQC = await kemEncapsulate(bobPk);
      const bobAES = await deriveAESKey(bobPQC.sharedSecret);
      const bobEnc = await aesEncrypt(bobAES, text);

      // --- PATH B: Encrypt for Myself (Alice) ---
      const alicePQC = await kemEncapsulate(alicePk);
      const aliceAES = await deriveAESKey(alicePQC.sharedSecret);
      const aliceEnc = await aesEncrypt(aliceAES, text);

      // Convert TypedArrays to Base64 for transport
      const payload = {
        sender: username,
        receiver: recipient,
        
        // Bob's Copy
        kemCiphertext: u8ToB64(bobPQC.kemCiphertext),
        aesIv: bobEnc.iv, // aesEncrypt helper already returns B64
        ciphertext: bobEnc.ciphertext,

        // Alice's Copy
        senderKemCiphertext: u8ToB64(alicePQC.kemCiphertext),
        senderAesIv: aliceEnc.iv,
        senderCiphertext: aliceEnc.ciphertext,

        timestamp: new Date().toISOString()
      };

      // 3. Emit
      socket.emit("send_message", payload);

      // 4. Optimistic UI Update
      msgRef.current = [...msgRef.current, { sender: username, text }];
      setMessages([...msgRef.current]);
      setText("");

    } catch (err) {
      alert("Failed to send message: " + err.message);
      console.error(err);
    }
  }

  // ----------------------------------------------------
  // UI RENDER
  // ----------------------------------------------------
  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Welcome {username}</h2>
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

      <button onClick={loadHistory} style={{ marginLeft: 10 }}>Load Chat</button>

      <div
        style={{
          marginTop: 20,
          height: 300,
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: 10,
          borderRadius: 4
        }}
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            style={{ 
              marginBottom: 10, 
              textAlign: msg.sender === username ? "right" : "left" 
            }}
          >
            <div style={{
              display: "inline-block",
              background: msg.sender === username ? "#d1e7dd" : "#f8d7da",
              padding: "5px 10px",
              borderRadius: "5px"
            }}>
              <b>{msg.sender}: </b> {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 15 }}>
        <input
          style={{ width: "70%", padding: 5 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} style={{ padding: "5px 15px", marginLeft: 5 }}>Send</button>
      </div>
    </div>
  );
}