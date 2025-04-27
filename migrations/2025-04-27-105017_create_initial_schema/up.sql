-- Create the parties table
CREATE TABLE parties (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    eban TEXT NOT NULL,
    address_id INTEGER NOT NULL
);

-- Create the accounts table
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    party_id INTEGER NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    balance NUMERIC NOT NULL
);

-- Create the transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    amount NUMERIC NOT NULL,
    from_party_id INTEGER NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    to_party_id INTEGER NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL
);

-- Create the receipts table
CREATE TABLE receipts (
    id SERIAL PRIMARY KEY,
    payment_method TEXT NOT NULL,
    party_id INTEGER NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    items TEXT[] NOT NULL
);
