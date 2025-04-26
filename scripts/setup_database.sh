#!/bin/bash

# Source utilities from sh-utils
source ./libs/sh-utils/src/feedback.sh

# Load credentials from the key file if it exists
KEYFILE="./db_keyfile"
if [ -f "$KEYFILE" ]; then
  info "Key file found. Using credentials from '$KEYFILE'."
  USERNAME=$(grep "username=" "$KEYFILE" | cut -d '=' -f 2)
  PASSWORD=$(grep "password=" "$KEYFILE" | cut -d '=' -f 2)
else
  warning "Key file not found. Falling back to 'admin' user."
  USERNAME="admin"
  PASSWORD=""
fi

DATABASE="finance_wise"

# Check if psql is installed
if ! command -v psql &> /dev/null; then
  error "psql is not installed. Please install PostgreSQL."
  exit 1
fi

# Create the database if it doesn't exist
info "Creating database '$DATABASE'..."
psql -U "$USERNAME" -c "DO \$\$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DATABASE') THEN
        CREATE DATABASE $DATABASE;
    END IF;
END \$\$;" && success "Database '$DATABASE' created successfully." || error "Failed to create database '$DATABASE'."

# Grant privileges to the user if using db_keyfile credentials
if [ -f "$KEYFILE" ]; then
  info "Granting privileges on database '$DATABASE' to '$USERNAME'..."
  psql -U "$USERNAME" -c "GRANT ALL PRIVILEGES ON DATABASE $DATABASE TO $USERNAME;" && success "Privileges granted to '$USERNAME'." || error "Failed to grant privileges to '$USERNAME'."
fi

# Run Diesel migrations
info "Running Diesel migrations..."
if ! command -v diesel &> /dev/null; then
  error "Diesel CLI is not installed. Please install it with:"
  message "cargo install diesel_cli --no-default-features --features postgres"
  exit 1
fi

diesel migration run && success "Diesel migrations applied successfully." || error "Failed to apply Diesel migrations."

success "Database setup complete!"
