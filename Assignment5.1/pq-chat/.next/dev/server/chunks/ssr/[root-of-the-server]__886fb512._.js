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
"[project]/public/pqc.js [ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

var createPqcModule = (()=>{
    var _scriptName = globalThis.document?.currentScript?.src;
    return async function(moduleArg = {}) {
        var moduleRtn;
        var Module = moduleArg;
        var ENVIRONMENT_IS_WEB = true;
        var ENVIRONMENT_IS_WORKER = false;
        var arguments_ = [];
        var thisProgram = "./this.program";
        var quit_ = (status, toThrow)=>{
            throw toThrow;
        };
        var scriptDirectory = "";
        function locateFile(path) {
            if (Module["locateFile"]) {
                return Module["locateFile"](path, scriptDirectory);
            }
            return scriptDirectory + path;
        }
        var readAsync, readBinary;
        if ("TURBOPACK compile-time truthy", 1) {
            try {
                scriptDirectory = new URL(".", _scriptName).href;
            } catch  {}
            {
                readAsync = async (url)=>{
                    var response = await fetch(url, {
                        credentials: "same-origin"
                    });
                    if (response.ok) {
                        return response.arrayBuffer();
                    }
                    throw new Error(response.status + " : " + response.url);
                };
            }
        } else {}
        var out = console.log.bind(console);
        var err = console.error.bind(console);
        var wasmBinary;
        var ABORT = false;
        var EXITSTATUS;
        var readyPromiseResolve, readyPromiseReject;
        var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
        var HEAP64, HEAPU64;
        var runtimeInitialized = false;
        function updateMemoryViews() {
            var b = wasmMemory.buffer;
            HEAP8 = new Int8Array(b);
            HEAP16 = new Int16Array(b);
            Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
            HEAPU16 = new Uint16Array(b);
            HEAP32 = new Int32Array(b);
            HEAPU32 = new Uint32Array(b);
            HEAPF32 = new Float32Array(b);
            HEAPF64 = new Float64Array(b);
            HEAP64 = new BigInt64Array(b);
            HEAPU64 = new BigUint64Array(b);
        }
        function preRun() {
            if (Module["preRun"]) {
                if (typeof Module["preRun"] == "function") Module["preRun"] = [
                    Module["preRun"]
                ];
                while(Module["preRun"].length){
                    addOnPreRun(Module["preRun"].shift());
                }
            }
            callRuntimeCallbacks(onPreRuns);
        }
        function initRuntime() {
            runtimeInitialized = true;
            wasmExports["j"]();
        }
        function postRun() {
            if (Module["postRun"]) {
                if (typeof Module["postRun"] == "function") Module["postRun"] = [
                    Module["postRun"]
                ];
                while(Module["postRun"].length){
                    addOnPostRun(Module["postRun"].shift());
                }
            }
            callRuntimeCallbacks(onPostRuns);
        }
        function abort(what) {
            Module["onAbort"]?.(what);
            what = "Aborted(" + what + ")";
            err(what);
            ABORT = true;
            what += ". Build with -sASSERTIONS for more info.";
            var e = new WebAssembly.RuntimeError(what);
            readyPromiseReject?.(e);
            throw e;
        }
        var wasmBinaryFile;
        function findWasmBinary() {
            return locateFile("pqc.wasm");
        }
        function getBinarySync(file) {
            if (file == wasmBinaryFile && wasmBinary) {
                return new Uint8Array(wasmBinary);
            }
            if (readBinary) {
                return readBinary(file);
            }
            throw "both async and sync fetching of the wasm failed";
        }
        async function getWasmBinary(binaryFile) {
            if (!wasmBinary) {
                try {
                    var response = await readAsync(binaryFile);
                    return new Uint8Array(response);
                } catch  {}
            }
            return getBinarySync(binaryFile);
        }
        async function instantiateArrayBuffer(binaryFile, imports) {
            try {
                var binary = await getWasmBinary(binaryFile);
                var instance = await WebAssembly.instantiate(binary, imports);
                return instance;
            } catch (reason) {
                err(`failed to asynchronously prepare wasm: ${reason}`);
                abort(reason);
            }
        }
        async function instantiateAsync(binary, binaryFile, imports) {
            if (!binary) {
                try {
                    var response = fetch(binaryFile, {
                        credentials: "same-origin"
                    });
                    var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
                    return instantiationResult;
                } catch (reason) {
                    err(`wasm streaming compile failed: ${reason}`);
                    err("falling back to ArrayBuffer instantiation");
                }
            }
            return instantiateArrayBuffer(binaryFile, imports);
        }
        function getWasmImports() {
            var imports = {
                a: wasmImports
            };
            return imports;
        }
        async function createWasm() {
            function receiveInstance(instance, module1) {
                wasmExports = instance.exports;
                assignWasmExports(wasmExports);
                updateMemoryViews();
                return wasmExports;
            }
            function receiveInstantiationResult(result) {
                return receiveInstance(result["instance"]);
            }
            var info = getWasmImports();
            if (Module["instantiateWasm"]) {
                return new Promise((resolve, reject)=>{
                    Module["instantiateWasm"](info, (inst, mod)=>{
                        resolve(receiveInstance(inst, mod));
                    });
                });
            }
            wasmBinaryFile ??= findWasmBinary();
            var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
            var exports = receiveInstantiationResult(result);
            return exports;
        }
        class ExitStatus {
            name = "ExitStatus";
            constructor(status){
                this.message = `Program terminated with exit(${status})`;
                this.status = status;
            }
        }
        var callRuntimeCallbacks = (callbacks)=>{
            while(callbacks.length > 0){
                callbacks.shift()(Module);
            }
        };
        var onPostRuns = [];
        var addOnPostRun = (cb)=>onPostRuns.push(cb);
        var onPreRuns = [];
        var addOnPreRun = (cb)=>onPreRuns.push(cb);
        var noExitRuntime = true;
        var __abort_js = ()=>abort("");
        var runtimeKeepaliveCounter = 0;
        var __emscripten_runtime_keepalive_clear = ()=>{
            noExitRuntime = false;
            runtimeKeepaliveCounter = 0;
        };
        var timers = {};
        var handleException = (e)=>{
            if (e instanceof ExitStatus || e == "unwind") {
                return EXITSTATUS;
            }
            quit_(1, e);
        };
        var keepRuntimeAlive = ()=>noExitRuntime || runtimeKeepaliveCounter > 0;
        var _proc_exit = (code)=>{
            EXITSTATUS = code;
            if (!keepRuntimeAlive()) {
                Module["onExit"]?.(code);
                ABORT = true;
            }
            quit_(code, new ExitStatus(code));
        };
        var exitJS = (status, implicit)=>{
            EXITSTATUS = status;
            _proc_exit(status);
        };
        var _exit = exitJS;
        var maybeExit = ()=>{
            if (!keepRuntimeAlive()) {
                try {
                    _exit(EXITSTATUS);
                } catch (e) {
                    handleException(e);
                }
            }
        };
        var callUserCallback = (func)=>{
            if (ABORT) {
                return;
            }
            try {
                func();
                maybeExit();
            } catch (e) {
                handleException(e);
            }
        };
        var _emscripten_get_now = ()=>performance.now();
        var __setitimer_js = (which, timeout_ms)=>{
            if (timers[which]) {
                clearTimeout(timers[which].id);
                delete timers[which];
            }
            if (!timeout_ms) return 0;
            var id = setTimeout(()=>{
                delete timers[which];
                callUserCallback(()=>__emscripten_timeout(which, _emscripten_get_now()));
            }, timeout_ms);
            timers[which] = {
                id,
                timeout_ms
            };
            return 0;
        };
        var getHeapMax = ()=>2147483648;
        var alignMemory = (size, alignment)=>Math.ceil(size / alignment) * alignment;
        var growMemory = (size)=>{
            var oldHeapSize = wasmMemory.buffer.byteLength;
            var pages = (size - oldHeapSize + 65535) / 65536 | 0;
            try {
                wasmMemory.grow(pages);
                updateMemoryViews();
                return 1;
            } catch (e) {}
        };
        var _emscripten_resize_heap = (requestedSize)=>{
            var oldSize = HEAPU8.length;
            requestedSize >>>= 0;
            var maxHeapSize = getHeapMax();
            if (requestedSize > maxHeapSize) {
                return false;
            }
            for(var cutDown = 1; cutDown <= 4; cutDown *= 2){
                var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
                overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
                var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
                var replacement = growMemory(newSize);
                if (replacement) {
                    return true;
                }
            }
            return false;
        };
        var printCharBuffers = [
            null,
            [],
            []
        ];
        var UTF8Decoder = globalThis.TextDecoder && new TextDecoder;
        var findStringEnd = (heapOrArray, idx, maxBytesToRead, ignoreNul)=>{
            var maxIdx = idx + maxBytesToRead;
            if (ignoreNul) return maxIdx;
            while(heapOrArray[idx] && !(idx >= maxIdx))++idx;
            return idx;
        };
        var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead, ignoreNul)=>{
            var endPtr = findStringEnd(heapOrArray, idx, maxBytesToRead, ignoreNul);
            if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
                return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
            }
            var str = "";
            while(idx < endPtr){
                var u0 = heapOrArray[idx++];
                if (!(u0 & 128)) {
                    str += String.fromCharCode(u0);
                    continue;
                }
                var u1 = heapOrArray[idx++] & 63;
                if ((u0 & 224) == 192) {
                    str += String.fromCharCode((u0 & 31) << 6 | u1);
                    continue;
                }
                var u2 = heapOrArray[idx++] & 63;
                if ((u0 & 240) == 224) {
                    u0 = (u0 & 15) << 12 | u1 << 6 | u2;
                } else {
                    u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
                }
                if (u0 < 65536) {
                    str += String.fromCharCode(u0);
                } else {
                    var ch = u0 - 65536;
                    str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
                }
            }
            return str;
        };
        var printChar = (stream, curr)=>{
            var buffer = printCharBuffers[stream];
            if (curr === 0 || curr === 10) {
                (stream === 1 ? out : err)(UTF8ArrayToString(buffer));
                buffer.length = 0;
            } else {
                buffer.push(curr);
            }
        };
        var _fd_write = (fd, iov, iovcnt, pnum)=>{
            var num = 0;
            for(var i = 0; i < iovcnt; i++){
                var ptr = HEAPU32[iov >> 2];
                var len = HEAPU32[iov + 4 >> 2];
                iov += 8;
                for(var j = 0; j < len; j++){
                    printChar(fd, HEAPU8[ptr + j]);
                }
                num += len;
            }
            HEAPU32[pnum >> 2] = num;
            return 0;
        };
        var initRandomFill = ()=>(view)=>crypto.getRandomValues(view);
        var randomFill = (view)=>{
            (randomFill = initRandomFill())(view);
        };
        var _random_get = (buffer, size)=>{
            randomFill(HEAPU8.subarray(buffer, buffer + size));
            return 0;
        };
        {
            if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
            if (Module["print"]) out = Module["print"];
            if (Module["printErr"]) err = Module["printErr"];
            if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
            if (Module["arguments"]) arguments_ = Module["arguments"];
            if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
            if (Module["preInit"]) {
                if (typeof Module["preInit"] == "function") Module["preInit"] = [
                    Module["preInit"]
                ];
                while(Module["preInit"].length > 0){
                    Module["preInit"].shift()();
                }
            }
        }
        var _wasm_malloc, _malloc, _wasm_free, _free, _pqc_keypair, _pqc_encaps, _pqc_decaps, __emscripten_timeout, memory, __indirect_function_table, wasmMemory;
        function assignWasmExports(wasmExports) {
            _wasm_malloc = Module["_wasm_malloc"] = wasmExports["k"];
            _malloc = Module["_malloc"] = wasmExports["l"];
            _wasm_free = Module["_wasm_free"] = wasmExports["m"];
            _free = Module["_free"] = wasmExports["n"];
            _pqc_keypair = Module["_pqc_keypair"] = wasmExports["o"];
            _pqc_encaps = Module["_pqc_encaps"] = wasmExports["p"];
            _pqc_decaps = Module["_pqc_decaps"] = wasmExports["q"];
            __emscripten_timeout = wasmExports["r"];
            memory = wasmMemory = wasmExports["i"];
            __indirect_function_table = wasmExports["__indirect_function_table"];
        }
        var wasmImports = {
            d: __abort_js,
            c: __emscripten_runtime_keepalive_clear,
            e: __setitimer_js,
            f: _emscripten_resize_heap,
            a: _exit,
            g: _fd_write,
            b: _proc_exit,
            h: _random_get
        };
        function run() {
            preRun();
            function doRun() {
                Module["calledRun"] = true;
                if (ABORT) return;
                initRuntime();
                readyPromiseResolve?.(Module);
                Module["onRuntimeInitialized"]?.();
                postRun();
            }
            if (Module["setStatus"]) {
                Module["setStatus"]("Running...");
                setTimeout(()=>{
                    setTimeout(()=>Module["setStatus"](""), 1);
                    doRun();
                }, 1);
            } else {
                doRun();
            }
        }
        var wasmExports;
        wasmExports = await createWasm();
        run();
        if (runtimeInitialized) {
            moduleRtn = Module;
        } else {
            moduleRtn = new Promise((resolve, reject)=>{
                readyPromiseResolve = resolve;
                readyPromiseReject = reject;
            });
        }
        ;
        return moduleRtn;
    };
})();
if ("TURBOPACK compile-time truthy", 1) {
    module.exports = createPqcModule;
    module.exports.default = createPqcModule;
} else //TURBOPACK unreachable
;
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
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$pqc$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/public/pqc.js [ssr] (ecmascript)");
;
let Module = null;
async function initPQC() {
    if (!Module) {
        Module = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$pqc$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"])();
    }
    return Module;
}
// ML-KEM-768 Sizes
const PK_SIZE = 1184;
const SK_SIZE = 2400;
const CT_SIZE = 1088;
const SS_SIZE = 32;
async function kemEncapsulate(publicKeyBase64) {
    const module = await initPQC();
    const publicKey = Uint8Array.from(atob(publicKeyBase64), (c)=>c.charCodeAt(0));
    const kemPtr = module._malloc(CT_SIZE);
    const sharedPtr = module._malloc(SS_SIZE);
    const pubPtr = module._malloc(PK_SIZE);
    module.HEAPU8.set(publicKey, pubPtr);
    module._pqc_encaps(kemPtr, sharedPtr, pubPtr);
    const kemCipher = module.HEAPU8.slice(kemPtr, kemPtr + CT_SIZE);
    const sharedSecret = module.HEAPU8.slice(sharedPtr, sharedPtr + SS_SIZE);
    module._free(kemPtr);
    module._free(sharedPtr);
    module._free(pubPtr);
    return {
        kemCiphertext: kemCipher,
        sharedSecret
    };
}
async function kemDecapsulate(kemCipherBase64, privateKeyBase64) {
    const module = await initPQC();
    const kem = Uint8Array.from(atob(kemCipherBase64), (c)=>c.charCodeAt(0));
    const secretKey = Uint8Array.from(atob(privateKeyBase64), (c)=>c.charCodeAt(0));
    const sharedPtr = module._malloc(SS_SIZE);
    const kemPtr = module._malloc(CT_SIZE);
    module.HEAPU8.set(kem, kemPtr);
    const skPtr = module._malloc(SK_SIZE);
    module.HEAPU8.set(secretKey, skPtr);
    module._pqc_decaps(sharedPtr, kemPtr, skPtr);
    const sharedSecret = module.HEAPU8.slice(sharedPtr, sharedPtr + SS_SIZE);
    module._free(sharedPtr);
    module._free(kemPtr);
    module._free(skPtr);
    return sharedSecret;
}
}),
"[project]/utils/pqcMock.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// utils/pqcMock.js
// ---- Mock KEM (Fake PQC for Step-3 only) ----
// These functions simulate Kyber KEM so encryption logic works.
__turbopack_context__.s([
    "aesDecrypt",
    ()=>aesDecrypt,
    "aesEncrypt",
    ()=>aesEncrypt,
    "deriveAESKey",
    ()=>deriveAESKey,
    "kemDecapsulate",
    ()=>kemDecapsulate,
    "kemEncapsulate",
    ()=>kemEncapsulate
]);
async function kemEncapsulate(publicKey) {
    // REPLACE with real liboqs WASM in Step 4
    const sharedSecret = crypto.getRandomValues(new Uint8Array(32));
    const kemCiphertext = crypto.getRandomValues(new Uint8Array(800)); // kyber512 size-like
    return {
        sharedSecret,
        kemCiphertext
    };
}
async function kemDecapsulate(kemCiphertext, privateKey) {
    // REPLACE with real liboqs decapsulation step in Step 4
    return crypto.getRandomValues(new Uint8Array(32)); // fake shared secret
}
async function deriveAESKey(sharedSecret) {
    const keyMaterial = await crypto.subtle.importKey("raw", sharedSecret, "HKDF", false, [
        "deriveKey"
    ]);
    return crypto.subtle.deriveKey({
        name: "HKDF",
        salt: new Uint8Array(16),
        info: new TextEncoder().encode("pqc-chat-v1")
    }, keyMaterial, {
        name: "AES-GCM",
        length: 256
    }, false, [
        "encrypt",
        "decrypt"
    ]);
}
async function aesEncrypt(aesKey, plaintext) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt({
        name: "AES-GCM",
        iv
    }, aesKey, encoded);
    return {
        iv,
        ciphertext: new Uint8Array(ciphertext)
    };
}
async function aesDecrypt(aesKey, iv, ciphertext) {
    const decrypted = await crypto.subtle.decrypt({
        name: "AES-GCM",
        iv
    }, aesKey, ciphertext);
    return new TextDecoder().decode(decrypted);
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
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqcMock$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/pqcMock.js [ssr] (ecmascript)"); // only AES from mock
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
function Chat() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [username, setUsername] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [recipient, setRecipient] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [text, setText] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const msgRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])([]);
    const privateKeyRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])("");
    // Load user session
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
            const decrypted = await decryptMsg(payload);
            msgRef.current = [
                ...msgRef.current,
                decrypted
            ];
            setMessages(msgRef.current);
        });
        return ()=>{
            socket.disconnect();
        };
    }, []);
    async function decryptMsg(payload) {
        const sharedSecret = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqc$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["kemDecapsulate"])(payload.kemCiphertext, privateKeyRef.current);
        const aesKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqcMock$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["deriveAESKey"])(sharedSecret);
        const iv = Uint8Array.from(atob(payload.aesIv), (c)=>c.charCodeAt(0));
        const cipher = Uint8Array.from(atob(payload.ciphertext), (c)=>c.charCodeAt(0));
        const plain = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqcMock$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["aesDecrypt"])(aesKey, iv, cipher);
        return {
            text: plain,
            sender: payload.sender,
            receiver: payload.receiver,
            timestamp: payload.timestamp
        };
    }
    async function loadHistory() {
        const res = await fetch(`/api/messages?user1=${username}&user2=${recipient}`);
        const data = await res.json();
        const out = [];
        for (let m of data){
            out.push(await decryptMsg(m));
        }
        msgRef.current = out;
        setMessages(out);
    }
    async function sendMessage() {
        if (!recipient || !text) return;
        // Get receiver public key
        const res = await fetch(`/api/users/${recipient}`);
        const data = await res.json();
        const receiverPk = data.pqPublicKey;
        // PQC: Encapsulate
        const { kemCiphertext, sharedSecret } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqc$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["kemEncapsulate"])(receiverPk);
        // Derive AES key
        const aesKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqcMock$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["deriveAESKey"])(sharedSecret);
        // Encrypt
        const { iv, ciphertext } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$pqcMock$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["aesEncrypt"])(aesKey, text);
        const payload = {
            sender: username,
            receiver: recipient,
            kemCiphertext: btoa(String.fromCharCode(...kemCiphertext)),
            aesIv: btoa(String.fromCharCode(...iv)),
            ciphertext: btoa(String.fromCharCode(...ciphertext)),
            timestamp: new Date().toISOString()
        };
        socket.emit("send_message", payload);
        msgRef.current = [
            ...msgRef.current,
            {
                sender: username,
                text,
                timestamp: payload.timestamp
            }
        ];
        setMessages(msgRef.current);
        setText("");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            maxWidth: 700,
            margin: "auto",
            padding: 20
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                children: [
                    "Welcome ",
                    username
                ]
            }, void 0, true, {
                fileName: "[project]/pages/chat.js",
                lineNumber: 137,
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
                lineNumber: 139,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                onClick: loadHistory,
                children: "Load Chat"
            }, void 0, false, {
                fileName: "[project]/pages/chat.js",
                lineNumber: 146,
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
                children: messages.map((msg, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
                                lineNumber: 159,
                                columnNumber: 13
                            }, this),
                            " ",
                            msg.text
                        ]
                    }, i, true, {
                        fileName: "[project]/pages/chat.js",
                        lineNumber: 158,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/pages/chat.js",
                lineNumber: 148,
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
                        lineNumber: 165,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        onClick: sendMessage,
                        children: "Send"
                    }, void 0, false, {
                        fileName: "[project]/pages/chat.js",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/chat.js",
                lineNumber: 164,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/chat.js",
        lineNumber: 136,
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

//# sourceMappingURL=%5Broot-of-the-server%5D__886fb512._.js.map