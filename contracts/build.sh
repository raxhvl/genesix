#!/bin/bash

# Make the script exit on error
set -e

# Create the destination directory if it doesn't exist
mkdir -p src/lib/abi

forge build

# Copy the ABI file
cp contracts/out/Genesix.sol/Genesix.json src/lib/abi/Genesix.json

echo "✨ ABI copied successfully"