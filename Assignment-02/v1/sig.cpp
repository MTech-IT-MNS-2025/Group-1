#define LIBOQS_CPP_VERSION "0.14.0"
#include <liboqs-cpp/oqs_cpp.hpp>
#include <bits/stdc++.h>

using namespace std;
using namespace oqs;

int main() {
	Timer<chrono::microseconds> t;

	bytes alice_public_key, alice_secret_key, message, signature;

	// Set the SIG algorithm to be used
	string sig_name = "ML-DSA-44";

	// Alice(signer) and Bob(verifier) are instantiated as Signature objects
	Signature alice{sig_name}, bob{sig_name};

	// Get SIG algorithm details
	cout << "SIG details:\n" << alice.get_details();

	// Alice generates the key pair (public & secret keys)
	t.tic();
	alice_public_key = alice.generate_keypair();
	t.toc();
	cout << "\n\nIt took " << t << " microseconds to generate Alice's key pair";
	cout << "\n\nAlice's public key:\n" << hex_chop(alice_public_key);
	alice_secret_key = alice.export_secret_key();
	cout << "\n\nAlice's secret key:\n" << hex_chop(alice_secret_key);

	message = "Post-Quantum Cryptography is the future"_bytes;

	// Alice signs the message
	t.tic();
	signature = alice.sign(message);
	t.toc();
	cout << "\n\nIt took " << t << " microseconds for Alice to sign the message";
	cout << "\n\nSignature:\n" << hex_chop(signature) << endl;

	// Bob verifies the signature
	int is_valid = bob.verify(message, signature, alice_public_key);
	cout << "\nIs the signature valid according to Bob? " << (is_valid ? "Yes" : "No") << endl;

	return 0;
}

