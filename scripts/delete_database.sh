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

# Confirm deletion
warning "WARNING: This will permanently delete the database '$DATABASE'."
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  info "Database deletion canceled."
  exit 0
fi

# Check if psql is installed
if ! command -v psql &> /dev/null; then
  error "psql is not installed. Please install PostgreSQL."
  exit 1
fi

# Terminate active connections to the database
info "Terminating active connections to the database '$DATABASE'..."
psql -U "$USERNAME" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DATABASE';" && success "Active connections terminated." || error "Failed to terminate active connections."

# Drop the database
info "Dropping database '$DATABASE'..."
psql -U "$USERNAME" -d postgres -c "DROP DATABASE $DATABASE;" && success "Database '$DATABASE' has been deleted." || error "Failed to delete database '$DATABASE'."
