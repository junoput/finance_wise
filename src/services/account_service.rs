use diesel::prelude::*;
use crate::models::account::Account;
use crate::schema::accounts::dsl::*;

pub fn create_account(conn: &PgConnection, new_party_id: i32, initial_balance: f64) -> QueryResult<Account> {
    use crate::schema::accounts;

    let new_account = Account {
        id: 0, // Auto-incremented by the database
        party_id: new_party_id,
        balance: initial_balance,
    };

    diesel::insert_into(accounts::table)
        .values(&new_account)
        .get_result(conn)
}

pub fn get_account_by_id(conn: &PgConnection, account_id: i32) -> QueryResult<Account> {
    accounts.filter(id.eq(account_id)).first(conn)
}

pub fn update_account_balance(conn: &PgConnection, account_id: i32, new_balance: f64) -> QueryResult<usize> {
    diesel::update(accounts.filter(id.eq(account_id)))
        .set(balance.eq(new_balance))
        .execute(conn)
}

pub fn delete_account(conn: &PgConnection, account_id: i32) -> QueryResult<usize> {
    diesel::delete(accounts.filter(id.eq(account_id))).execute(conn)
}
