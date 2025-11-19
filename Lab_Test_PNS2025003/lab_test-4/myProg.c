// myProg.c - Modular exponentiation for WebAssembly
int modExp(int base, int exponent, int modulus) {
    if (modulus == 1) return 0;
    
    long long result = 1;
    long long long_base = base % modulus;
    
    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = (result * long_base) % modulus;
        }
        exponent = exponent >> 1;
        long_base = (long_base * long_base) % modulus;
    }
    
    return (int)result;
}
