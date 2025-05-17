const db = require('../db');

const getUserByEmail = async (email) => {
  const query = `
    SELECT * FROM users
    WHERE email = $1
  `;
  const result = await db.query(query, [email]);
  return result.rows[0]; // null si pas trouvé
};

const updateLastConnexion = async (userId) => {
  const query = `
    UPDATE users SET date_connexion = NOW()
    WHERE _id_user = $1
  `;
  await db.query(query, [userId]);
};

module.exports = {
  getUserByEmail,
  updateLastConnexion,
};

