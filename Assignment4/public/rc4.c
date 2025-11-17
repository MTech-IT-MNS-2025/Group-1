// rc4.c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <emscripten.h>

/*
 * rc4_core()
 * ----------
 * Implements the RC4 stream cipher:
 * - key scheduling algorithm (KSA)
 * - pseudo-random generation algorithm (PRGA)
 *
 * Parameters:
 *   key     – pointer to key bytes
 *   keylen  – length of key
 *   input   – data to encrypt or decrypt
 *   len     – length of data
 *   output  – buffer to write output bytes
 *
 * Note: RC4 encryption = decryption (XOR with keystream)
 */
static void rc4_core(const unsigned char *key, int keylen,
                     const unsigned char *input, int len,
                     unsigned char *output)
{
    unsigned char S[256];   // State array
    int i, j = 0, k, t;

    // --- Key Scheduling Algorithm (KSA) ---
    for (i = 0; i < 256; i++) S[i] = i;   // Initialize S

    for (i = 0; i < 256; i++) {
        j = (j + S[i] + key[i % keylen]) & 255;  // Key-dependent shuffle

        // Swap S[i] and S[j]
        unsigned char tmp = S[i];
        S[i] = S[j];
        S[j] = tmp;
    }

    // --- Pseudo-Random Generation Algorithm (PRGA) ---
    i = j = 0;

    for (k = 0; k < len; k++) {
        i = (i + 1) & 255;
        j = (j + S[i]) & 255;

        // Swap S[i] and S[j]
        unsigned char tmp = S[i];
        S[i] = S[j];
        S[j] = tmp;

        // Generate keystream byte
        t = (S[i] + S[j]) & 255;

        // XOR input with keystream
        output[k] = input[k] ^ S[t];
    }
}

/*
 * to_hex()
 * --------
 * Converts raw bytes to UPPERCASE hexadecimal string.
 * Caller must free() the returned buffer.
 */
static char *to_hex(const unsigned char *data, int len)
{
    char *out = malloc(len * 2 + 1);
    for (int i = 0; i < len; i++)
        sprintf(out + i*2, "%02X", data[i]);  // Two hex chars per byte

    out[len * 2] = 0;  // Null terminator
    return out;
}

/*
 * rc4_encrypt()
 * -------------
 * Encrypts plaintext using RC4 and returns uppercase hex string.
 * Returned string must be freed by JavaScript using emscripten functions.
 */
EMSCRIPTEN_KEEPALIVE
char *rc4_encrypt(const char *plaintext, const char *key)
{
    int len = strlen(plaintext);
    int klen = strlen(key);

    unsigned char *bin = malloc(len);

    // RC4 encryption (same as decryption)
    rc4_core((unsigned char*)key, klen,
             (unsigned char*)plaintext, len,
             bin);

    // Convert binary ciphertext to HEX
    char *hex = to_hex(bin, len);

    free(bin);
    return hex;
}

/*
 * hexval()
 * --------
 * Converts a hex character ('0'–'9','A'–'F','a'–'f') into its numeric value.
 */
static unsigned char hexval(char c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return 10 + (c - 'a');
    if (c >= 'A' && c <= 'F') return 10 + (c - 'A');
    return 0;
}

/*
 * rc4_decrypt()
 * -------------
 * Takes HEX-encoded ciphertext and key, converts HEX → bytes,
 * performs RC4 decryption, and returns plaintext string.
 * Caller must free() the returned buffer on JS side.
 */
EMSCRIPTEN_KEEPALIVE
char *rc4_decrypt(const char *cipher_hex, const char *key)
{
    int hex_len = strlen(cipher_hex);
    int len = hex_len / 2;

    // Convert HEX string to raw bytes
    unsigned char *cipher = malloc(len);

    for (int i = 0; i < len; i++) {
        cipher[i] =
            (hexval(cipher_hex[i*2]) << 4) |
             hexval(cipher_hex[i*2+1]);
    }

    // Buffer for plaintext output (add null terminator)
    unsigned char *plain = malloc(len + 1);

    rc4_core((unsigned char*)key, strlen(key),
             cipher, len,
             plain);

    plain[len] = 0;  // Null terminate plaintext string

    free(cipher);
    return (char*)plain;
}

