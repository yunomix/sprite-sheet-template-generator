#!/bin/bash

# Sprite Sheet Template Generator Build Script

set -e

echo "==================================="
echo "Sprite Sheet Template Generator"
echo "Build Script"
echo "==================================="

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed."
    echo "Please install Node.js and npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo ""
    echo "Installing dependencies..."
    npm install
fi

# Run TypeScript type check
echo ""
echo "Running TypeScript type check..."
npx tsc --noEmit

# Build the project
echo ""
echo "Building project..."
npm run build

echo ""
echo "==================================="
echo "Build completed successfully!"
echo "Output directory: dist/"
echo "==================================="
