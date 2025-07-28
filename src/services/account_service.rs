use diesel::prelude::*;
use crate::models::account::{Account, NewAccount};
use crate::schema::accounts::dsl::*;
use bigdecimal::BigDecimal;

pub fn create_account(conn: &mut PgConnection, account_party_id: i32, initial_balance: BigDecimal) -> QueryResult<Account> {
    let new_account = NewAccount {
        party_id: account_party_id,
        balance: initial_balance,
    };

    diesel::insert_into(accounts)
        .values(&new_account)
        .get_result(conn)
}

pub fn get_account(conn: &mut PgConnection, account_id: i32) -> QueryResult<Account> {
    accounts.filter(id.eq(account_id)).first(conn)
}

pub fn update_balance(conn: &mut PgConnection, account_id: i32, new_balance: BigDecimal) -> QueryResult<usize> {
    diesel::update(accounts.filter(id.eq(account_id)))
        .set(balance.eq(new_balance))
        .execute(conn)
}

pub fn delete_account(conn: &mut PgConnection, account_id: i32) -> QueryResult<usize> {
    diesel::delete(accounts.filter(id.eq(account_id))).execute(conn)
}
