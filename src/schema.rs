// @generated automatically by Diesel CLI.

diesel::table! {
    accounts (id) {
        id -> Int4,
        party_id -> Int4,
        balance -> Numeric,
    }
}

diesel::table! {
    parties (id) {
        id -> Int4,
        name -> Text,
        phone -> Text,
        eban -> Text,
        address_id -> Int4,
    }
}

diesel::table! {
    receipts (id) {
        id -> Int4,
        payment_method -> Text,
        party_id -> Int4,
        date -> Text,
        time -> Text,
        items -> Array<Text>,
    }
}

diesel::table! {
    transactions (id) {
        id -> Int4,
        amount -> Numeric,
        from_party_id -> Int4,
        to_party_id -> Int4,
        date -> Timestamp,
    }
}

diesel::joinable!(accounts -> parties (party_id));
diesel::joinable!(receipts -> parties (party_id));
diesel::joinable!(transactions -> parties (from_party_id));

diesel::allow_tables_to_appear_in_same_query!(
    accounts,
    parties,
    receipts,
    transactions,
);
