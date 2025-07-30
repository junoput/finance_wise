use diesel::pg::PgConnection;
use diesel::r2d2::{ConnectionManager, Pool, PoolError, PooledConnection};
use diesel::Connection;
use std::env;
use std::fs;
use std::path::PathBuf;
use crate::config::DatabaseConfig;

pub type DbPool = Pool<ConnectionManager<PgConnection>>;
pub type DbConnection = PooledConnection<ConnectionManager<PgConnection>>;

pub struct DatabasePool {
    pool: DbPool,
}

impl DatabasePool {
    pub fn new(config: &DatabaseConfig) -> Result<Self, PoolError> {
        let manager = ConnectionManager::<PgConnection>::new(&config.url);
        let pool = Pool::builder()
            .max_size(config.pool_size)
            .build(manager)?;
        
        Ok(DatabasePool { pool })
    }
    
    pub fn get_connection(&self) -> Result<DbConnection, PoolError> {
        self.pool.get()
    }
}

/// Gets the secure FinWise data directory in the user's home folder
pub fn get_finwise_data_dir() -> Result<PathBuf, Box<dyn std::error::Error>> {
    if let Some(home_dir) = dirs::home_dir() {
        let finwise_dir = home_dir.join("FinWise");
        
        // Create the directory if it doesn't exist
        if !finwise_dir.exists() {
            fs::create_dir_all(&finwise_dir)
                .map_err(|e| format!("Failed to create FinWise directory: {}", e))?;
        }
        
        Ok(finwise_dir)
    } else {
        Err("Could not determine home directory".into())
    }
}

/// Gets the path to the secure keyfile in the FinWise data directory
pub fn get_secure_keyfile_path() -> Result<PathBuf, Box<dyn std::error::Error>> {
    let finwise_dir = get_finwise_data_dir()?;
    Ok(finwise_dir.join(".finwise_db_credentials"))
}

/// Reads the database credentials from a key file and constructs the DATABASE_URL.
pub fn get_database_url() -> Result<String, Box<dyn std::error::Error>> {
    // First, try to use the secure keyfile in the home directory
    if let Ok(secure_keyfile_path) = get_secure_keyfile_path() {
        if secure_keyfile_path.exists() {
            return read_keyfile_and_construct_url(secure_keyfile_path.to_string_lossy().to_string());
        }
    }
    
    // Check if the DATABASE_KEYFILE environment variable is set
    if let Ok(keyfile_path) = env::var("DATABASE_KEYFILE") {
        return read_keyfile_and_construct_url(keyfile_path);
    }

    // Check for legacy keyfile in project directory (for migration)
    let legacy_keyfile = "db_keyfile";
    if std::path::Path::new(legacy_keyfile).exists() {
        eprintln!("WARNING: Found legacy keyfile '{}' in project directory.", legacy_keyfile);
        eprintln!("Please run 'cargo run -- setup-db' to migrate to secure storage.");
        return read_keyfile_and_construct_url(legacy_keyfile.to_string());
    }

    // Fallback to the DATABASE_URL environment variable
    env::var("DATABASE_URL")
        .map_err(|_| "DATABASE_URL must be set, or run 'cargo run -- setup-db' to configure secure database credentials".into())
}

/// Reads a keyfile and constructs the database URL
fn read_keyfile_and_construct_url(keyfile_path: String) -> Result<String, Box<dyn std::error::Error>> {
    // Read the key file
    let keyfile_content = fs::read_to_string(&keyfile_path)
        .map_err(|e| format!("Failed to read key file '{}': {}", keyfile_path, e))?;

    // Parse the username and password from the key file
    let mut username = String::new();
    let mut password = String::new();

    for line in keyfile_content.lines() {
        let line = line.trim();
        if line.starts_with("username=") {
            username = line.replace("username=", "");
        } else if line.starts_with("password=") {
            password = line.replace("password=", "");
        }
    }

    if username.is_empty() || password.is_empty() {
        return Err(format!("Invalid keyfile format in '{}'. Expected 'username=' and 'password=' lines.", keyfile_path).into());
    }

    // Construct the DATABASE_URL
    Ok(format!("postgres://{}:{}@localhost/finance_wise", username, password))
}

/// Establishes a connection to the database.
///
/// # Returns
/// A `PgConnection` instance.
pub fn establish_connection() -> PgConnection {
    let database_url = get_database_url().expect("Failed to get database URL");
    PgConnection::establish(&database_url).expect("Error connecting to the database")
}
