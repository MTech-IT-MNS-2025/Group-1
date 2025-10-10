#include <iostream>
#include <oqs/oqs.h>

using namespace std;

int main() {
    // KEM algorithms
    cout << "----- KEM Algorithms -----" << endl;
    cout << "| Algorithm                                | PK Length (bytes) | SK Length (bytes) | Ciphertext Length (bytes)|" << endl;
    cout << "|------------------------------------------|-------------------|-------------------|--------------------------|" << endl;
    for (int i = 0; i < OQS_KEM_alg_count(); i++) {
        const char* kem_name = OQS_KEM_alg_identifier(i);
        OQS_KEM* kem = OQS_KEM_new(kem_name);
        if (kem) {
            printf("| %-40s | %-17zu | %-17zu | %-24zu |\n", 
                   kem_name, kem->length_public_key, kem->length_secret_key, kem->length_ciphertext);
            OQS_KEM_free(kem);
        }
    }

    // Signature algorithms
    cout << "\n----- Signature Algorithms -----" << endl;
    cout << "| Algorithm                                | PK Length (bytes) | SK Length (bytes) | Signature Length (bytes) |" << endl;
    cout << "|------------------------------------------|-------------------|-------------------|--------------------------|" << endl;
    for (int i = 0; i < OQS_SIG_alg_count(); i++) {
        const char* sig_name = OQS_SIG_alg_identifier(i);
        OQS_SIG* sig = OQS_SIG_new(sig_name);
        if (sig) {
            printf("| %-40s | %-17zu | %-17zu | %-24zu |\n", 
                   sig_name, sig->length_public_key, sig->length_secret_key, sig->length_signature);
            OQS_SIG_free(sig);
        }
    }

    return 0;
}

