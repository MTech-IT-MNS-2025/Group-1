import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    // --------------------------
    // 1. Parse JSON body from client
    // --------------------------
    const { g, p, x } = await req.json(); // g, p, x are strings

    const gVal = BigInt(g);
    const pVal = BigInt(p);
    const xVal = BigInt(x);

    // --------------------------
    // 2. Server secret b (JS)
    // --------------------------
    const b = BigInt(Math.floor(Math.random() * Number(pVal - 1n)) + 1);

    // --------------------------
    // 3. Setup Node-compatible Emscripten Module
    // --------------------------
    global.Module = {
      locateFile: (file) => path.join(process.cwd(), "public", file),
      onRuntimeInitialized() {
        // nothing needed here
      },
    };

    // --------------------------
    // 4. Load myProg.js (Emscripten-generated JS glue code)
    // --------------------------
    const myProgPath = path.join(process.cwd(), "public", "myProg.js");
    const code = fs.readFileSync(myProgPath, "utf-8");
    eval(code); // initializes Module and loads myProg.wasm

    // --------------------------
    // 5. Wait for Module to be ready
    // --------------------------
    await new Promise((resolve) => {
      if (Module.calledRun) resolve();
      else Module.onRuntimeInitialized = resolve;
    });

    // --------------------------
    // 6. Wrap WASM modexp function
    // --------------------------
    const modexp = Module.cwrap("modexp", "bigint", ["bigint", "bigint", "bigint"]);

    // --------------------------
    // 7. Compute y = g^b mod p (WASM)
    // --------------------------
    const y = modexp(gVal, b, pVal);

    // --------------------------
    // 8. Compute K = x^b mod p (WASM)
    // --------------------------
    const K = modexp(xVal, b, pVal);

    // --------------------------
    // 9. Send server output back to client
    // --------------------------
    return new Response(JSON.stringify({ y: y.toString(), K: K.toString() }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

