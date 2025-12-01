(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/utils/pqc.js [client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/pqcMock.js [client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/pages/chat.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// pages/chat.js
__turbopack_context__.s([
    "default",
    ()=>Chat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/socket.io-client/build/esm/index.js [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqc$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/pqc.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqcMock$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/pqcMock.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
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
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [username, setUsername] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [recipient, setRecipient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [text, setText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const msgRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const privateKeyRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])("");
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Chat.useEffect": ()=>{
            const user = sessionStorage.getItem("username");
            const sk = sessionStorage.getItem("pqc_private_key");
            if (!user) {
                router.push("/");
                return;
            }
            setUsername(user);
            privateKeyRef.current = sk;
            socket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])();
            socket.on("connect", {
                "Chat.useEffect": ()=>{
                    socket.emit("register_user", user);
                }
            }["Chat.useEffect"]);
            socket.on("receive_message", {
                "Chat.useEffect": async (payload)=>{
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
                }
            }["Chat.useEffect"]);
            return ({
                "Chat.useEffect": ()=>{
                    socket.disconnect();
                }
            })["Chat.useEffect"];
        }
    }["Chat.useEffect"], []);
    // ----------------------------------------------------
    // DECRYPT HISTORY + LIVE MESSAGES
    // ----------------------------------------------------
    async function decryptMsg(m, mySK) {
        try {
            if (!m.kemCiphertext || !m.aesIv || !m.ciphertext) return null;
            if (!mySK) return null;
            const ss = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqc$2e$js__$5b$client$5d$__$28$ecmascript$29$__["kemDecapsulate"])(m.kemCiphertext, mySK);
            const aesKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqcMock$2e$js__$5b$client$5d$__$28$ecmascript$29$__["deriveAESKey"])(ss);
            const plaintext = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqcMock$2e$js__$5b$client$5d$__$28$ecmascript$29$__["aesDecrypt"])(aesKey, m.aesIv, m.ciphertext);
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
        const { kemCiphertext, sharedSecret } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqc$2e$js__$5b$client$5d$__$28$ecmascript$29$__["kemEncapsulate"])(receiverPk);
        const aesKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqcMock$2e$js__$5b$client$5d$__$28$ecmascript$29$__["deriveAESKey"])(sharedSecret);
        const enc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqcMock$2e$js__$5b$client$5d$__$28$ecmascript$29$__["aesEncrypt"])(aesKey, text);
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            maxWidth: 700,
            margin: "auto",
            padding: 20
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    justifyContent: "space-between"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: [
                            "Welcome ",
                            username
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/chat.js",
                        lineNumber: 182,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: loadHistory,
                children: "Load Chat"
            }, void 0, false, {
                fileName: "[project]/pages/chat.js",
                lineNumber: 209,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 20,
                    height: 300,
                    overflowY: "scroll",
                    border: "1px solid black",
                    padding: 10
                },
                children: messages.filter((m)=>m && m.sender && m.text).map((msg, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: 10
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 15
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
_s(Chat, "KV8wxr+9Gmt+0onb2HGt4Lmzkv4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = Chat;
var _c;
__turbopack_context__.k.register(_c, "Chat");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/chat.js [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/chat";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/pages/chat.js [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/pages/chat\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/chat.js [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__685a8203._.js.map