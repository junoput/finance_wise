use diesel::prelude::*;
use crate::models::transaction::{Transaction, NewTransaction};
use crate::schema::transactions::dsl::*;
use chrono::NaiveDateTime;
use bigdecimal::BigDecimal;

pub fn create_transaction(
    conn: &mut PgConnection,
    new_amount: BigDecimal,
    from_id: i32,
    to_id: i32,
    transaction_date: NaiveDateTime,
) -> QueryResult<Transaction> {
    use crate::schema::transactions;

    let new_transaction = NewTransaction {
        amount: new_amount,
        from_party_id: from_id,
        to_party_id: to_id,
        date: transaction_date,
    };

    diesel::insert_into(transactions::table)
        .values(&new_transaction)
        .get_result(conn)
}

pub fn get_transaction_by_id(conn: &mut PgConnection, transaction_id: i32) -> QueryResult<Transaction> {
    transactions.filter(id.eq(transaction_id)).first(conn)
}

pub fn delete_transaction(conn: &mut PgConnection, transaction_id: i32) -> QueryResult<usize> {
    diesel::delete(transactions.filter(id.eq(transaction_id))).execute(conn)
}
