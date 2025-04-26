use diesel::prelude::*;
use crate::schema::accounts;

#[derive(Queryable, Insertable, Debug)]
#[table_name = "accounts"]
pub struct Account {
    pub id: i32,
    pub party_id: i32,
    pub balance: f64,
}
