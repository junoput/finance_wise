use chrono::{DateTime, Local, Utc};

enum PaymentMethod {
    Cash,
    CreditCard,
    DebitCard,
    Check,
    WireTransfer
}

struct Address {
    id: u32,
    street: String,
    city: String,
    state: String,
    zip: String,
}

struct Entity {
    id: u32,
    address: Address,
    phone: String,
    eban: String,
    name: String,
}

struct Transaction {
    id: u32,
    amount: f64,
    from: Entity,
    to: Entity,
    date: DateTime<Utc>,
    receipts: Vec<Receipt>,
}

struct Receipt {
    id: u32,
    payment_method: PaymentMethod,
    entity: Entity,
    date: String,
    time: String,
    items: Vec<String>,
}

struct Account {
    id: u32,
    entity: Entity,
    balance: f64,
    transactions: Vec<Transaction>,
    receipts: Vec<Receipt>,
}

impl Account {
    fn new(id: u32, entity: Entity, balance: f64) -> Account {
        Account {
            id,
            entity,
            balance,
            transactions: Vec::new(),
            receipts: Vec::new(),
        }
    }

    fn add_transaction(&mut self, transaction: Transaction) {
        self.transactions.push(transaction);
    }

    fn create_transaction(&mut self, amount: f64, from: Entity, to: Entity) {
        let transaction = Transaction {
            id: self.transactions.len() as u32 + 1,
            amount,
            from,
            to,
            date: Utc::now(),
            receipts: Vec::new(),
        };
        self.add_transaction(transaction);
    }

    fn add_receipt(&mut self, receipt: Receipt) {
        self.receipts.push(receipt);
    }
}
