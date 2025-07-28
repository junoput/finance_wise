use diesel::prelude::*;
use crate::schema::parties;

#[derive(Queryable, Debug)]
pub struct Party {
    pub id: i32,
    pub name: String,
    pub phone: String,
    pub eban: String,
    pub address_id: i32,
}

#[derive(Insertable, Debug)]
#[diesel(table_name = parties)]
pub struct NewParty {
    pub name: String,
    pub phone: String,
    pub eban: String,
    pub address_id: i32,
}
