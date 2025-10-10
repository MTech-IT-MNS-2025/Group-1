#define LIBOQS_CPP_VERSION "0.14.0"
#include <liboqs-cpp/oqs_cpp.hpp>
#include <bits/stdc++.h>

using namespace std;
using namespace oqs;

int main() {
	Timer<chrono::microseconds> t;

	bytes alice_public_key, alice_secret_key, ciphertext, shared_secret_alice, shared_secret_bob;

	// Set the KEM algorithm to be used
	string kem_name = "ML-KEM-512";

	// Alice and Bob are instantiated as KeyEncapsulation objects
	KeyEncapsulation alice{kem_name}, bob{kem_name};

	// Get KEM algorithm details
        cout << "KEM details:\n" << alice.get_details();

	// Alice generates the key pair (public & secret keys)
	t.tic();
	alice_public_key = alice.generate_keypair();
	t.toc();
	cout << "\n\nIt took " << t << " microseconds to generate Alice's key pair";
	cout << "\n\nAlice's public key:\n" << hex_chop(alice_public_key);
	alice_secret_key = alice.export_secret_key();
	cout << "\n\nAlice's secret key:\n" << hex_chop(alice_secret_key);

	// Bob receives Alice's public key and generates the encapsulated secret
	t.tic();
	tie(ciphertext, shared_secret_bob) = bob.encap_secret(alice_public_key);
	t.toc();
	cout << "\n\nIt took " << t << " microseconds for Bob to encapsulate the secret";

	// Alice decapsulates the secret
	t.tic();
	shared_secret_alice = alice.decap_secret(ciphertext);
	t.toc();
	cout << "\n\nIt took " << t << " microseconds for Alice to decapsulate the secret";

	// Display the shared secrets
	cout << "\n\nAlice's shared secret:\n" << hex_chop(shared_secret_alice);
	cout << "\n\nBob's shared secret:\n" << hex_chop(shared_secret_bob);

	// Check if the signatures match
	int is_valid = (shared_secret_alice == shared_secret_bob);
	cout << "\n\nDo Alice's and Bob's shared secrets coincide? " << (is_valid ? "Yes" : "No") << '\n';

	return 0;
}

