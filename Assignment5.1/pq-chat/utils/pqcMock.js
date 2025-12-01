/**
 * utils/pqcMock.js
 *
 * AES-GCM encryption/decryption using sharedSecret from ML-KEM.
 * Stable version with:
 *  - HKDF SHA-256
 *  - AES-GCM 12-byte IV
 *  - Safe Base64 decoding
 *  - Suppressed decrypt errors (to avoid UI crashes)
 */

console.log("PQC Mock Loaded");

// ------------------------------------------------------
// Convert Base64 → Uint8Array safely
// ------------------------------------------------------
function b64ToU8(b64) {
  try {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return new Uint8Array([]); // return empty if invalid
  }
}

// ------------------------------------------------------
// Convert Uint8Array → Base64 safely
// ------------------------------------------------------
function u8ToB64(u8) {
  let bin = "";
  for (let i = 0; i < u8.length; i++) {
    bin += String.fromCharCode(u8[i]);
  }
  return btoa(bin);
}

// ------------------------------------------------------
// HKDF derive AES-256 key
// ------------------------------------------------------
export async function deriveAESKey(sharedSecret) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    sharedSecret,
    "HKDF",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(16),
      info: new Uint8Array([]),
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

// ------------------------------------------------------
// AES Encrypt (AES-GCM)
// ------------------------------------------------------
export async function aesEncrypt(aesKey, plaintext) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    enc.encode(plaintext)
  );

  return {
    iv: u8ToB64(iv),
    ciphertext: u8ToB64(new Uint8Array(encrypted))
  };
}

// ------------------------------------------------------
// AES Decrypt (AES-GCM) — FULLY SAFE VERSION
// ------------------------------------------------------
export async function aesDecrypt(aesKey, ivB64, ciphertextB64) {
  try {
    // If missing, corrupted, or empty → skip
    if (!ivB64 || !ciphertextB64) return null;

    // Clean base64
    const clean = (s) =>
      (s || "").toString().replace(/[^A-Za-z0-9+/=]/g, "");

    const ivClean = clean(ivB64);
    const ctClean = clean(ciphertextB64);

    // Validate base64 before decoding
    const b64regex = /^[A-Za-z0-9+/=]+$/;

    if (!b64regex.test(ivClean)) return null;
    if (!b64regex.test(ctClean)) return null;

    const iv = b64ToU8(ivClean);
    const ciphertext = b64ToU8(ctClean);

    // AES-GCM requires EXACTLY 12-byte IV
    if (iv.length !== 12) return null;

    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      aesKey,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    // DO NOT LOG — suppress error
    return null;
  }
}

