use diesel::prelude::*;
use crate::schema::transactions;
use chrono::NaiveDateTime;
use bigdecimal::BigDecimal;

#[derive(Queryable, Debug)]
pub struct Transaction {
    pub id: i32,
    pub amount: BigDecimal,
    pub from_party_id: i32,
    pub to_party_id: i32,
    pub date: NaiveDateTime,
}

#[derive(Insertable, Debug)]
#[diesel(table_name = transactions)]
pub struct NewTransaction {
    pub amount: BigDecimal,
    pub from_party_id: i32,
    pub to_party_id: i32,
    pub date: NaiveDateTime,
}
