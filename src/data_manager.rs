use std::fs::File;
use std::io::{self, Read, Write};

struct DataManager {
    file: File,
}

impl DataManager {
    // Save the struct to a file
    fn save(&self, path: &str) -> io::Result<()> {
        let serialized = serde_json::to_string(self).unwrap();
        let mut file = File::create(path)?;
        file.write_all(serialized.as_bytes())?;
        Ok(())
    }

    // Load the struct from a file
    fn load(path: &str) -> io::Result<Self> {
        let mut file = File::open(path)?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;
        let deserialized: DataManager = serde_json::from_str(&contents).unwrap();
        Ok(deserialized)
    }
}
