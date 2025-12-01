#include <oqs/oqs.h>
#include <string.h>
#include <stdlib.h>
#include <emscripten.h>


// Allocate memory inside WASM
EMSCRIPTEN_KEEPALIVE
void* wasm_malloc(size_t size) {
    return malloc(size);
}
EMSCRIPTEN_KEEPALIVE
void wasm_free(void* ptr) {
    free(ptr);
}

EMSCRIPTEN_KEEPALIVE// ML-KEM-768 keypair
int pqc_keypair(uint8_t* public_key, uint8_t* secret_key) {
    return OQS_KEM_ml_kem_768_keypair(public_key, secret_key);
}

EMSCRIPTEN_KEEPALIVE// Encapsulation
int pqc_encaps(uint8_t* ciphertext, uint8_t* shared_secret, const uint8_t* public_key) {
    return OQS_KEM_ml_kem_768_encaps(ciphertext, shared_secret, public_key);
}

EMSCRIPTEN_KEEPALIVE// Decapsulation
int pqc_decaps(uint8_t* shared_secret, const uint8_t* ciphertext, const uint8_t* secret_key) {
    return OQS_KEM_ml_kem_768_decaps(shared_secret, ciphertext, secret_key);
}

