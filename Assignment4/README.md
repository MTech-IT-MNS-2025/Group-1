# Compile C code to WebAssembly and execute in browser using JavaScript

---

## Overview



---

## Installation

### Install git

```shell
# On Ubuntu
sudo apt install git

# On Fedora
sudo dnf install git
```

### Install emsdk

```shell
# Get the emsdk repo
git clone https://github.com/emscripten-core/emsdk.git

cd emsdk

# Download and install the latest SDK tools.
./emsdk install latest

# Fetch the latest registry of available tools.
./emsdk update

# Make the "latest" SDK "active" for the current user. (writes .emscripten file)
./emsdk activate latest

# Activate PATH and other environment variables in the current terminal
source ./emsdk_env.sh
```

If you want to avoid executing source ./emsdk_env.sh every time you open a new terminal, you can follow the instructions given by the emsdk activate command above to add this command to your startup scripts.

Emscripten, like gcc and clang, generates unoptimized code by default. Code is optimized by specifying optimization flags when running emcc. The levels include: `-O0` (no optimization), `-O1`, `-O2`, `-Os`, `-Oz`, `-Og`, and `-O3`.

### Running Emscripten

```shell
emcc rc4.c -o rc4.js
```

### Install Node.js and npm

```shell
# On Ubuntu
sudo apt install nodejs npm

# On Fedora
sudo dnf install nodejs npm

# Alternatively node.js can be installed using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 22
```

## Architecture


## Technologies Used


## Learning Outcomes
1. How to compile C code to WebAssembly using Emscripten.
2. How to expose C functions to JavaScript.
3. How to call native C (via WASM) from a Next.js frontend.
4. How to handle text input/output between JavaScript and WASM memory.

## Contributions

Contribution details of each member is listed in `CONTRIBUTIONS.txt`
