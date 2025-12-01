// pages/index.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [username, setUsername] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [privateKeyFile, setPrivateKeyFile] = useState(null);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!username) return alert("Enter username");

    await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, pqPublicKey: publicKey })
    });

    sessionStorage.setItem("username", username);

    if (privateKeyFile) {
      const text = await privateKeyFile.text();
      sessionStorage.setItem("pqc_private_key", text);
    }

    router.push("/chat");
  }

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: 20 }}>
      <h1>Login / Register</h1>

      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>PQC Public Key (Base64)</label>
        <textarea
          value={publicKey}
          onChange={(e) => setPublicKey(e.target.value)}
          style={{ width: "100%", height: 100, marginBottom: 10 }}
        />

        <label>Upload PQC Private Key</label>
        <input
          type="file"
          onChange={(e) => setPrivateKeyFile(e.target.files[0])}
          style={{ marginBottom: 10 }}
        />

        <button type="submit">Enter Chat</button>
      </form>
    </div>
  );
}

