# FinWise Database Security Guide

## 🔐 Secure Database Storage

FinWise now stores database credentials securely in your home directory, completely separate from the project repository. This ensures your sensitive database information is never accidentally committed to version control.

## Quick Setup

### Option 1: Automated Setup Script
```bash
# Run from the FinWise project directory
./scripts/setup_secure_db.sh
```

### Option 2: Manual Setup
```bash
# Build the project
cargo build --release

# Run the setup command
cargo run -- setup-db
```

## Security Features

### ✅ What's Secure Now:
- **Home Directory Storage**: Database credentials stored in `~/FinWise/.finwise_db_credentials`
- **Git Exclusion**: Credentials automatically excluded from version control
- **File Permissions**: Restricted to your user account only (Unix systems)
- **Legacy Migration**: Automatically detects and migrates old insecure credentials
- **No Hardcoded Secrets**: No sensitive data in source code

### ❌ What's Protected Against:
- Accidental commits of database passwords
- Unauthorized access by other users on the system
- Exposure in project backups or archives
- Sharing credentials when sharing code

## File Locations

```
~/FinWise/                          # Secure data directory
├── .finwise_db_credentials         # Database credentials (secure)
└── [future: database files]        # SQLite databases (if used)

Project Directory/                  # Git repository
├── src/                           # Source code (safe to commit)
├── frontend/                      # Frontend code (safe to commit)
├── db_keyfile                     # ⚠️ LEGACY - will be migrated
└── .gitignore                     # Updated to exclude all DB files
```

## Credential File Format

The secure credentials file uses a simple key-value format:
```
username=your_postgres_username
password=your_postgres_password
```

## Environment Variables (Alternative)

You can also use environment variables instead of the credentials file:
```bash
export DATABASE_URL="postgres://username:password@localhost/finance_wise"
```

## Migration from Legacy Setup

If you have an existing `db_keyfile` in your project directory:

1. **Automatic Migration**: Run `cargo run -- setup-db`
2. **Legacy Detection**: The system will warn you about insecure storage
3. **Safe Removal**: The setup process will offer to remove the old file
4. **Backup**: Keep a backup of your credentials before migration

## Database Connection Priority

FinWise looks for database credentials in this order:

1. **Secure Home Directory**: `~/FinWise/.finwise_db_credentials` ✅ Recommended
2. **Environment Variable**: `DATABASE_KEYFILE` pointing to custom location
3. **Legacy Project File**: `db_keyfile` in project directory ⚠️ Insecure
4. **Direct Environment**: `DATABASE_URL` environment variable

## Troubleshooting

### Setup Issues
```bash
# Check if credentials file exists
ls -la ~/FinWise/.finwise_db_credentials

# Check file permissions (should be 600)
ls -l ~/FinWise/.finwise_db_credentials

# Test database connection
cargo run -- report
```

### Connection Issues
```bash
# Verify PostgreSQL is running
pg_isready -h localhost

# Check database exists
psql -h localhost -U your_username -l
```

### Reset Setup
```bash
# Remove secure credentials (will prompt for new ones)
rm ~/FinWise/.finwise_db_credentials

# Run setup again
cargo run -- setup-db
```

## Development vs Production

### Development Setup
- Use the secure home directory storage
- Keep credentials local to your development machine
- Use separate development database

### Production Deployment
- Use environment variables or secrets management
- Never deploy with credentials files
- Use encrypted connections (SSL)

## Security Best Practices

1. **Regular Password Rotation**: Change database passwords periodically
2. **Limited Privileges**: Use database users with minimal required permissions
3. **Network Security**: Use localhost or encrypted connections only
4. **Backup Security**: Ensure database backups are also encrypted
5. **Access Auditing**: Monitor database access logs

## Commands Reference

```bash
# Database setup and migration
cargo run -- setup-db              # Interactive setup
./scripts/setup_secure_db.sh       # Automated setup

# Application commands (require database setup)
cargo run -- server                # Start web server
cargo run -- report               # Generate reports
cargo run -- import -f data.csv   # Import financial data
cargo run -- sync                 # Sync with banks
```

## Additional Security Considerations

- The `~/FinWise/` directory is ideal for future SQLite database files
- All database-related files are excluded from git via `.gitignore`
- File permissions prevent access by other system users
- Consider full-disk encryption for additional protection

---

**⚠️ Important**: Never commit database credentials to version control. Always use the secure storage methods described above.
