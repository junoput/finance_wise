use diesel::prelude::*;
use crate::schema::accounts;
use bigdecimal::BigDecimal;

#[derive(Queryable, Debug)]
pub struct Account {
    pub id: i32,
    pub party_id: i32,
    pub balance: BigDecimal,
}

#[derive(Insertable, Debug)]
#[diesel(table_name = accounts)]
pub struct NewAccount {
    pub party_id: i32,
    pub balance: BigDecimal,
}
