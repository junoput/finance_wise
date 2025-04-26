
use crate::account::Account;

struct Finance {
    accounts: Vec<Account>,
}

impl Finance {
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
        let deserialized: Finance = serde_json::from_str(&contents).unwrap();
        Ok(deserialized)
    }

    fn add_account(&mut self, account: Account) {
        self.accounts.push(account);
    }

    fn create_account(&mut self, entity: Entity, balance: f64) {
        let account = Account::new(self.accounts.len() as u32 + 1, entity, balance);
        self.add_account(account);
    }

    fn list_accounts(&self) {
        
    }
}
