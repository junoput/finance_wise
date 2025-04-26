use diesel::prelude::*;
use crate::schema::receipts;

#[derive(Queryable, Insertable, Debug)]
#[table_name = "receipts"]
pub struct Receipt {
    pub id: i32,
    pub payment_method: String,
    pub party_id: i32,
    pub date: String,
    pub time: String,
    pub items: Vec<String>,
}
