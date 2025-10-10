# Exploring PQC with liboqs

---

## Overview

liboqs provides:

- a collection of open source implementations of quantum-safe key encapsulation mechanisms (KEMs) and digital signature algorithms; the full list can be found [here](#supported-algorithms)
- a common API for these algorithms
- a test harness and benchmarking routines

liboqs is part of the **Open Quantum Safe (OQS)** project, which aims to develop and integrate into applications quantum-safe cryptography to facilitate deployment and testing in real world contexts. In particular, OQS provides prototype integrations of liboqs into protocols like TLS, X.509, and S/MIME, through [OpenSSL 3 Provider](https://github.com/open-quantum-safe/oqs-provider) and provides a variety of other [post-quantum-enabled demos](https://github.com/open-quantum-safe/oqs-demos).

---

## Installation

### Install dependencies:

On Ubuntu:

```shell
sudo apt install git cmake gcc g++
```

On Fedora:

```shell
sudo dnf install git cmake gcc-c++
```

### Configure, build and install liboqs

On Ububtu and Fedora:

```shell
git clone --depth=1 https://github.com/open-quantum-safe/liboqs
cmake -S liboqs -B liboqs/build -DBUILD_SHARED_LIBS=ON
cmake --build liboqs/build --parallel 8
sudo cmake --build liboqs/build --target install
```

Change `--parallel 8` to match the number of available cores on your system.

#### Set library path

On Ubuntu:
```shell
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib
```

On Fedora:
```shell
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib64
```

#### Alternatively, to make it persistent

On Ubuntu:
```shell
echo "/usr/local/lib" | sudo tee /etc/ld.so.conf.d/liboqs.conf
sudo ldconfig
```

On Fedora:
```shell
echo "/usr/local/lib64" | sudo tee /etc/ld.so.conf.d/liboqs.conf
sudo ldconfig
```

### Configure and install the wrapper

```shell
git clone --depth=1 https://github.com/open-quantum-safe/liboqs-cpp
cmake -S liboqs-cpp -B liboqs-cpp/build
cmake --build liboqs-cpp/build --target install
```

## Using liboqs-cpp in standalone applications

liboqs-cpp is a header-only wrapper. To use liboqs-cpp, you only need
to use

```cpp
#define LIBOQS_CPP_VERSION "0.14.0"
#include <liboqs-cpp/oqs_cpp.hpp>
```

Change `LIBOQS_CPP_VERSION` with the version installed on your system.

To avoid namespace pollution, liboqs-cpp includes all of its code inside the
namespace `oqs`. All the liboqs C API is located in the namespace `oqs::C`,
hence to use directly a C API function you must qualify the call
with `oqs::C::liboqs_C_function(...)`.

liboqs-cpp defines four main classes: `oqs::KeyEncapsulation`
and `oqs::Signature`, providing post-quantum key encapsulation and signture
mechanisms, respectively, and
`oqs::KEMs` and `oqs::Sigs`, containing only static member functions that
provide information related to the available key encapsulation mechanisms or
signature mechanism, respectively.

`oqs::KeyEncapsulation` and/or `oqs::Signature` must be instantiated with a
string identifying one of mechanisms supported by liboqs; these can be
enumerated using the `oqs::KEMs::get_enabled_KEM_mechanisms()`
and `oqs::Sigs::get_enabled_sig_mechanisms()` member functions.

Support for alternative RNGs is provided by the `include/rand/rand.hpp` header
file, which exports its functions in `namespace oqs::rand`. This header file
must be explicitly included in order to activate the support for alternative
RNGs.

The wrapper also defines a high resolution timing class, `oqs::Timer<>`.

The examples in
the [`examples`](https://github.com/open-quantum-safe/liboqs-cpp/tree/main/examples)
directory are self-explanatory stand-alone applications and provide more details
about the wrapper's API and its usage.

## Compile and execute a program

#### 2. Key exchange using a KEM algorithm
```shell
g++ kem.cpp -o kem -liboqs
./kem
```

#### 3. Digital signature using a SIG algorithm
```shell
g++ sig.cpp -o sig -liboqs
./sig
```
