module.exports = [
"[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react/jsx-dev-runtime", () => require("react/jsx-dev-runtime"));

module.exports = mod;
}),
"[externals]/socket.io-client [external] (socket.io-client, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("socket.io-client");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/react-dom [external] (react-dom, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react-dom", () => require("react-dom"));

module.exports = mod;
}),
"[project]/utils/pqc.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initPQC",
    ()=>initPQC,
    "kemDecapsulate",
    ()=>kemDecapsulate,
    "kemEncapsulate",
    ()=>kemEncapsulate
]);
let pqcModulePromise = null;
async function initPQC() {
    if (pqcModulePromise) return pqcModulePromise;
    // Load pqc.js dynamically (Next.js can't import from /public)
    await loadScript("/pqc.js");
    // createPqcModule is now available globally
    pqcModulePromise = window.createPqcModule({
        locateFile: ()=>"/pqc.wasm"
    });
    return pqcModulePromise;
}
function loadScript(src) {
    return new Promise((resolve, reject)=>{
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}
async function kemEncapsulate(pkB64) {
    const m = await initPQC();
    const pk = Uint8Array.from(atob(pkB64), (c)=>c.charCodeAt(0));
    const kemLen = 1088;
    const ssLen = 32;
    const pkPtr = m._malloc(pk.length);
    m.HEAPU8.set(pk, pkPtr);
    const kemPtr = m._malloc(kemLen);
    const ssPtr = m._malloc(ssLen);
    m._pqc_encaps(kemPtr, ssPtr, pkPtr);
    const kem = m.HEAPU8.slice(kemPtr, kemPtr + kemLen);
    const ss = m.HEAPU8.slice(ssPtr, ssPtr + ssLen);
    m._free(pkPtr);
    m._free(kemPtr);
    m._free(ssPtr);
    return {
        kemCiphertext: btoa(String.fromCharCode(...kem)),
        sharedSecret: ss
    };
}
async function kemDecapsulate(kemB64, skB64) {
    const m = await initPQC();
    const kem = Uint8Array.from(atob(kemB64), (c)=>c.charCodeAt(0));
    const sk = Uint8Array.from(atob(skB64), (c)=>c.charCodeAt(0));
    const ssLen = 32;
    const kemPtr = m._malloc(kem.length);
    const skPtr = m._malloc(sk.length);
    const ssPtr = m._malloc(ssLen);
    m.HEAPU8.set(kem, kemPtr);
    m.HEAPU8.set(sk, skPtr);
    m._pqc_decaps(ssPtr, kemPtr, skPtr);
    const ss = m.HEAPU8.slice(ssPtr, ssPtr + ssLen);
    m._free(kemPtr);
    m._free(skPtr);
    m._free(ssPtr);
    return ss;
}
}),
"[project]/utils/pqcMock.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * utils/pqcMock.js
 *
 * AES-GCM encryption/decryption using sharedSecret from ML-KEM.
 * Stable version with:
 *  - HKDF SHA-256
 *  - AES-GCM 12-byte IV
 *  - Safe Base64 decoding
 *  - Suppressed decrypt errors (to avoid UI crashes)
 */ __turbopack_context__.s([
    "aesDecrypt",
    ()=>aesDecrypt,
    "aesEncrypt",
    ()=>aesEncrypt,
    "deriveAESKey",
    ()=>deriveAESKey
]);
console.log("PQC Mock Loaded");
// ------------------------------------------------------
// Convert Base64 → Uint8Array safely
// ------------------------------------------------------
function b64ToU8(b64) {
    try {
        const bin = atob(b64);
        const out = new Uint8Array(bin.length);
        for(let i = 0; i < bin.length; i++)out[i] = bin.charCodeAt(i);
        return out;
    } catch  {
        return new Uint8Array([]); // return empty if invalid
    }
}
// ------------------------------------------------------
// Convert Uint8Array → Base64 safely
// ------------------------------------------------------
function u8ToB64(u8) {
    let bin = "";
    for(let i = 0; i < u8.length; i++){
        bin += String.fromCharCode(u8[i]);
    }
    return btoa(bin);
}
async function deriveAESKey(sharedSecret) {
    const keyMaterial = await crypto.subtle.importKey("raw", sharedSecret, "HKDF", false, [
        "deriveKey"
    ]);
    return crypto.subtle.deriveKey({
        name: "HKDF",
        hash: "SHA-256",
        salt: new Uint8Array(16),
        info: new Uint8Array([])
    }, keyMaterial, {
        name: "AES-GCM",
        length: 256
    }, false, [
        "encrypt",
        "decrypt"
    ]);
}
async function aesEncrypt(aesKey, plaintext) {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes
    const encrypted = await crypto.subtle.encrypt({
        name: "AES-GCM",
        iv
    }, aesKey, enc.encode(plaintext));
    return {
        iv: u8ToB64(iv),
        ciphertext: u8ToB64(new Uint8Array(encrypted))
    };
}
async function aesDecrypt(aesKey, ivB64, ciphertextB64) {
    try {
        // If missing, corrupted, or empty → skip
        if (!ivB64 || !ciphertextB64) return null;
        // Clean base64
        const clean = (s)=>(s || "").toString().replace(/[^A-Za-z0-9+/=]/g, "");
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
        const decrypted = await crypto.subtle.decrypt({
            name: "AES-GCM",
            iv
        }, aesKey, ciphertext);
        return new TextDecoder().decode(decrypted);
    } catch (e) {
        // DO NOT LOG — suppress error
        return null;
    }
}
}),
"[project]/pages/chat.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

// pages/chat.js
__turbopack_context__.s([
    "default",
    ()=>Chat
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$socket$2e$io$2d$client__$5b$external$5d$__$28$socket$2e$io$2d$client$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/socket.io-client [external] (socket.io-client, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqc$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/pqc.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqcMock$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/pqcMock.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$socket$2e$io$2d$client__$5b$external$5d$__$28$socket$2e$io$2d$client$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$socket$2e$io$2d$client__$5b$external$5d$__$28$socket$2e$io$2d$client$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
let socket;
// ----------------------------------------------------
// Helpers: Convert Uint8Array → Base64
// ----------------------------------------------------
function u8ToB64(u8) {
    let bin = "";
    for(let i = 0; i < u8.length; i++){
        bin += String.fromCharCode(u8[i]);
    }
    return btoa(bin);
}
function Chat() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [username, setUsername] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [recipient, setRecipient] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [text, setText] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const msgRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])([]);
    const privateKeyRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])("");
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
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const user = sessionStorage.getItem("username");
        const sk = sessionStorage.getItem("pqc_private_key");
        if (!user) {
            router.push("/");
            return;
        }
        setUsername(user);
        privateKeyRef.current = sk;
        socket = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$socket$2e$io$2d$client__$5b$external$5d$__$28$socket$2e$io$2d$client$2c$__esm_import$29$__["default"])();
        socket.on("connect", ()=>{
            socket.emit("register_user", user);
        });
        socket.on("receive_message", async (payload)=>{
            const txt = await decryptMsg(payload, privateKeyRef.current);
            if (!txt) return;
            msgRef.current = [
                ...msgRef.current,
                {
                    sender: payload.sender,
                    text: txt
                }
            ];
            setMessages([
                ...msgRef.current
            ]);
        });
        return ()=>{
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
            const ss = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqc$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["kemDecapsulate"])(m.kemCiphertext, mySK);
            const aesKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqcMock$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["deriveAESKey"])(ss);
            const plaintext = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqcMock$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["aesDecrypt"])(aesKey, m.aesIv, m.ciphertext);
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
        const res = await fetch(`/api/messages?user1=${username}&user2=${recipient}`);
        const data = await res.json();
        const out = [];
        for (let m of data){
            const txt = await decryptMsg(m, privateKeyRef.current);
            if (!txt) continue;
            out.push({
                sender: m.sender,
                text: txt
            });
        }
        msgRef.current = out;
        setMessages([
            ...out
        ]);
    }
    // ----------------------------------------------------
    // SEND MESSAGE
    // ----------------------------------------------------
    async function sendMessage() {
        if (!recipient || !text) return;
        const res = await fetch(`/api/users/${recipient}`);
        const data = await res.json();
        const receiverPk = data.pqPublicKey;
        const { kemCiphertext, sharedSecret } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqc$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["kemEncapsulate"])(receiverPk);
        const aesKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqcMock$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["deriveAESKey"])(sharedSecret);
        const enc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqcMock$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["aesEncrypt"])(aesKey, text);
        const kemB64 = kemCiphertext instanceof Uint8Array ? u8ToB64(kemCiphertext) : kemCiphertext;
        const ivB64 = enc.iv instanceof Uint8Array ? u8ToB64(enc.iv) : enc.iv;
        const ctB64 = enc.ciphertext instanceof Uint8Array ? u8ToB64(enc.ciphertext) : enc.ciphertext;
        const payload = {
            sender: username,
            receiver: recipient,
            kemCiphertext: kemB64,
            aesIv: ivB64,
            ciphertext: ctB64,
            timestamp: new Date().toISOString()
        };
        socket.emit("send_message", payload);
        msgRef.current = [
            ...msgRef.current,
            {
                sender: username,
                text
            }
        ];
        setMessages([
            ...msgRef.current
        ]);
        setText("");
    }
    // ----------------------------------------------------
    // UI
    // ----------------------------------------------------
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            maxWidth: 700,
            margin: "auto",
            padding: 20
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    justifyContent: "space-between"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                        children: [
                            "Welcome ",
                            username
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/chat.js",
                        lineNumber: 182,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        onClick: logout,
                        style: {
                            background: "red",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            height: "35px",
                            marginTop: "10px"
                        },
                        children: "Logout"
                    }, void 0, false, {
                        fileName: "[project]/pages/chat.js",
                        lineNumber: 185,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/chat.js",
                lineNumber: 181,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                style: {
                    width: "60%"
                },
                placeholder: "Recipient username",
                value: recipient,
                onChange: (e)=>setRecipient(e.target.value)
            }, void 0, false, {
                fileName: "[project]/pages/chat.js",
                lineNumber: 202,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                onClick: loadHistory,
                children: "Load Chat"
            }, void 0, false, {
                fileName: "[project]/pages/chat.js",
                lineNumber: 209,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 20,
                    height: 300,
                    overflowY: "scroll",
                    border: "1px solid black",
                    padding: 10
                },
                children: messages.filter((m)=>m && m.sender && m.text).map((msg, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: 10
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("b", {
                                children: [
                                    msg.sender,
                                    ": "
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/chat.js",
                                lineNumber: 224,
                                columnNumber: 15
                            }, this),
                            " ",
                            msg.text
                        ]
                    }, i, true, {
                        fileName: "[project]/pages/chat.js",
                        lineNumber: 223,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/pages/chat.js",
                lineNumber: 211,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 15
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                        style: {
                            width: "70%"
                        },
                        value: text,
                        onChange: (e)=>setText(e.target.value)
                    }, void 0, false, {
                        fileName: "[project]/pages/chat.js",
                        lineNumber: 230,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        onClick: sendMessage,
                        children: "Send"
                    }, void 0, false, {
                        fileName: "[project]/pages/chat.js",
                        lineNumber: 235,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/chat.js",
                lineNumber: 229,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/chat.js",
        lineNumber: 180,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f3513839._.js.map