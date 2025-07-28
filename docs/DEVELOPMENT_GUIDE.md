# Development Guide - Next Steps

## Immediate Action Items

### 1. Enhanced Main Application Structure

First, let's create a proper application entry point with CLI capabilities and configuration management.

#### Create Application Configuration
```rust
// src/config.rs
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Config {
    pub database: DatabaseConfig,
    pub server: ServerConfig,
    pub logging: LoggingConfig,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct DatabaseConfig {
    pub url: String,
    pub pool_size: u32,
    pub timeout_seconds: u64,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct LoggingConfig {
    pub level: String,
    pub file_path: Option<String>,
}

impl Config {
    pub fn from_env() -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Config {
            database: DatabaseConfig {
                url: env::var("DATABASE_URL")?,
                pool_size: env::var("DB_POOL_SIZE")
                    .unwrap_or_else(|_| "10".to_string())
                    .parse()?,
                timeout_seconds: env::var("DB_TIMEOUT")
                    .unwrap_or_else(|_| "30".to_string())
                    .parse()?,
            },
            server: ServerConfig {
                host: env::var("SERVER_HOST")
                    .unwrap_or_else(|_| "localhost".to_string()),
                port: env::var("SERVER_PORT")
                    .unwrap_or_else(|_| "8080".to_string())
                    .parse()?,
            },
            logging: LoggingConfig {
                level: env::var("LOG_LEVEL")
                    .unwrap_or_else(|_| "info".to_string()),
                file_path: env::var("LOG_FILE").ok(),
            },
        })
    }
}
```

#### Enhanced Main Application
```rust
// src/main.rs
mod config;
mod models;
mod services;
mod utils;
mod schema;
mod cli;

use clap::{App, Arg, SubCommand};
use config::Config;
use utils::db::DatabasePool;
use std::sync::Arc;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load configuration
    dotenv::dotenv().ok();
    let config = Config::from_env()?;
    
    // Initialize logging
    init_logging(&config.logging)?;
    
    // Initialize database pool
    let db_pool = Arc::new(DatabasePool::new(&config.database)?);
    
    // Parse CLI arguments
    let matches = App::new("FinWise")
        .version("0.1.0")
        .about("Personal Finance Management System")
        .subcommand(SubCommand::with_name("server")
            .about("Start the web server"))
        .subcommand(SubCommand::with_name("import")
            .about("Import financial data")
            .arg(Arg::with_name("file")
                .short("f")
                .long("file")
                .value_name("FILE")
                .help("File to import")
                .required(true)))
        .subcommand(SubCommand::with_name("sync")
            .about("Sync accounts with banks"))
        .subcommand(SubCommand::with_name("report")
            .about("Generate financial reports")
            .arg(Arg::with_name("type")
                .short("t")
                .long("type")
                .value_name("TYPE")
                .help("Report type (summary, transactions, categories)")
                .default_value("summary")))
        .get_matches();

    match matches.subcommand() {
        ("server", Some(_)) => {
            cli::commands::start_server(config, db_pool).await?;
        },
        ("import", Some(sub_m)) => {
            let file_path = sub_m.value_of("file").unwrap();
            cli::commands::import_data(file_path, db_pool).await?;
        },
        ("sync", Some(_)) => {
            cli::commands::sync_accounts(db_pool).await?;
        },
        ("report", Some(sub_m)) => {
            let report_type = sub_m.value_of("type").unwrap();
            cli::commands::generate_report(report_type, db_pool).await?;
        },
        _ => {
            println!("Use --help for available commands");
        }
    }

    Ok(())
}

fn init_logging(config: &config::LoggingConfig) -> Result<(), Box<dyn std::error::Error>> {
    use log::LevelFilter;
    use env_logger::Builder;
    use std::io::Write;

    let level = match config.level.as_str() {
        "debug" => LevelFilter::Debug,
        "info" => LevelFilter::Info,
        "warn" => LevelFilter::Warn,
        "error" => LevelFilter::Error,
        _ => LevelFilter::Info,
    };

    let mut builder = Builder::from_default_env();
    builder.filter_level(level);
    
    if let Some(file_path) = &config.file_path {
        let target = Box::new(std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(file_path)?);
        builder.target(env_logger::Target::Pipe(target));
    }

    builder.init();
    Ok(())
}
```

### 2. Enhanced Database Models

Let's improve the current models with validation, audit fields, and better relationships:

#### Enhanced Party Model
```rust
// src/models/party.rs
use diesel::prelude::*;
use crate::schema::parties;
use chrono::{NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Queryable, Identifiable, Debug, Serialize)]
pub struct Party {
    pub id: i32,
    pub name: String,
    pub phone: Option<String>,
    pub iban: Option<String>,
    pub institution_id: Option<i32>,
    pub address_id: Option<i32>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub deleted_at: Option<NaiveDateTime>,
}

#[derive(Insertable, Debug, Deserialize)]
#[table_name = "parties"]
pub struct NewParty {
    pub name: String,
    pub phone: Option<String>,
    pub iban: Option<String>,
    pub institution_id: Option<i32>,
    pub address_id: Option<i32>,
}

impl NewParty {
    pub fn new(name: String) -> Self {
        Self {
            name,
            phone: None,
            iban: None,
            institution_id: None,
            address_id: None,
        }
    }
    
    pub fn validate(&self) -> Result<(), Vec<String>> {
        let mut errors = Vec::new();
        
        if self.name.trim().is_empty() {
            errors.push("Name cannot be empty".to_string());
        }
        
        if let Some(iban) = &self.iban {
            if !is_valid_iban(iban) {
                errors.push("Invalid IBAN format".to_string());
            }
        }
        
        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }
}

fn is_valid_iban(iban: &str) -> bool {
    // Basic IBAN validation - implement proper IBAN validation
    iban.len() >= 15 && iban.chars().all(|c| c.is_alphanumeric())
}
```

#### Enhanced Account Model
```rust
// src/models/account.rs
use diesel::prelude::*;
use crate::schema::accounts;
use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use rust_decimal::Decimal;

#[derive(Queryable, Identifiable, Debug, Serialize, Associations)]
#[belongs_to(Party)]
pub struct Account {
    pub id: i32,
    pub party_id: i32,
    pub account_number: String,
    pub account_type: AccountType,
    pub balance: Decimal,
    pub currency: String,
    pub is_active: bool,
    pub last_sync: Option<NaiveDateTime>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize, DbEnum)]
pub enum AccountType {
    Checking,
    Savings,
    Credit,
    Investment,
    Loan,
}

#[derive(Insertable, Debug, Deserialize)]
#[table_name = "accounts"]
pub struct NewAccount {
    pub party_id: i32,
    pub account_number: String,
    pub account_type: AccountType,
    pub balance: Decimal,
    pub currency: String,
}

impl NewAccount {
    pub fn validate(&self) -> Result<(), Vec<String>> {
        let mut errors = Vec::new();
        
        if self.account_number.trim().is_empty() {
            errors.push("Account number cannot be empty".to_string());
        }
        
        if self.currency.len() != 3 {
            errors.push("Currency must be a 3-letter ISO code".to_string());
        }
        
        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }
}
```

### 3. Enhanced Services with Business Logic

#### Transaction Categorization Service
```rust
// src/services/categorization_service.rs
use crate::models::{Transaction, Category};
use std::collections::HashMap;
use regex::Regex;

pub struct CategorizationService {
    rules: Vec<CategorizationRule>,
    ml_model: Option<MLCategorizationModel>,
}

pub struct CategorizationRule {
    pub category_id: i32,
    pub patterns: Vec<Regex>,
    pub amount_range: Option<(f64, f64)>,
    pub priority: i32,
}

impl CategorizationService {
    pub fn new() -> Self {
        Self {
            rules: Self::load_default_rules(),
            ml_model: None,
        }
    }
    
    pub fn categorize_transaction(&self, transaction: &Transaction) -> Option<i32> {
        // Rule-based categorization
        for rule in &self.rules {
            if self.matches_rule(transaction, rule) {
                return Some(rule.category_id);
            }
        }
        
        // ML-based categorization fallback
        if let Some(model) = &self.ml_model {
            return model.predict_category(transaction);
        }
        
        None
    }
    
    fn matches_rule(&self, transaction: &Transaction, rule: &CategorizationRule) -> bool {
        // Check description patterns
        for pattern in &rule.patterns {
            if pattern.is_match(&transaction.description.unwrap_or_default()) {
                return true;
            }
        }
        
        // Check amount range
        if let Some((min, max)) = rule.amount_range {
            let amount = transaction.amount.to_f64().unwrap_or(0.0);
            if amount < min || amount > max {
                return false;
            }
        }
        
        false
    }
    
    fn load_default_rules() -> Vec<CategorizationRule> {
        vec![
            CategorizationRule {
                category_id: 1, // Groceries
                patterns: vec![
                    Regex::new(r"(?i)grocery|supermarket|walmart|target").unwrap(),
                ],
                amount_range: None,
                priority: 1,
            },
            // Add more rules...
        ]
    }
}
```

### 4. CLI Commands Implementation

```rust
// src/cli/commands.rs
use crate::config::Config;
use crate::utils::db::DatabasePool;
use crate::services::*;
use std::sync::Arc;
use log::{info, error};

pub async fn start_server(
    config: Config, 
    db_pool: Arc<DatabasePool>
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Starting FinWise server on {}:{}", config.server.host, config.server.port);
    
    // TODO: Implement web server using warp or axum
    println!("Server would start here");
    Ok(())
}

pub async fn import_data(
    file_path: &str,
    db_pool: Arc<DatabasePool>
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Importing data from: {}", file_path);
    
    let conn = db_pool.get_connection()?;
    let transaction_service = TransactionService::new();
    
    // TODO: Implement CSV/OFX file parsing
    // let transactions = parse_file(file_path)?;
    // for transaction in transactions {
    //     transaction_service.create_transaction(&conn, transaction)?;
    // }
    
    println!("Import completed");
    Ok(())
}

pub async fn sync_accounts(
    db_pool: Arc<DatabasePool>
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Syncing accounts with financial institutions");
    
    let conn = db_pool.get_connection()?;
    let account_service = AccountService::new();
    
    // TODO: Implement account synchronization
    println!("Sync completed");
    Ok(())
}

pub async fn generate_report(
    report_type: &str,
    db_pool: Arc<DatabasePool>
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Generating {} report", report_type);
    
    let conn = db_pool.get_connection()?;
    
    match report_type {
        "summary" => generate_summary_report(&conn)?,
        "transactions" => generate_transaction_report(&conn)?,
        "categories" => generate_category_report(&conn)?,
        _ => {
            error!("Unknown report type: {}", report_type);
            return Err("Invalid report type".into());
        }
    }
    
    Ok(())
}

fn generate_summary_report(conn: &diesel::PgConnection) -> Result<(), Box<dyn std::error::Error>> {
    // TODO: Implement summary report generation
    println!("Account Summary Report");
    println!("====================");
    println!("Total Balance: $0.00");
    println!("Active Accounts: 0");
    println!("Recent Transactions: 0");
    Ok(())
}

fn generate_transaction_report(conn: &diesel::PgConnection) -> Result<(), Box<dyn std::error::Error>> {
    // TODO: Implement transaction report
    println!("Transaction Report - Last 30 Days");
    println!("=================================");
    Ok(())
}

fn generate_category_report(conn: &diesel::PgConnection) -> Result<(), Box<dyn std::error::Error>> {
    // TODO: Implement category breakdown report
    println!("Spending by Category");
    println!("===================");
    Ok(())
}
```

### 5. Enhanced Database Schema Migration

Create a new migration to improve the schema:

```sql
-- migrations/xxxx_enhance_schema/up.sql

-- Add institutions table
CREATE TABLE institutions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    institution_type TEXT NOT NULL,
    api_endpoint TEXT,
    logo_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id INTEGER REFERENCES categories(id),
    color TEXT,
    icon TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add addresses table
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Enhance parties table
ALTER TABLE parties 
ADD COLUMN institution_id INTEGER REFERENCES institutions(id),
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
ADD COLUMN deleted_at TIMESTAMP,
ALTER COLUMN phone DROP NOT NULL,
ALTER COLUMN eban DROP NOT NULL,
ALTER COLUMN address_id DROP NOT NULL;

-- Enhance accounts table
ALTER TABLE accounts
ADD COLUMN account_number TEXT NOT NULL DEFAULT '',
ADD COLUMN account_type TEXT NOT NULL DEFAULT 'checking',
ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN last_sync TIMESTAMP,
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
ALTER COLUMN balance TYPE DECIMAL(15,2);

-- Enhance transactions table
ALTER TABLE transactions
ADD COLUMN category_id INTEGER REFERENCES categories(id),
ADD COLUMN description TEXT,
ADD COLUMN reference TEXT,
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
ALTER COLUMN amount TYPE DECIMAL(15,2);

-- Update receipts table
ALTER TABLE receipts
ADD COLUMN transaction_id INTEGER REFERENCES transactions(id),
ADD COLUMN merchant_name TEXT,
ADD COLUMN total_amount DECIMAL(15,2),
ADD COLUMN tax_amount DECIMAL(15,2),
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
ALTER COLUMN date TYPE TIMESTAMP USING (date || ' ' || time)::TIMESTAMP,
DROP COLUMN time;

-- Create indexes for performance
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_parties ON transactions(from_party_id, to_party_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_accounts_party ON accounts(party_id);
CREATE INDEX idx_parties_institution ON parties(institution_id);

-- Insert default categories
INSERT INTO categories (name, color, icon) VALUES
('Income', '#4CAF50', 'trending-up'),
('Groceries', '#FF9800', 'shopping-cart'),
('Transportation', '#2196F3', 'car'),
('Entertainment', '#E91E63', 'music'),
('Utilities', '#9C27B0', 'zap'),
('Healthcare', '#F44336', 'heart'),
('Education', '#3F51B5', 'book'),
('Other', '#607D8B', 'more-horizontal');
```

### 6. Updated Dependencies

Add these to your `Cargo.toml`:

```toml
[dependencies]
diesel = { version = "2.0", features = ["postgres", "chrono", "r2d2", "numeric"] }
dotenv = "0.15"
chrono = { version = "0.4", features = ["serde"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
clap = "2.34"
tokio = { version = "1.0", features = ["full"] }
log = "0.4"
env_logger = "0.10"
thiserror = "1.0"
regex = "1.0"
rust_decimal = { version = "1.0", features = ["serde"] }
r2d2 = "0.8"
uuid = { version = "1.0", features = ["v4", "serde"] }

[dev-dependencies]
tempfile = "3.0"
```

## Next Development Phases

1. **Implement the enhanced models and services**
2. **Create database migrations**
3. **Add comprehensive testing**
4. **Implement file import functionality**
5. **Add basic web API using axum/warp**
6. **Create integration modules for banks**

This structure provides a solid foundation for scaling your finance application while maintaining clean architecture and security best practices.
