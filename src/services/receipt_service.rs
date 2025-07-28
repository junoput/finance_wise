use diesel::prelude::*;
use crate::models::receipt::{Receipt, NewReceipt};
use crate::schema::receipts::dsl::*;

pub fn create_receipt(
    conn: &mut PgConnection,
    new_payment_method: &str,
    new_party_id: i32,
    new_date: &str,
    new_time: &str,
    new_items: Vec<String>,
) -> QueryResult<Receipt> {
    use crate::schema::receipts;

    let new_receipt = NewReceipt {
        payment_method: new_payment_method.to_string(),
        party_id: new_party_id,
        date: new_date.to_string(),
        time: new_time.to_string(),
        items: new_items,
    };

    diesel::insert_into(receipts::table)
        .values(&new_receipt)
        .get_result(conn)
}

pub fn get_receipt_by_id(conn: &mut PgConnection, receipt_id: i32) -> QueryResult<Receipt> {
    receipts.filter(id.eq(receipt_id)).first(conn)
}

pub fn delete_receipt(conn: &mut PgConnection, receipt_id: i32) -> QueryResult<usize> {
    diesel::delete(receipts.filter(id.eq(receipt_id))).execute(conn)
}
