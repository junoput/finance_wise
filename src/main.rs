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
    // Load configuration from environment variables
    dotenv::dotenv().ok();
    let config = Config::from_env()?;
    
    // Initialize logging
    init_logging(&config.logging)?;
    
    // Parse CLI arguments first (before database connection)
    let matches = App::new("FinWise")
        .version("0.1.0")
        .about("Personal Finance Management System")
        .subcommand(SubCommand::with_name("setup-db")
            .about("Set up secure database credentials in home directory"))
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
        ("setup-db", Some(_)) => {
            cli::commands::setup_database().await?;
        },
        ("server", Some(_)) => {
            // Initialize database pool only when needed
            let db_pool = Arc::new(DatabasePool::new(&config.database)?);
            cli::commands::start_server(config, db_pool).await?;
        },
        ("import", Some(sub_m)) => {
            // Initialize database pool only when needed
            let db_pool = Arc::new(DatabasePool::new(&config.database)?);
            let file_path = sub_m.value_of("file").unwrap();
            cli::commands::import_data(file_path, db_pool).await?;
        },
        ("sync", Some(_)) => {
            // Initialize database pool only when needed
            let db_pool = Arc::new(DatabasePool::new(&config.database)?);
            cli::commands::sync_accounts(db_pool).await?;
        },
        ("report", Some(sub_m)) => {
            // Initialize database pool only when needed
            let db_pool = Arc::new(DatabasePool::new(&config.database)?);
            let report_type = sub_m.value_of("type").unwrap();
            cli::commands::generate_report(report_type, db_pool).await?;
        },
        _ => {
            println!("FinWise - Personal Finance Management System");
            println!("Use --help for available commands");
            println!();
            println!("Available commands:");
            println!("  setup-db        Set up secure database credentials");
            println!("  server          Start the web server");
            println!("  import -f FILE  Import financial data from file");
            println!("  sync            Sync accounts with banks");
            println!("  report -t TYPE  Generate reports (summary, transactions, categories)");
            println!();
            println!("🔐 Security Note: Run 'setup-db' first to store database credentials securely in ~/FinWise/");
        }
    }

    Ok(())
}

fn init_logging(config: &config::LoggingConfig) -> Result<(), Box<dyn std::error::Error>> {
    use log::LevelFilter;
    use env_logger::Builder;

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
