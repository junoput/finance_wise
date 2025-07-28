use diesel::prelude::*;
use crate::models::party::{Party, NewParty};
use crate::schema::parties::dsl::*;

pub fn create_party(conn: &mut PgConnection, new_name: &str, new_phone: &str, new_eban: &str, new_address_id: i32) -> QueryResult<Party> {
    use crate::schema::parties;

    let new_party = NewParty {
        name: new_name.to_string(),
        phone: new_phone.to_string(),
        eban: new_eban.to_string(),
        address_id: new_address_id,
    };

    diesel::insert_into(parties::table)
        .values(&new_party)
        .get_result(conn)
}

pub fn get_party_by_id(conn: &mut PgConnection, party_id: i32) -> QueryResult<Party> {
    parties.filter(id.eq(party_id)).first(conn)
}

pub fn delete_party(conn: &mut PgConnection, party_id: i32) -> QueryResult<usize> {
    diesel::delete(parties.filter(id.eq(party_id))).execute(conn)
}
