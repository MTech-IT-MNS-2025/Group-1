"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [modexpFunc, setModexpFunc] = useState(null);
  const [p, setP] = useState("");
  const [g, setG] = useState("");
  const [a, setA] = useState(null);
  const [x, setX] = useState(null);
  const [y, setY] = useState(null);
  const [K, setK] = useState(null);

  // --------------------------
  // Load WASM
  // --------------------------
  useEffect(() => {
    window.Module = {
      locateFile: (file) => {
        if (file.endsWith(".wasm")) return `/myProg.wasm`;
        return file;
      },
      onRuntimeInitialized() {
        const fn = Module.cwrap("modexp", "bigint", ["bigint", "bigint", "bigint"]);
        setModexpFunc(() => fn);
      },
    };

    const script = document.createElement("script");
    script.src = "/myProg.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // --------------------------
  // Generate random number 1 <= val < p
  // --------------------------
  function randomZp(pVal) {
    return BigInt(Math.floor(Math.random() * (Number(pVal) - 1)) + 1);
  }

  // --------------------------
  // Connect / compute Diffie-Hellman
  // --------------------------
  async function handleConnect() {
    if (!modexpFunc) {
      alert("WASM not ready!");
      return;
    }

    const pVal = BigInt(p);
    const gVal = BigInt(g);

    if (!pVal || !gVal || pVal <= 1n || gVal <= 0n) {
      alert("Enter valid numbers for p and g!");
      return;
    }

    // Client secret a
    const aVal = randomZp(pVal);
    setA(aVal.toString());

    // Client public x = g^a mod p (WASM)
    const xVal = modexpFunc(gVal, aVal, pVal);
    setX(xVal.toString());

    // Send <g, p, x> to server
    try {
      const res = await fetch("/api/run-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          g: gVal.toString(),
          p: pVal.toString(),
          x: xVal.toString(),
        }),
      });

      const data = await res.json();
      setY(data.y);
      setK(data.K);
    } catch (err) {
      console.error(err);
      alert("Server error: " + err.message);
    }
  }

  // --------------------------
  // Styling
  // --------------------------
  const inputStyle = { width: 200, padding: 6, fontSize: 14, marginRight: 8 };
  const outputBoxStyle = {
    width: 300,
    padding: 6,
    background: "#f5f5f5",
    fontFamily: "monospace",
    wordBreak: "break-all",
  };

  // --------------------------
  // Render
  // --------------------------
  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Diffie-Hellman</h1>

      <div style={{ marginTop: 16 }}>
        <input
          type="number"
          placeholder="Enter value of p"
          value={p}
          onChange={(e) => setP(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        <input
          type="number"
          placeholder="Enter value of g"
          value={g}
          onChange={(e) => setG(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={handleConnect}
          style={{
            padding: "8px 16px",
            backgroundColor: "#888",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#555")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#888")}
        >
          Connect to Server
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Client Secret a:</strong>
        <div style={outputBoxStyle}>{a}</div>
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Client Public x:</strong>
        <div style={outputBoxStyle}>{x}</div>
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Server Public y:</strong>
        <div style={outputBoxStyle}>{y}</div>
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Shared Key K:</strong>
        <div style={outputBoxStyle}>{K}</div>
      </div>
    </main>
  );
}

