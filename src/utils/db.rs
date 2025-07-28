use diesel::pg::PgConnection;
use diesel::r2d2::{ConnectionManager, Pool, PoolError, PooledConnection};
use diesel::Connection;
use std::env;
use std::fs;
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

/// Reads the database credentials from a key file and constructs the DATABASE_URL.
pub fn get_database_url() -> Result<String, Box<dyn std::error::Error>> {
    // Check if the DATABASE_KEYFILE environment variable is set
    if let Ok(keyfile_path) = env::var("DATABASE_KEYFILE") {
        // Read the key file
        let keyfile_content = fs::read_to_string(keyfile_path)
            .map_err(|e| format!("Failed to read key file: {}", e))?;

        // Parse the username and password from the key file
        let mut username = String::new();
        let mut password = String::new();

        for line in keyfile_content.lines() {
            if line.starts_with("username=") {
                username = line.replace("username=", "");
            } else if line.starts_with("password=") {
                password = line.replace("password=", "");
            }
        }

        // Construct the DATABASE_URL
        return Ok(format!("postgres://{}:{}@localhost/finance_wise", username, password));
    }

    // Fallback to the DATABASE_URL environment variable
    env::var("DATABASE_URL")
        .map_err(|_| "DATABASE_URL must be set or DATABASE_KEYFILE must be provided".into())
}

/// Establishes a connection to the database.
///
/// # Returns
/// A `PgConnection` instance.
pub fn establish_connection() -> PgConnection {
    let database_url = get_database_url().expect("Failed to get database URL");
    PgConnection::establish(&database_url).expect("Error connecting to the database")
}
