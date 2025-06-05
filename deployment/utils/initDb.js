// utils/initDb.js
const db = require('../db');
const { SQL_CREATE_TABLE_USER, SQL_CREATE_TABLE_OBJECT, SQL_CREATE_TABLE_IMG_OBJECT, SQL_CREATE_TABLE_NOTIFICATION } = require('../constants/sql');

async function initDatabaseSchema() {
  try {
    await db.query(SQL_CREATE_TABLE_USER);
    console.log('✔️ Table "users" créée ou déjà existante');

    await db.query(SQL_CREATE_TABLE_OBJECT);
    console.log('✔️ Table "object" créée ou déjà existante');

    await db.query(SQL_CREATE_TABLE_IMG_OBJECT);
    console.log('✔️ Table "image_object" créée ou déjà existante');
    
    await db.query(SQL_CREATE_TABLE_NOTIFICATION);
    console.log('✔️ Table "notification" créée ou déjà existante');
    
    return { success: true };
  } catch (err) {
    console.error('Erreur création de la base :', err);
    throw err;
  }
 
}

 // Si ce fichier est exécuté directement via `node utils/initDb.js`
  if (require.main === module) {
    initDatabaseSchema()
      .then(() => {
        console.log('✅ Base de données initialisée avec succès');
        process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Erreur lors de l\'initialisation de la base :', err);
      process.exit(1);
    });
  }

module.exports = { initDatabaseSchema };
