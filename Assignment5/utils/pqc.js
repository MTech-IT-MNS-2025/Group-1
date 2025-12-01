let pqcModulePromise = null;

export async function initPQC() {
  if (pqcModulePromise) return pqcModulePromise;

  // Load pqc.js dynamically (Next.js can't import from /public)
  await loadScript("/pqc.js");

  // createPqcModule is now available globally
  pqcModulePromise = window.createPqcModule({
    locateFile: () => "/pqc.wasm"
  });

  return pqcModulePromise;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

/* ----------- PQC Wrappers ----------- */

export async function kemEncapsulate(pkB64) {
  const m = await initPQC();

  const pk = Uint8Array.from(atob(pkB64), c => c.charCodeAt(0));

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

export async function kemDecapsulate(kemB64, skB64) {
  const m = await initPQC();

  const kem = Uint8Array.from(atob(kemB64), c => c.charCodeAt(0));
  const sk = Uint8Array.from(atob(skB64), c => c.charCodeAt(0));

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

