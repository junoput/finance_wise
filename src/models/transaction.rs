use diesel::prelude::*;
use crate::schema::transactions;
use chrono::NaiveDateTime;

#[derive(Queryable, Insertable, Debug)]
#[table_name = "transactions"]
pub struct Transaction {
    pub id: i32,
    pub amount: f64,
    pub from_party_id: i32,
    pub to_party_id: i32,
    pub date: NaiveDateTime,
}
