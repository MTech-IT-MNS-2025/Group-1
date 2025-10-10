# Exploring PQC with liboqs

## Compile and execute the programs

#### 1. List all supported KEM and SIG algorithms
```shell
g++ list.cpp -o list -liboqs
./list
```

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
