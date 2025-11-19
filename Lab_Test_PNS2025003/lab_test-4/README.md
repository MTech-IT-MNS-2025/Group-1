# Diffie-Hellman Key Exchange

## Platform Used
Ubuntu

## Software/Tools Used
- NodeJS
- Express.js
- WebAssembly (WASM)
- JavaScript
- HTML/CSS

## Quick Start (For Users)

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

USE gitclone or download the zip of the repository.

##PROJECT STRUCTURE
```
lab_test-4/
├── myProg.c               # C source code for modular exponentiation
├── server.js              # Node.js/Express server
├── package.json           # Project configuration
├── public/
│   ├── index.html         # Frontend interface
│   └── myProg.wasm        # Pre-compiled WebAssembly module
└── README.md              # This file
```

STEPS TO PROCEED
# Step 1: Clone the Repository
```
git clone https://github.com/MTech-IT-MNS-2025/Group-1
cd lab_test-4
```
# Step 2: Install Emscripten (if not already installed)
```
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
cd ..
```
# Step 3: Build WebAssembly Module
```
npm run build-wasm
```

# Step 4: Install Dependencies
```
npm install
```

# Step 5: Start the Server
```
npm start
```

# Step 6: Open Browser
```
# Navigate to: http://localhost:3000
```

