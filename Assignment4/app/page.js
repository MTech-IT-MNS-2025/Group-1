"use client";

import { useEffect, useState } from "react";

export default function Page() {
  // Store JavaScript wrappers for WASM functions
  const [encryptFunc, setEncryptFunc] = useState(null);
  const [decryptFunc, setDecryptFunc] = useState(null);

  // UI state fields
  const [text, setText] = useState(""); // Input plaintext or ciphertext
  const [key, setKey] = useState("");   // RC4 key
  const [output, setOutput] = useState(""); // Result after encrypt/decrypt

  useEffect(() => {
    // Configure the global Module object before loading rc4.js
    // Emscripten will read this and call onRuntimeInitialized
    window.Module = {
      onRuntimeInitialized() {
        // Bind C functions (rc4_encrypt, rc4_decrypt) to JS wrappers
        setEncryptFunc(() => Module.cwrap("rc4_encrypt", "string", ["string", "string"]));
        setDecryptFunc(() => Module.cwrap("rc4_decrypt", "string", ["string", "string"]));
      },
    };

    // Dynamically load the Emscripten-generated JS glue file
    const s = document.createElement("script");
    s.src = "/rc4.js"; // will automatically load rc4.wasm
    document.body.appendChild(s);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {/* Text input */}
      <div>Text:</div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: 300 }}
      />

      {/* Key input */}
      <div style={{ marginTop: 10 }}>Key:</div>
      <input
        value={key}
        onChange={(e) => setKey(e.target.value)}
        style={{ width: 300 }}
      />

      {/* Action buttons */}
      <div style={{ marginTop: 10 }}>
        <button onClick={() => encryptFunc ? setOutput(encryptFunc(text, key)) : setOutput("WASM not ready")}>
          Encrypt
        </button>

        <button onClick={() => decryptFunc ? setOutput(decryptFunc(text, key)) : setOutput("WASM not ready")} style={{ marginLeft: 8 }}>
          Decrypt
        </button>
      </div>

      {/* Output field */}
      <div style={{ marginTop: 10 }}>Output:</div>
      <input value={output} readOnly style={{ width: 300 }} />
    </div>
  );
}

