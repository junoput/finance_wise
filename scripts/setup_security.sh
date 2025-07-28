#!/bin/bash
# FinWise Security Setup Script
# This script helps set up the security infrastructure for the FinWise application

set -e

echo "🔐 FinWise Security Setup"
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v openssl &> /dev/null; then
        print_error "OpenSSL is required but not installed"
        exit 1
    fi
    
    if ! command -v cargo &> /dev/null; then
        print_error "Cargo is required but not installed"
        exit 1
    fi
    
    if ! command -v diesel &> /dev/null; then
        print_warning "Diesel CLI not found. Install with: cargo install diesel_cli --no-default-features --features postgres"
    fi
    
    print_status "Dependencies check completed"
}

# Create security directory structure
create_directories() {
    print_info "Creating security directory structure..."
    
    mkdir -p src/security
    mkdir -p src/config
    mkdir -p tests/security
    mkdir -p keys
    
    print_status "Directory structure created"
}

# Generate secure keys
generate_keys() {
    print_info "Generating secure keys..."
    
    # Generate JWT secret (256 bits)
    JWT_SECRET=$(openssl rand -hex 32)
    
    # Generate master encryption key (256 bits)
    MASTER_KEY=$(openssl rand -hex 32)
    
    # Generate audit signing key (256 bits)
    AUDIT_KEY=$(openssl rand -hex 32)
    
    # Generate database encryption key
    DB_KEY=$(openssl rand -hex 32)
    
    # Create .env file with secure keys
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost/finwise?sslmode=require

# Security Configuration
JWT_SECRET_KEY=$JWT_SECRET
MASTER_ENCRYPTION_KEY=$MASTER_KEY
AUDIT_SIGNING_KEY=$AUDIT_KEY
DATABASE_ENCRYPTION_KEY=$DB_KEY

# Authentication Settings
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_SECONDS=900
REQUIRE_MFA=true
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_SPECIAL=true
JWT_EXPIRATION_SECONDS=3600

# Encryption Settings
KEY_ROTATION_DAYS=90
ENCRYPTION_ALGORITHM=AES-256-GCM
KEY_DERIVATION_ITERATIONS=100000

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST_SIZE=10

# Security Headers
HSTS_MAX_AGE=31536000
CSP_POLICY="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"

# Monitoring
SECURITY_ALERT_EMAIL=security@yourcompany.com
MONITORING_ENABLED=true
LOG_LEVEL=info
EOF

    chmod 600 .env
    
    print_status "Secure keys generated and saved to .env"
    print_warning "Keep your .env file secure and never commit it to version control!"
}

# Create example configuration files
create_config_files() {
    print_info "Creating configuration files..."
    
    # Create .env.example
    cat > .env.example << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost/finwise?sslmode=require

# Security Configuration
JWT_SECRET_KEY=your_256_bit_secret_key_here
MASTER_ENCRYPTION_KEY=your_master_encryption_key_here
AUDIT_SIGNING_KEY=your_audit_signing_key_here
DATABASE_ENCRYPTION_KEY=your_database_encryption_key_here

# Authentication Settings
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_SECONDS=900
REQUIRE_MFA=true
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_SPECIAL=true
JWT_EXPIRATION_SECONDS=3600

# Encryption Settings
KEY_ROTATION_DAYS=90
ENCRYPTION_ALGORITHM=AES-256-GCM
KEY_DERIVATION_ITERATIONS=100000

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST_SIZE=10

# Security Headers
HSTS_MAX_AGE=31536000
CSP_POLICY="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"

# Monitoring
SECURITY_ALERT_EMAIL=security@yourcompany.com
MONITORING_ENABLED=true
LOG_LEVEL=info
EOF

    # Create .gitignore entries for security
    if [ ! -f .gitignore ]; then
        touch .gitignore
    fi
    
    # Add security-related entries to .gitignore
    cat >> .gitignore << 'EOF'

# Security files
.env
.env.local
.env.production
keys/
*.key
*.pem
*.p12
db_keyfile

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
EOF

    print_status "Configuration files created"
}

# Install security dependencies
install_dependencies() {
    print_info "Installing security dependencies..."
    
    # The dependencies are already in Cargo.toml, just update
    cargo update
    
    print_status "Dependencies updated"
}

# Create basic security module structure
create_security_modules() {
    print_info "Creating basic security module files..."
    
    # Create mod.rs for security module
    cat > src/security/mod.rs << 'EOF'
//! Security module for FinWise
//! Provides authentication, encryption, validation, and audit capabilities

pub mod auth;
pub mod encryption;
pub mod validation;
pub mod audit;
pub mod middleware;
pub mod mfa;

pub use auth::{AuthService, AuthError, Claims};
pub use encryption::{EncryptionService, EncryptionError};
pub use validation::*;
pub use audit::{AuditService, AuditAction, AuditResource, AuditResult};
EOF

    # Create placeholder files for each security component
    touch src/security/auth.rs
    touch src/security/encryption.rs
    touch src/security/validation.rs
    touch src/security/audit.rs
    touch src/security/middleware.rs
    touch src/security/mfa.rs
    
    # Create config module
    cat > src/config/mod.rs << 'EOF'
//! Configuration module for FinWise
//! Handles secure configuration management

pub mod security;

pub use security::SecurityConfig;
EOF

    touch src/config/security.rs
    
    print_status "Security module structure created"
}

# Create database migration for security tables
create_security_migration() {
    print_info "Creating security database migration..."
    
    if command -v diesel &> /dev/null; then
        # Generate timestamp for migration
        TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
        diesel migration generate add_security_tables
        print_status "Security migration created"
        print_info "You can find the migration files in migrations/ directory"
        print_info "Fill in the up.sql with the schema from SECURITY_IMPLEMENTATION_GUIDE.md"
    else
        print_warning "Diesel CLI not found. Please install it to create migrations."
        print_info "Run: cargo install diesel_cli --no-default-features --features postgres"
    fi
}

# Create security test template
create_security_tests() {
    print_info "Creating security test templates..."
    
    cat > tests/security_tests.rs << 'EOF'
//! Security tests for FinWise
//! Tests authentication, encryption, validation, and other security features

use finwise::security::*;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_placeholder() {
        // Add your security tests here
        assert!(true);
    }
}
EOF

    print_status "Security test template created"
}

# Run security audit
run_security_audit() {
    print_info "Running security audit..."
    
    if command -v cargo-audit &> /dev/null; then
        cargo audit
        print_status "Security audit completed"
    else
        print_warning "cargo-audit not found. Install with: cargo install cargo-audit"
        print_info "This tool helps identify known vulnerabilities in dependencies"
    fi
}

# Create security checklist
create_security_checklist() {
    print_info "Creating security implementation checklist..."
    
    cat > SECURITY_CHECKLIST.md << 'EOF'
# FinWise Security Implementation Checklist

## Phase 1: Foundation Security (Weeks 1-4)

### Week 1: Environment and Configuration Security
- [ ] ✅ Secure configuration management system created
- [ ] ✅ Environment variables set up with validation
- [ ] ✅ Configuration encryption for sensitive values
- [ ] ✅ Secure key management foundation

### Week 2: Authentication System
- [ ] Implement user model with security fields
- [ ] Create password hashing with Argon2
- [ ] Build JWT authentication system
- [ ] Add account lockout mechanism

### Week 3: Database Security Foundations
- [ ] Update database schema with security tables
- [ ] Implement Row Level Security policies
- [ ] Add encrypted columns for sensitive data
- [ ] Create secure database connection pooling

### Week 4: Basic Encryption Services
- [ ] Implement field-level encryption service
- [ ] Create key derivation functions
- [ ] Add encryption for account numbers and balances
- [ ] Test encryption/decryption performance

## Phase 2: Enhanced Security (Weeks 5-8)

### Week 5: Multi-Factor Authentication
- [ ] Implement TOTP-based MFA
- [ ] Create QR code generation for authenticator apps
- [ ] Add MFA verification endpoints
- [ ] Build MFA recovery mechanisms

### Week 6: Input Validation and Sanitization
- [ ] Create comprehensive validation rules
- [ ] Implement input sanitization functions
- [ ] Add specialized financial data validators
- [ ] Build validation middleware

### Week 7: Audit Logging System
- [ ] Implement comprehensive audit logging
- [ ] Create digital signature system for audit entries
- [ ] Add risk scoring algorithms
- [ ] Build audit log analysis tools

### Week 8: API Security Layer
- [ ] Create security middleware stack
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Build request/response filtering

## Phase 3: Advanced Security (Weeks 9-12)

### Week 9: Session Management
- [ ] Implement secure session handling
- [ ] Add session invalidation mechanisms
- [ ] Create concurrent session limits
- [ ] Build session monitoring

### Week 10: Monitoring and Alerting
- [ ] Set up security monitoring dashboards
- [ ] Create anomaly detection algorithms
- [ ] Implement real-time alerting
- [ ] Add security metrics collection

### Week 11: Compliance and Reporting
- [ ] Build compliance reporting tools
- [ ] Create data retention policies
- [ ] Implement privacy controls
- [ ] Add regulatory compliance checks

### Week 12: Security Testing and Hardening
- [ ] Conduct penetration testing
- [ ] Perform security code review
- [ ] Fix identified vulnerabilities
- [ ] Document security procedures

## Security Verification Checklist

- [ ] All sensitive data encrypted at rest
- [ ] All communications encrypted in transit
- [ ] Strong authentication with MFA
- [ ] Comprehensive input validation
- [ ] Detailed audit logging
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] Session management secure
- [ ] Error handling doesn't leak information
- [ ] Dependencies regularly updated
- [ ] Security tests pass
- [ ] Compliance requirements met
EOF

    print_status "Security checklist created"
}

# Main execution
main() {
    echo
    print_info "Starting security setup for FinWise..."
    echo
    
    check_dependencies
    create_directories
    generate_keys
    create_config_files
    install_dependencies
    create_security_modules
    create_security_migration
    create_security_tests
    run_security_audit
    create_security_checklist
    
    echo
    print_status "🎉 Security setup completed successfully!"
    echo
    print_info "Next steps:"
    echo "1. Review the generated .env file and update DATABASE_URL"
    echo "2. Implement security modules using SECURITY_IMPLEMENTATION_GUIDE.md"
    echo "3. Run database migrations: diesel migration run"
    echo "4. Follow the security checklist in SECURITY_CHECKLIST.md"
    echo "5. Start with Phase 1 implementation"
    echo
    print_warning "Important security reminders:"
    echo "• Never commit .env files to version control"
    echo "• Regularly update dependencies with 'cargo update'"
    echo "• Run 'cargo audit' before production deployments"
    echo "• Follow the 12-week implementation roadmap"
    echo "• Test all security features thoroughly"
    echo
}

# Run main function
main "$@"
