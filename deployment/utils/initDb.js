// utils/initDb.js
const db = require('../db');
const { SQL_CREATE_TABLE_USER, SQL_CREATE_TABLE_OBJECT, SQL_CREATE_TABLE_IMG_OBJECT } = require('../constants/sql');

async function initDatabaseSchema() {
  try {
    await db.query(SQL_CREATE_TABLE_USER);
    console.log('✔️ Table "users" créée ou déjà existante');

    await db.query(SQL_CREATE_TABLE_OBJECT);
    console.log('✔️ Table "object" créée ou déjà existante');

    await db.query(SQL_CREATE_TABLE_IMG_OBJECT);
    console.log('✔️ Table "image_object" créée ou déjà existante');
    
    return { success: true };
  } catch (err) {
    console.error('Erreur création de la base :', err);
    throw err;
  }
}

module.exports = { initDatabaseSchema };
