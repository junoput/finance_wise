use diesel::pg::PgConnection;
use diesel::Connection;
use std::env;
use std::fs;

/// Reads the database credentials from a key file and constructs the DATABASE_URL.
fn get_database_url() -> String {
    // Check if the DATABASE_KEYFILE environment variable is set
    if let Ok(keyfile_path) = env::var("DATABASE_KEYFILE") {
        // Read the key file
        let keyfile_content = fs::read_to_string(keyfile_path).expect("Failed to read key file");

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
        return format!("postgres://{}:{}@localhost/finance_wise", username, password);
    }

    // Fallback to the DATABASE_URL environment variable
    env::var("DATABASE_URL").expect("DATABASE_URL must be set")
}

/// Establishes a connection to the database.
///
/// # Returns
/// A `PgConnection` instance.
pub fn establish_connection() -> PgConnection {
    let database_url = get_database_url();
    PgConnection::establish(&database_url).expect("Error connecting to the database")
}
