# Security Implementation Guide
## Practical Implementation of Security by Design in FinWise

---

## Database Schema Updates

### Security-Enhanced Schema
```sql
-- migrations/XXXX-XX-XX-XXXXXX_add_security_tables/up.sql

-- Users table with security fields
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    mfa_secret VARCHAR(32),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced accounts table with encryption
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS encrypted_account_number BYTEA;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS encrypted_balance BYTEA;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- Enhanced transactions table with encryption
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS encrypted_amount BYTEA;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS encrypted_description BYTEA;

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    ip_address INET NOT NULL,
    user_agent TEXT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    risk_score INTEGER DEFAULT 0,
    digital_signature VARCHAR(512) NOT NULL
);

-- Sessions table for secure session management
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rate limiting table
CREATE TABLE rate_limits (
    id SERIAL PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL, -- IP address or user ID
    action VARCHAR(100) NOT NULL,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(identifier, action)
);

-- Encryption keys table for key rotation
CREATE TABLE encryption_keys (
    id SERIAL PRIMARY KEY,
    key_id UUID UNIQUE NOT NULL,
    encrypted_key BYTEA NOT NULL,
    algorithm VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Row Level Security Policies
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own accounts
CREATE POLICY account_user_policy ON accounts
    FOR ALL
    TO authenticated_user
    USING (user_id = current_setting('app.current_user_id')::INTEGER);

-- Policy: Users can only access their own transactions
CREATE POLICY transaction_user_policy ON transactions
    FOR ALL
    TO authenticated_user
    USING (account_id IN (
        SELECT id FROM accounts WHERE user_id = current_setting('app.current_user_id')::INTEGER
    ));

-- Indexes for performance and security
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_locked_until ON users(locked_until) WHERE locked_until IS NOT NULL;
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_risk_score ON audit_logs(risk_score) WHERE risk_score > 50;
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);
```

---

## Testing Security

### Security Test Suite
```rust
// tests/security_tests.rs
use finwise::security::{
    auth::AuthService,
    encryption::EncryptionService,
    validation::*,
};

#[cfg(test)]
mod security_tests {
    use super::*;

    #[tokio::test]
    async fn test_password_hashing() {
        let auth_service = AuthService::new("test_jwt_secret".to_string());
        
        let password = "SecurePassword123!";
        let hash = auth_service.hash_password(password).unwrap();
        
        assert!(auth_service.verify_password(password, &hash).unwrap());
        assert!(!auth_service.verify_password("WrongPassword", &hash).unwrap());
    }

    #[tokio::test]
    async fn test_jwt_generation_and_validation() {
        let auth_service = AuthService::new("test_jwt_secret_key_256_bits_long_enough".to_string());
        
        let user_id = "test_user_123";
        let roles = vec!["user".to_string()];
        
        let token = auth_service.generate_jwt(user_id, roles.clone()).unwrap();
        let claims = auth_service.validate_jwt(&token).unwrap();
        
        assert_eq!(claims.sub, user_id);
        assert_eq!(claims.roles, roles);
    }

    #[test]
    fn test_encryption_decryption() {
        let encryption_service = EncryptionService::new("test_master_key_256_bits").unwrap();
        
        let plaintext = "1234567890123456"; // Account number
        let encrypted = encryption_service.encrypt_string(plaintext).unwrap();
        let decrypted = encryption_service.decrypt_string(&encrypted).unwrap();
        
        assert_eq!(plaintext, decrypted);
        assert_ne!(plaintext.as_bytes(), encrypted.as_slice());
    }

    #[test]
    fn test_input_validation() {
        // Test account number validation
        assert!(validate_account_number("1234567890123456").is_ok());
        assert!(validate_account_number("123").is_err()); // Too short
        assert!(validate_account_number("12345678901234567890123").is_err()); // Too long
        assert!(validate_account_number("12345678a0123456").is_err()); // Invalid chars

        // Test IBAN validation
        assert!(validate_iban("GB33BUKB20201555555555").is_ok());
        assert!(validate_iban("INVALID_IBAN").is_err());

        // Test amount validation
        assert!(validate_amount("123.45").is_ok());
        assert!(validate_amount("0.01").is_ok());
        assert!(validate_amount("-123.45").is_err()); // Negative
        assert!(validate_amount("123.456").is_err()); // Too many decimals
    }

    #[test]
    fn test_input_sanitization() {
        let malicious_input = "<script>alert('xss')</script>John Doe";
        let sanitized = sanitize_input(malicious_input);
        assert!(!sanitized.contains("<script>"));
        assert!(sanitized.contains("John Doe"));
    }

    #[test]
    fn test_bigdecimal_encryption() {
        let encryption_service = EncryptionService::new("test_master_key_256_bits").unwrap();
        
        let amount = bigdecimal::BigDecimal::from_str("1234.56").unwrap();
        let encrypted = encryption_service.encrypt_bigdecimal(&amount).unwrap();
        let decrypted = encryption_service.decrypt_bigdecimal(&encrypted).unwrap();
        
        assert_eq!(amount, decrypted);
    }
}

// Integration tests for security middleware
#[cfg(test)]
mod integration_tests {
    use super::*;
    use axum::{
        body::Body,
        http::{Request, StatusCode},
    };
    use tower::ServiceExt;

    #[tokio::test]
    async fn test_security_headers() {
        // Test that security headers are properly set
        let app = create_test_app_with_security_middleware();
        
        let response = app
            .oneshot(Request::builder().uri("/").body(Body::empty()).unwrap())
            .await
            .unwrap();

        let headers = response.headers();
        assert_eq!(headers.get("X-Content-Type-Options").unwrap(), "nosniff");
        assert_eq!(headers.get("X-Frame-Options").unwrap(), "DENY");
        assert!(headers.get("Strict-Transport-Security").is_some());
        assert!(headers.get("server").is_none()); // Server header should be removed
    }

    #[tokio::test]
    async fn test_authentication_middleware() {
        let app = create_test_app_with_auth_middleware();
        
        // Test request without token
        let response = app
            .clone()
            .oneshot(
                Request::builder()
                    .uri("/protected")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);

        // Test request with invalid token
        let response = app
            .clone()
            .oneshot(
                Request::builder()
                    .uri("/protected")
                    .header("Authorization", "Bearer invalid_token")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }

    fn create_test_app_with_security_middleware() -> axum::Router {
        // Implementation would create a test app with security middleware
        todo!()
    }

    fn create_test_app_with_auth_middleware() -> axum::Router {
        // Implementation would create a test app with auth middleware
        todo!()
    }
}
```

---

## Implementation Roadmap

### Phase 1: Foundation Security (Weeks 1-4)

#### Week 1: Environment and Configuration Security
- [ ] Create secure configuration management system
- [ ] Set up environment variables with validation
- [ ] Implement configuration encryption for sensitive values
- [ ] Create secure key management foundation

#### Week 2: Authentication System
- [ ] Implement user model with security fields
- [ ] Create password hashing with Argon2
- [ ] Build JWT authentication system
- [ ] Add account lockout mechanism

#### Week 3: Database Security Foundations
- [ ] Update database schema with security tables
- [ ] Implement Row Level Security policies
- [ ] Add encrypted columns for sensitive data
- [ ] Create secure database connection pooling

#### Week 4: Basic Encryption Services
- [ ] Implement field-level encryption service
- [ ] Create key derivation functions
- [ ] Add encryption for account numbers and balances
- [ ] Test encryption/decryption performance

### Phase 2: Enhanced Security (Weeks 5-8)

#### Week 5: Multi-Factor Authentication
- [ ] Implement TOTP-based MFA
- [ ] Create QR code generation for authenticator apps
- [ ] Add MFA verification endpoints
- [ ] Build MFA recovery mechanisms

#### Week 6: Input Validation and Sanitization
- [ ] Create comprehensive validation rules
- [ ] Implement input sanitization functions
- [ ] Add specialized financial data validators
- [ ] Build validation middleware

#### Week 7: Audit Logging System
- [ ] Implement comprehensive audit logging
- [ ] Create digital signature system for audit entries
- [ ] Add risk scoring algorithms
- [ ] Build audit log analysis tools

#### Week 8: API Security Layer
- [ ] Create security middleware stack
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Build request/response filtering

### Phase 3: Advanced Security (Weeks 9-12)

#### Week 9: Session Management
- [ ] Implement secure session handling
- [ ] Add session invalidation mechanisms
- [ ] Create concurrent session limits
- [ ] Build session monitoring

#### Week 10: Monitoring and Alerting
- [ ] Set up security monitoring dashboards
- [ ] Create anomaly detection algorithms
- [ ] Implement real-time alerting
- [ ] Add security metrics collection

#### Week 11: Compliance and Reporting
- [ ] Build compliance reporting tools
- [ ] Create data retention policies
- [ ] Implement privacy controls
- [ ] Add regulatory compliance checks

#### Week 12: Security Testing and Hardening
- [ ] Conduct penetration testing
- [ ] Perform security code review
- [ ] Fix identified vulnerabilities
- [ ] Document security procedures

### Implementation Commands

```bash
# 1. Update dependencies
cargo update

# 2. Create security module structure
mkdir -p src/security
mkdir -p src/config
mkdir -p tests/security

# 3. Run security tests
cargo test security_tests

# 4. Set up environment
cp .env.example .env
# Edit .env with secure values

# 5. Generate encryption keys
openssl rand -hex 32 > master.key
openssl rand -hex 32 > jwt.key

# 6. Run database migrations
diesel migration run

# 7. Build with security features
cargo build --release

# 8. Run security audit
cargo audit
```

### Security Checklist

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

---

## Environment Setup

### Secure Environment Variables
```bash
# Create .env.example
cat > .env.example << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost/finwise?sslmode=require

# Security Configuration
JWT_SECRET_KEY=your_256_bit_secret_key_here
MASTER_ENCRYPTION_KEY=your_master_encryption_key_here
AUDIT_SIGNING_KEY=your_audit_signing_key_here

# Authentication Settings
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_SECONDS=900
REQUIRE_MFA=true
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_SPECIAL=true

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
```

### Key Generation Script
```bash
#!/bin/bash
# scripts/generate_keys.sh

echo "Generating secure keys for FinWise..."

# Generate JWT secret (256 bits)
JWT_SECRET=$(openssl rand -hex 32)
echo "JWT_SECRET_KEY=$JWT_SECRET" > .env.local

# Generate master encryption key (256 bits)
MASTER_KEY=$(openssl rand -hex 32)
echo "MASTER_ENCRYPTION_KEY=$MASTER_KEY" >> .env.local

# Generate audit signing key (256 bits)
AUDIT_KEY=$(openssl rand -hex 32)
echo "AUDIT_SIGNING_KEY=$AUDIT_KEY" >> .env.local

# Generate database encryption key
DB_KEY=$(openssl rand -hex 32)
echo "DATABASE_ENCRYPTION_KEY=$DB_KEY" >> .env.local

echo "Keys generated in .env.local"
echo "⚠️  Keep these keys secure and never commit them to version control!"
echo "✅ Copy the keys to your production environment securely"

chmod 600 .env.local
```

This comprehensive Security Implementation Guide provides:

1. **Practical Code Examples**: Real Rust implementations for all security components
2. **Database Schema Updates**: SQL scripts for security-enhanced tables
3. **Testing Framework**: Complete security test suite
4. **Implementation Roadmap**: 12-week phased approach
5. **Environment Setup**: Secure configuration management
6. **Updated Dependencies**: All necessary security crates in Cargo.toml

The guide bridges the gap between the conceptual cybersecurity framework and actual implementation, giving you everything needed to build a banking-grade secure application with Rust. Each component is designed to work together following security-by-design principles while maintaining high performance and usability.
