#include <stdint.h>
#include <emscripten.h>

// Modular exponentiation: a^b mod n
EMSCRIPTEN_KEEPALIVE
uint64_t modexp(uint64_t base, uint64_t exp, uint64_t mod) {
    uint64_t result = 1;
    base = base % mod;

    while (exp > 0) {
        if (exp & 1)
            result = (result * base) % mod;

        base = (base * base) % mod;
        exp >>= 1;
    }

    return result;
}

