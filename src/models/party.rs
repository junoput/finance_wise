use diesel::prelude::*;
use crate::schema::parties;

#[derive(Queryable, Insertable, Debug)]
#[table_name = "parties"]
pub struct Party {
    pub id: i32,
    pub name: String,
    pub phone: String,
    pub eban: String,
    pub address_id: i32,
}
