# Technical Architecture Document

## System Architecture Overview

FinWise follows a layered architecture pattern optimized for financial data processing and security.

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Web UI    │  │   REST API  │  │      CLI Tool       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Controllers │  │ Middleware  │  │   Business Logic    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Account   │  │Transaction  │  │      Party          │ │
│  │   Service   │  │   Service   │  │     Service         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Receipt   │  │ Integration │  │   Analytics         │ │
│  │   Service   │  │   Service   │  │    Service          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Models    │  │ Repositories│  │      Database       │ │
│  │             │  │             │  │     (Postgres)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 External Integration Layer                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Bank APIs  │  │ File Import │  │    Credit Cards     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Model Design

### Enhanced Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Institutions  │    │     Parties     │    │    Addresses    │
│─────────────────│    │─────────────────│    │─────────────────│
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ name            │◄──┐│ name            │    │ street          │
│ type            │   ││ phone           │───►│ city            │
│ api_endpoint    │   ││ iban           │    │ postal_code     │
│ logo_url        │   ││ institution_id  │    │ country         │
│ created_at      │   ││ address_id      │    │ created_at      │
│ updated_at      │   ││ created_at      │    │ updated_at      │
└─────────────────┘   │└─────────────────┘    └─────────────────┘
                      │         │
                      │         ▼
                      │┌─────────────────┐    ┌─────────────────┐
                      ││    Accounts     │    │   Categories    │
                      ││─────────────────│    │─────────────────│
                      ││ id (PK)         │    │ id (PK)         │
                      ││ party_id (FK)   │    │ name            │
                      ││ account_number  │    │ parent_id (FK)  │
                      ││ account_type    │    │ color           │
                      ││ balance         │    │ icon            │
                      ││ currency        │    │ created_at      │
                      ││ is_active       │    │ updated_at      │
                      ││ created_at      │    └─────────────────┘
                      ││ updated_at      │             ▲
                      │└─────────────────┘             │
                      │         │                      │
                      │         ▼                      │
                      │┌─────────────────┐             │
                      └┤  Transactions   │             │
                       │─────────────────│             │
                       │ id (PK)         │             │
                       │ amount          │             │
                       │ from_party_id   │◄────────────┤
                       │ to_party_id     │             │
                       │ category_id     │─────────────┘
                       │ description     │
                       │ reference       │
                       │ date            │
                       │ created_at      │
                       │ updated_at      │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │    Receipts     │
                       │─────────────────│
                       │ id (PK)         │
                       │ transaction_id  │
                       │ payment_method  │
                       │ merchant_name   │
                       │ total_amount    │
                       │ tax_amount      │
                       │ items           │
                       │ created_at      │
                       │ updated_at      │
                       └─────────────────┘
```

## Service Layer Architecture

### Core Services

#### 1. Account Service
```rust
pub struct AccountService {
    repository: AccountRepository,
    integration_service: IntegrationService,
}

impl AccountService {
    // Core CRUD operations
    pub fn create_account(&self, request: CreateAccountRequest) -> Result<Account>;
    pub fn get_account(&self, id: i32) -> Result<Account>;
    pub fn update_balance(&self, id: i32, balance: Decimal) -> Result<()>;
    
    // Business operations
    pub fn sync_account_balance(&self, id: i32) -> Result<()>;
    pub fn calculate_account_summary(&self, id: i32) -> Result<AccountSummary>;
    pub fn get_account_history(&self, id: i32, period: Period) -> Result<Vec<Transaction>>;
}
```

#### 2. Transaction Service
```rust
pub struct TransactionService {
    repository: TransactionRepository,
    categorization_service: CategorizationService,
}

impl TransactionService {
    pub fn create_transaction(&self, request: CreateTransactionRequest) -> Result<Transaction>;
    pub fn categorize_transaction(&self, id: i32) -> Result<()>;
    pub fn get_transactions_by_category(&self, category_id: i32) -> Result<Vec<Transaction>>;
    pub fn get_spending_summary(&self, period: Period) -> Result<SpendingSummary>;
}
```

#### 3. Integration Service
```rust
pub struct IntegrationService {
    bank_clients: HashMap<String, Box<dyn BankClient>>,
}

impl IntegrationService {
    pub fn sync_accounts(&self, institution_id: i32) -> Result<()>;
    pub fn import_transactions(&self, account_id: i32) -> Result<Vec<Transaction>>;
    pub fn validate_credentials(&self, credentials: &Credentials) -> Result<bool>;
}
```

## Configuration Management

### Environment Configuration
```rust
#[derive(Deserialize, Clone)]
pub struct Config {
    pub database: DatabaseConfig,
    pub server: ServerConfig,
    pub integrations: IntegrationConfig,
    pub security: SecurityConfig,
}

#[derive(Deserialize, Clone)]
pub struct DatabaseConfig {
    pub url: String,
    pub pool_size: u32,
    pub timeout: Duration,
}

#[derive(Deserialize, Clone)]
pub struct SecurityConfig {
    pub jwt_secret: String,
    pub encryption_key: String,
    pub rate_limit: RateLimitConfig,
}
```

## Error Handling Strategy

### Custom Error Types
```rust
#[derive(Debug, thiserror::Error)]
pub enum FinWiseError {
    #[error("Database error: {0}")]
    Database(#[from] diesel::result::Error),
    
    #[error("Validation error: {message}")]
    Validation { message: String },
    
    #[error("Integration error: {provider} - {message}")]
    Integration { provider: String, message: String },
    
    #[error("Authentication error: {0}")]
    Authentication(String),
    
    #[error("Authorization error: {0}")]
    Authorization(String),
    
    #[error("Configuration error: {0}")]
    Configuration(String),
}

pub type Result<T> = std::result::Result<T, FinWiseError>;
```

## Security Architecture

### Data Protection
1. **Encryption at Rest**
   - Database field-level encryption for sensitive data
   - Encrypted configuration files
   - Secure key management

2. **Encryption in Transit**
   - TLS 1.3 for all communications
   - Certificate pinning for bank API connections
   - API key rotation mechanisms

3. **Access Control**
   - JWT-based authentication
   - Role-based authorization (RBAC)
   - API rate limiting
   - Request validation and sanitization

### Security Middleware Stack
```rust
pub fn security_middleware() -> Vec<Box<dyn Middleware>> {
    vec![
        Box::new(AuthenticationMiddleware::new()),
        Box::new(AuthorizationMiddleware::new()),
        Box::new(RateLimitMiddleware::new()),
        Box::new(InputValidationMiddleware::new()),
        Box::new(AuditLoggingMiddleware::new()),
    ]
}
```

## Performance Considerations

### Database Optimization
1. **Indexing Strategy**
   ```sql
   -- Performance indexes
   CREATE INDEX idx_transactions_date ON transactions(date);
   CREATE INDEX idx_transactions_party ON transactions(from_party_id, to_party_id);
   CREATE INDEX idx_transactions_category ON transactions(category_id);
   CREATE INDEX idx_accounts_party ON accounts(party_id);
   ```

2. **Connection Pooling**
   ```rust
   pub struct DatabasePool {
       pool: r2d2::Pool<ConnectionManager<PgConnection>>,
   }
   
   impl DatabasePool {
       pub fn new(database_url: &str, max_size: u32) -> Result<Self> {
           let manager = ConnectionManager::<PgConnection>::new(database_url);
           let pool = r2d2::Pool::builder()
               .max_size(max_size)
               .build(manager)?;
           Ok(Self { pool })
       }
   }
   ```

3. **Caching Strategy**
   - Redis for session management
   - Application-level caching for frequently accessed data
   - Database query result caching

### Async Processing
```rust
pub struct BackgroundJobProcessor {
    redis_client: redis::Client,
    job_queue: mpsc::Receiver<Job>,
}

impl BackgroundJobProcessor {
    pub async fn process_sync_job(&self, account_id: i32) -> Result<()> {
        // Asynchronous account synchronization
        tokio::spawn(async move {
            // Sync logic here
        });
    }
}
```

## Testing Strategy

### Test Pyramid
1. **Unit Tests** (70%)
   - Service layer logic
   - Model validation
   - Utility functions

2. **Integration Tests** (20%)
   - Database operations
   - External API integrations
   - Service interactions

3. **End-to-End Tests** (10%)
   - Complete user workflows
   - API endpoint testing
   - UI functionality

### Test Infrastructure
```rust
#[cfg(test)]
mod tests {
    use super::*;
    use diesel::test_transaction;
    
    fn setup_test_db() -> TestDatabase {
        TestDatabase::new()
    }
    
    #[test]
    fn test_account_creation() {
        let db = setup_test_db();
        test_transaction::<_, Error, _>(&db.connection(), || {
            // Test logic here
            Ok(())
        });
    }
}
```

## Deployment Architecture

### Containerization
```dockerfile
FROM rust:1.70 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bullseye-slim
RUN apt-get update && apt-get install -y ca-certificates
COPY --from=builder /app/target/release/finwise /usr/local/bin/
CMD ["finwise"]
```

### Infrastructure as Code
- Docker Compose for local development
- Kubernetes manifests for production
- Terraform for cloud infrastructure
- CI/CD pipeline with GitHub Actions

This architecture provides a solid foundation for scaling the FinWise application while maintaining security, performance, and maintainability.
