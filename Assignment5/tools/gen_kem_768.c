// gen_kem_768.c
// Generates an ML-KEM-768 keypair using liboqs and writes raw key files.
//
// Compile:
// gcc gen_kem_768.c -o gen_kem_768 -I /home/suraj/Desktop/liboqs/build/include \
//   -L /home/suraj/Desktop/liboqs/build/lib -loqs
//
// Run:
// ./gen_kem_768 alice
//
// Output (raw): alice_pk.raw, alice_sk.raw
// Convert to base64 with: base64 alice_pk.raw > alice_pk.b64

#include <oqs/oqs.h>
#include <stdio.h>
#include <stdlib.h>

static void write_file(const char *fname, const uint8_t *data, size_t len) {
    FILE *f = fopen(fname, "wb");
    if (!f) { perror("fopen"); exit(1); }
    if (fwrite(data, 1, len, f) != len) { perror("fwrite"); exit(1); }
    fclose(f);
}

int main(int argc, char **argv) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <username>\n", argv[0]);
        return 1;
    }
    const char *user = argv[1];

    if (!OQS_KEM_alg_is_enabled(OQS_KEM_alg_ml_kem_768)) {
        fprintf(stderr, "ML-KEM-768 not enabled in this liboqs build\n");
        return 2;
    }

    OQS_KEM *kem = OQS_KEM_new(OQS_KEM_alg_ml_kem_768);
    if (!kem) {
        fprintf(stderr, "OQS_KEM_new failed\n");
        return 3;
    }

    uint8_t *pk = malloc(kem->length_public_key);
    uint8_t *sk = malloc(kem->length_secret_key);
    if (!pk || !sk) { fprintf(stderr, "malloc failed\n"); return 4; }

    if (OQS_KEM_keypair(kem, pk, sk) != OQS_SUCCESS) {
        fprintf(stderr, "keypair generation failed\n");
        return 5;
    }

    char pk_raw[256], sk_raw[256];
    snprintf(pk_raw, sizeof(pk_raw), "%s_pk.raw", user);
    snprintf(sk_raw, sizeof(sk_raw), "%s_sk.raw", user);

    write_file(pk_raw, pk, kem->length_public_key);
    write_file(sk_raw, sk, kem->length_secret_key);

    printf("Wrote: %s (public, ~%zu bytes) and %s (secret, ~%zu bytes)\n",
           pk_raw, kem->length_public_key, sk_raw, kem->length_secret_key);

    printf("Run:\n  base64 %s > %s_pk.b64\n  base64 %s > %s_sk.b64\n",
           pk_raw, user, sk_raw, user);

    OQS_KEM_free(kem);
    free(pk); free(sk);
    return 0;
}

