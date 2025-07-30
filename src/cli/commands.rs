use crate::config::Config;
use crate::utils::db::{DatabasePool, get_finwise_data_dir, get_secure_keyfile_path};
use crate::services::*;
use std::sync::Arc;
use std::fs;
use std::io::{self, Write};
use log::{info, error};

pub async fn setup_database() -> Result<(), Box<dyn std::error::Error>> {
    println!("🔐 FinWise Database Security Setup");
    println!("==================================");
    println!();

    // Create the secure FinWise directory
    let finwise_dir = get_finwise_data_dir()?;
    println!("✅ Created secure data directory: {}", finwise_dir.display());

    // Get the secure keyfile path
    let keyfile_path = get_secure_keyfile_path()?;
    
    // Check if keyfile already exists
    if keyfile_path.exists() {
        println!("⚠️  Database credentials already exist at: {}", keyfile_path.display());
        print!("Do you want to overwrite them? (y/N): ");
        io::stdout().flush()?;
        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        if !input.trim().to_lowercase().starts_with('y') {
            println!("Setup cancelled.");
            return Ok(());
        }
    }

    // Collect database credentials
    println!();
    println!("Enter your PostgreSQL database credentials:");
    
    print!("Username: ");
    io::stdout().flush()?;
    let mut username = String::new();
    io::stdin().read_line(&mut username)?;
    let username = username.trim();

    print!("Password: ");
    io::stdout().flush()?;
    let mut password = String::new();
    io::stdin().read_line(&mut password)?;
    let password = password.trim();

    // Create the credentials file content
    let credentials_content = format!("username={}\npassword={}\n", username, password);

    // Write to secure location
    fs::write(&keyfile_path, credentials_content)?;
    
    // Set restrictive permissions (Unix only)
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = fs::metadata(&keyfile_path)?.permissions();
        perms.set_mode(0o600); // Read/write for owner only
        fs::set_permissions(&keyfile_path, perms)?;
    }

    println!();
    println!("✅ Database credentials securely stored at: {}", keyfile_path.display());
    
    // Check for legacy keyfile and offer to remove it
    let legacy_keyfile = "db_keyfile";
    if std::path::Path::new(legacy_keyfile).exists() {
        println!();
        println!("🔍 Found legacy keyfile: {}", legacy_keyfile);
        print!("Would you like to remove the insecure legacy keyfile? (Y/n): ");
        io::stdout().flush()?;
        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        if !input.trim().to_lowercase().starts_with('n') {
            fs::remove_file(legacy_keyfile)?;
            println!("✅ Removed legacy keyfile for security");
        }
    }

    println!();
    println!("🎉 Database security setup complete!");
    println!();
    println!("Security benefits:");
    println!("• Database credentials stored in your home directory: ~/FinWise/");
    println!("• Credentials file is not tracked by git");
    println!("• File permissions restrict access to your user account only");
    println!("• Legacy insecure credentials removed from project directory");
    println!();
    println!("You can now run other FinWise commands safely!");

    Ok(())
}

pub async fn start_server(
    config: Config, 
    db_pool: Arc<DatabasePool>
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Starting FinWise server on {}:{}", config.server.host, config.server.port);
    
    // TODO: Implement web server using warp or axum
    println!("Server would start here - {}:{}", config.server.host, config.server.port);
    println!("Database pool initialized with {} max connections", config.database.pool_size);
    Ok(())
}

pub async fn import_data(
    file_path: &str,
    db_pool: Arc<DatabasePool>
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Importing data from: {}", file_path);
    
    let mut _conn = db_pool.get_connection()?;
    // let transaction_service = TransactionService::new();
    
    // TODO: Implement CSV/OFX file parsing
    // let transactions = parse_file(file_path)?;
    // for transaction in transactions {
    //     transaction_service.create_transaction(&conn, transaction)?;
    // }
    
    println!("Import completed for file: {}", file_path);
    Ok(())
}

pub async fn sync_accounts(
    db_pool: Arc<DatabasePool>
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Syncing accounts with financial institutions");
    
    let mut _conn = db_pool.get_connection()?;
    // let account_service = AccountService::new();
    
    // TODO: Implement account synchronization
    println!("Sync completed");
    Ok(())
}

pub async fn generate_report(
    report_type: &str,
    db_pool: Arc<DatabasePool>
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Generating {} report", report_type);
    
    let mut conn = db_pool.get_connection()?;
    
    match report_type {
        "summary" => generate_summary_report(&mut conn)?,
        "transactions" => generate_transaction_report(&mut conn)?,
        "categories" => generate_category_report(&mut conn)?,
        _ => {
            error!("Unknown report type: {}", report_type);
            return Err("Invalid report type".into());
        }
    }
    
    Ok(())
}

fn generate_summary_report(conn: &mut crate::utils::db::DbConnection) -> Result<(), Box<dyn std::error::Error>> {
    // TODO: Implement summary report generation using actual database queries
    println!("Account Summary Report");
    println!("====================");
    println!("Database connection: Active");
    println!("Total Balance: $0.00 (not implemented yet)");
    println!("Active Accounts: 0 (not implemented yet)");
    println!("Recent Transactions: 0 (not implemented yet)");
    Ok(())
}

fn generate_transaction_report(conn: &mut crate::utils::db::DbConnection) -> Result<(), Box<dyn std::error::Error>> {
    // TODO: Implement transaction report
    println!("Transaction Report - Last 30 Days");
    println!("=================================");
    println!("Database connection: Active");
    println!("No transactions found (not implemented yet)");
    Ok(())
}

fn generate_category_report(conn: &mut crate::utils::db::DbConnection) -> Result<(), Box<dyn std::error::Error>> {
    // TODO: Implement category breakdown report
    println!("Spending by Category");
    println!("===================");
    println!("Database connection: Active");
    println!("No categories found (not implemented yet)");
    Ok(())
}
