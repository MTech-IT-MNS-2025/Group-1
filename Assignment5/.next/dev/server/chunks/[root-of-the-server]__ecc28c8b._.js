module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/mongoose [external] (mongoose, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mongoose", () => require("mongoose"));

module.exports = mod;
}),
"[project]/models/Message.js [api] (ecmascript)", ((__turbopack_context__, module, exports) => {

// models/Message.js
const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs)");
const MessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    // plaintext text for classic non-encrypted mode; for PQ mode we'll use ciphertext fields
    text: {
        type: String,
        default: null
    },
    // PQ fields (nullable)
    kemCiphertext: {
        type: String,
        default: null
    },
    aesIv: {
        type: String,
        default: null
    },
    ciphertext: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.models.Message || mongoose.model("Message", MessageSchema);
}),
"[project]/pages/api/debug.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Message$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/Message.js [api] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '../../utils/db'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
;
async function handler(req, res) {
    await connectDB();
    const msgs = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Message$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"].find().limit(5);
    res.json(msgs);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ecc28c8b._.js.map