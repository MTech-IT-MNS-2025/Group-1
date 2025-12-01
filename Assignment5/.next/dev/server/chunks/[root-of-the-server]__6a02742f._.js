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
"[project]/models/User.js [api] (ecmascript)", ((__turbopack_context__, module, exports) => {

// models/User.js
const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs)");
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    // PQC Public Key (base64 string)
    pqPublicKey: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
}),
"[project]/pages/api/register.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// pages/api/register.js
__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mongo$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/mongo.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/User.js [api] (ecmascript)");
;
;
async function handler(req, res) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mongo$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"])();
    if (req.method === "POST") {
        const { username, pqPublicKey } = req.body;
        if (!username) {
            return res.status(400).json({
                error: "username required"
            });
        }
        try {
            let user = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"].findOne({
                username
            });
            if (user) {
                // Update only public key if new one is provided
                if (pqPublicKey) user.pqPublicKey = pqPublicKey;
                await user.save();
                return res.status(200).json({
                    ok: true,
                    user
                });
            }
            user = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"].create({
                username,
                pqPublicKey: pqPublicKey || ""
            });
            return res.status(201).json({
                ok: true,
                user
            });
        } catch (err) {
            return res.status(500).json({
                error: err.message
            });
        }
    }
    return res.status(405).json({
        error: "Method not allowed"
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6a02742f._.js.map