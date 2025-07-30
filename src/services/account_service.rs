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

pub fn get_accounts_by_party(conn: &mut PgConnection, account_party_id: i32) -> QueryResult<Vec<Account>> {
    accounts.filter(party_id.eq(account_party_id)).load(conn)
}

pub fn get_all_accounts(conn: &mut PgConnection) -> QueryResult<Vec<Account>> {
    accounts.load(conn)
}

pub fn update_balance(conn: &mut PgConnection, account_id: i32, new_balance: BigDecimal) -> QueryResult<usize> {
    diesel::update(accounts.filter(id.eq(account_id)))
        .set(balance.eq(new_balance))
        .execute(conn)
}

pub fn delete_account(conn: &mut PgConnection, account_id: i32) -> QueryResult<usize> {
    diesel::delete(accounts.filter(id.eq(account_id))).execute(conn)
}

pub fn account_exists(conn: &mut PgConnection, account_id: i32) -> QueryResult<bool> {
    use diesel::dsl::exists;
    use diesel::select;
    
    select(exists(accounts.filter(id.eq(account_id))))
        .get_result(conn)
}

pub fn get_total_balance_for_party(conn: &mut PgConnection, account_party_id: i32) -> QueryResult<BigDecimal> {
    use diesel::dsl::sum;
    
    accounts
        .filter(party_id.eq(account_party_id))
        .select(sum(balance))
        .first(conn)
        .map(|result: Option<BigDecimal>| result.unwrap_or_else(|| BigDecimal::from(0)))
}
