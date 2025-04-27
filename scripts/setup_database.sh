#!/bin/bash

# Source utilities from sh-utils
source ./libs/sh-utils/src/feedback.sh

DEFAULT_USER=$(whoami)

# Load credentials from the key file if it exists
KEYFILE="./db_keyfile"
if [ -f "$KEYFILE" ]; then
  info "Key file found. Using credentials from '$KEYFILE'."
  USERNAME=$(grep "username=" "$KEYFILE" | cut -d '=' -f 2)
  PASSWORD=$(grep "password=" "$KEYFILE" | cut -d '=' -f 2)
else
  warning "Key file not found. Falling back to '$DEFAULT_USER' user."
  USERNAME=$DEFAULT_USER
  PASSWORD=""
fi

DATABASE="finance_wise"

# Check if psql is installed
if ! command -v psql &> /dev/null; then
  error "psql is not installed. Please install PostgreSQL."
  exit 1
fi

# Create the role (user) if it doesn't exist
info "Ensuring role '$USERNAME' exists..."
psql -U $DEFAULT_USER -d postgres -c "DO \$\$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$USERNAME') THEN
        CREATE ROLE $USERNAME WITH LOGIN PASSWORD '$PASSWORD';
    END IF;
END \$\$;" && success "Role '$USERNAME' ensured." || error "Failed to ensure role '$USERNAME'."

# Grant CREATEDB privilege to the role
info "Granting CREATEDB privilege to role '$USERNAME'..."
psql -U $DEFAULT_USER -d postgres -c "ALTER ROLE $USERNAME CREATEDB;" && success "CREATEDB privilege granted to '$USERNAME'." || error "Failed to grant CREATEDB privilege to '$USERNAME'."

# Create the database if it doesn't exist
info "Creating database '$DATABASE' with owner '$USERNAME'..."
psql -U "$USERNAME" -d postgres -c "CREATE DATABASE $DATABASE;" && success "Database '$DATABASE' created successfully." || warning "Database '$DATABASE' may already exist."

# Run Diesel migrations
info "Running Diesel migrations..."
if ! command -v diesel &> /dev/null; then
  error "Diesel CLI is not installed. Please install it with:"
  message "cargo install diesel_cli --no-default-features --features postgres"
  exit 1
fi

diesel migration run && success "Diesel migrations applied successfully." || error "Failed to apply Diesel migrations."

success "Done!"
