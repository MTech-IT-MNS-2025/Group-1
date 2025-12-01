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
"[project]/utils/mongo.js [api] (ecmascript)", ((__turbopack_context__, module, exports) => {

// utils/mongo.js
const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs)");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pqchat";
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
let cached = /*TURBOPACK member replacement*/ __turbopack_context__.g.mongoose;
if (!cached) {
    cached = /*TURBOPACK member replacement*/ __turbopack_context__.g.mongoose = {
        conn: null,
        promise: null
    };
}
async function connect() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        const opts = {
            bufferCommands: false
        };
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose)=>{
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
module.exports = connect;
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
"[project]/pages/api/messages.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// pages/api/messages.js
__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mongo$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/mongo.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Message$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/Message.js [api] (ecmascript)");
;
;
async function handler(req, res) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mongo$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"])();
    const { user1, user2 } = req.query;
    if (!user1 || !user2) {
        return res.status(400).json({
            error: "Missing users"
        });
    }
    const messages = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Message$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"].find({
        $or: [
            {
                sender: user1,
                receiver: user2
            },
            {
                sender: user2,
                receiver: user1
            }
        ]
    }).sort({
        timestamp: 1
    });
    res.json(messages);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2a136f92._.js.map