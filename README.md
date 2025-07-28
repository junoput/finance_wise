# FinWise - Personal Finance Management System

## Overview
FinWise is a comprehensive personal finance management application built in Rust that aggregates financial information from multiple sources (banks, credit cards, accounts) to provide a unified view of your financial status.

## 🏗️ Current Architecture

### Tech Stack
- **Backend**: Rust with Diesel ORM
- **Database**: PostgreSQL
- **CLI Utilities**: Shell scripts with custom utilities

### Database Schema
The current schema includes four main entities:

1. **Parties**: Financial entities (banks, individuals, companies)
   - Name, phone, IBAN, address reference
   
2. **Accounts**: Financial accounts linked to parties
   - Balance tracking, party association
   
3. **Transactions**: Money movements between parties
   - Amount, from/to parties, timestamp
   
4. **Receipts**: Purchase records
   - Payment method, items, timestamps

### Project Structure
```
src/
├── main.rs           # Entry point (placeholder)
├── schema.rs         # Diesel-generated database schema
├── models/           # Database models
│   ├── account.rs
│   ├── party.rs
│   ├── transaction.rs
│   └── receipt.rs
├── services/         # Business logic layer
│   ├── account_service.rs
│   ├── party_service.rs
│   ├── transaction_service.rs
│   └── receipt_service.rs
└── utils/
    └── db.rs         # Database connection utilities
```

## 🎯 Vision & Goals

### Primary Objectives
1. **Data Aggregation**: Connect to multiple financial institutions
2. **Unified Dashboard**: Single view of all financial accounts
3. **Transaction Categorization**: Automatic expense categorization
4. **Financial Analytics**: Spending patterns, budgeting, forecasting
5. **Security**: Bank-level security for financial data

### Target Features
- Multi-bank account integration
- Real-time balance synchronization
- Expense categorization and budgeting
- Financial reporting and analytics
- Mobile/web interface
- Data export capabilities

## 🚀 Development Roadmap

### Phase 1: Core Foundation (Current)
- [x] Database schema design
- [x] Basic CRUD operations
- [x] Database connection utilities
- [ ] Enhanced main application structure
- [ ] Configuration management
- [ ] Logging system

### Phase 2: Data Layer Enhancement
- [ ] Enhanced data models
- [ ] Data validation
- [ ] Migration system improvements
- [ ] Backup/restore functionality

### Phase 3: Business Logic
- [ ] Transaction categorization engine
- [ ] Account reconciliation
- [ ] Balance calculation algorithms
- [ ] Financial rules engine

### Phase 4: External Integrations
- [ ] Bank API integrations (Open Banking)
- [ ] CSV/OFX file importers
- [ ] Credit card API connections
- [ ] Investment account integration

### Phase 5: User Interface
- [ ] REST API development
- [ ] Web dashboard (React/Vue)
- [ ] Mobile app consideration
- [ ] Reporting engine

### Phase 6: Advanced Features
- [ ] Machine learning for categorization
- [ ] Budgeting and goal tracking
- [ ] Financial forecasting
- [ ] Multi-currency support

## 🔧 Immediate Next Steps

1. **Enhance Main Application**
   - Create proper CLI interface
   - Add configuration management
   - Implement logging

2. **Improve Data Models**
   - Add validation
   - Enhance relationships
   - Add audit fields

3. **Build Core Services**
   - Transaction categorization
   - Account synchronization
   - Balance reconciliation

4. **Add Testing**
   - Unit tests for services
   - Integration tests
   - Database tests

## 📊 Proposed Enhancements

### Data Model Improvements
- Add `categories` table for transaction classification
- Add `institutions` table for bank/card provider info
- Add `budgets` table for spending limits
- Add audit fields (created_at, updated_at)
- Add soft delete functionality

### Security Enhancements
- Implement encrypted storage for sensitive data
- Add API key management
- Implement rate limiting
- Add audit logging

### Performance Optimizations
- Database indexing strategy
- Connection pooling
- Caching layer
- Background job processing

## 🛠️ Development Setup

### Prerequisites
- Rust (latest stable)
- PostgreSQL
- Diesel CLI

### Getting Started
1. Clone the repository
2. Run `./scripts/setup_database.sh` to initialize the database
3. Run `cargo run` to start the application

### Database Management
- Setup: `./scripts/setup_database.sh`
- Cleanup: `./scripts/delete_database.sh`
- Migrations: `diesel migration run`

## 📝 Contributing

### Code Standards
- Follow Rust naming conventions
- Add documentation for public functions
- Write tests for new features
- Use proper error handling

### Git Workflow
- Feature branches for new development
- Pull requests for code review
- Conventional commit messages

## 🔐 Security Considerations

- Never commit database credentials
- Use environment variables for sensitive data
- Implement proper input validation
- Regular security audits
- Encrypted data at rest

## 📋 License
[Add your chosen license here]
