#!/bin/bash

# Sprite Sheet Template Generator Development Server

set -e

echo "==================================="
echo "Sprite Sheet Template Generator"
echo "Development Server"
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

# Start development server
echo ""
echo "Starting development server..."
npm run dev
