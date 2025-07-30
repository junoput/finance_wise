#!/bin/bash

# FinWise Database Security Setup Script
# This script helps migrate from insecure to secure database storage

set -e

echo "🔐 FinWise Database Security Setup"
echo "=================================="
echo

# Check if we're in the right directory
if [ ! -f "Cargo.toml" ] || [ ! -d "src" ]; then
    echo "❌ Error: This script must be run from the FinWise project root directory"
    exit 1
fi

# Build the project first
echo "📦 Building FinWise..."
cargo build --release

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix compilation errors first."
    exit 1
fi

echo "✅ Build successful!"
echo

# Run the setup command
echo "🚀 Running secure database setup..."
./target/release/finance_wise setup-db

echo
echo "🎉 Setup complete!"
echo
echo "Next steps:"
echo "1. The old 'db_keyfile' (if it existed) has been securely migrated"
echo "2. Your database credentials are now stored in: ~/FinWise/.finwise_db_credentials"
echo "3. This location is automatically excluded from git commits"
echo "4. File permissions are set to be readable only by your user account"
echo
echo "You can now safely run other FinWise commands:"
echo "  cargo run -- server          # Start the web server"
echo "  cargo run -- report          # Generate reports"
echo "  cargo run -- import -f FILE  # Import data"
echo
