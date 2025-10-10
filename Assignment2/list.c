#include <stdio.h>
#include <oqs/oqs.h>

int main() {
    printf("Listing all available KEM algorithms:\n");
    for (size_t i = 0; i < OQS_KEM_alg_count(); i++) {
        const char *alg_name = OQS_KEM_alg_identifier(i);
        printf("\nKEM Algorithm: %s\n", alg_name);

        OQS_KEM *kem = OQS_KEM_new(alg_name);
        if (kem != NULL) {
            printf("  Public key length: %zu bytes\n", kem->length_public_key);
            printf("  Secret key length: %zu bytes\n", kem->length_secret_key);
            printf("  Ciphertext length: %zu bytes\n", kem->length_ciphertext);
            printf("  Shared secret length: %zu bytes\n", kem->length_shared_secret);
            OQS_KEM_free(kem);
        } else {
            printf("  [Unavailable / Unsupported]\n");
        }
    }

    printf("\nListing all available Signature (SIG) algorithms:\n");
    for (size_t i = 0; i < OQS_SIG_alg_count(); i++) {
        const char *alg_name = OQS_SIG_alg_identifier(i);
        printf("\nSIG Algorithm: %s\n", alg_name);

        OQS_SIG *sig = OQS_SIG_new(alg_name);
        if (sig != NULL) {
            printf("  Public key length: %zu bytes\n", sig->length_public_key);
            printf("  Secret key length: %zu bytes\n", sig->length_secret_key);
            printf("  Signature length: %zu bytes\n", sig->length_signature);
            OQS_SIG_free(sig);
        } else {
            printf("  [Unavailable / Unsupported]\n");
        }
    }

    return 0;
}