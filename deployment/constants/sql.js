// constants/sql.js

const SQL_CREATE_TABLE_USER = `
  CREATE TABLE IF NOT EXISTS users (
    _id_user SERIAL PRIMARY KEY,
    user_type TEXT,
    f_name TEXT,
    l_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    password TEXT,
    date_user_creat TIMESTAMPTZ,
    date_connexion TIMESTAMPTZ,
    user_is_actif BOOLEAN,
    user_is_admin BOOLEAN,
    user_is_registered BOOLEAN,
    user_device_token VARCHAR(255)
  );
`;

const SQL_CREATE_TABLE_OBJECT = `
  CREATE TABLE IF NOT EXISTS object (
    _id_object SERIAL PRIMARY KEY,
    _id_user SERIAL,
    object_type TEXT,
    object_description TEXT,
    object_address TEXT,
    object_city TEXT,
    object_zipcode TEXT,
    object_country TEXT,
    object_longitude DOUBLE PRECISION,
    object_latitude DOUBLE PRECISION,
    object_date DATE,
    object_time TEXT,
    object_creat_date TIMESTAMPTZ,
    object_modif_date TIMESTAMPTZ,
    object_is_lost BOOLEAN,
    object_is_found BOOLEAN,
    object_is_actif BOOLEAN,
    CONSTRAINT fk_user FOREIGN KEY(_id_user) REFERENCES users(_id_user) ON DELETE CASCADE
  );
`;

const SQL_CREATE_TABLE_IMG_OBJECT = `
  CREATE TABLE IF NOT EXISTS image_object (
    _id_imgObject SERIAL PRIMARY KEY,
    imgObject_name TEXT,
    imgObject_pHash VARCHAR(64),
    _id_object SERIAL,
    CONSTRAINT fk_object FOREIGN KEY(_id_object) REFERENCES object(_id_object) ON DELETE CASCADE
  );
`;

module.exports = {
  SQL_CREATE_TABLE_USER,
  SQL_CREATE_TABLE_OBJECT,
  SQL_CREATE_TABLE_IMG_OBJECT,
};

