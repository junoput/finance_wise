#!/bin/bash

# filepath: brew services list/finance_wise/setup_database.sh

# Load credentials from the key file
KEYFILE="./db_keyfile"
if [ ! -f "$KEYFILE" ]; then
  echo "Error: Key file '$KEYFILE' not found."
  exit 1
fi

USERNAME=$(grep "username=" "$KEYFILE" | cut -d '=' -f 2)
PASSWORD=$(grep "password=" "$KEYFILE" | cut -d '=' -f 2)
DATABASE="finance_wise"

# Check if psql is installed
if ! command -v psql &> /dev/null; then
  echo "Error: psql is not installed. Please install PostgreSQL."
  exit 1
fi

# Create the PostgreSQL role (user) if it doesn't exist
echo "Creating PostgreSQL role '$USERNAME'..."
psql -U postgres -c "DO \$\$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$USERNAME') THEN
        CREATE ROLE $USERNAME WITH LOGIN PASSWORD '$PASSWORD';
        ALTER ROLE $USERNAME CREATEDB;
    END IF;
END \$\$;"

# Create the database if it doesn't exist
echo "Creating database '$DATABASE'..."
psql -U postgres -c "DO \$\$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DATABASE') THEN
        CREATE DATABASE $DATABASE;
        GRANT ALL PRIVILEGES ON DATABASE $DATABASE TO $USERNAME;
    END IF;
END \$\$;"

# Run Diesel migrations
echo "Running Diesel migrations..."
if ! command -v diesel &> /dev/null; then
  echo "Error: Diesel CLI is not installed. Please install it with:"
  echo "cargo install diesel_cli --no-default-features --features postgres"
  exit 1
fi

diesel migration run

echo "Database setup complete!"
