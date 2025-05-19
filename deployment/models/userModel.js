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

const updateDeviceToken = async (userId, deviceToken) => {
  const query = `
    UPDATE users
    SET user_device_token = $1
    WHERE _id_user = $2
  `;
  const result = await db.query(query, [deviceToken, userId]);
  return result.rowCount;
};

const createUser = async (user) => {
  const query = `
    INSERT INTO users (
      user_type,
      f_name,
      l_name,
      email,
      phone,
      password,
      date_user_creat,
      user_is_admin,
      user_is_actif,
      user_is_registered
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9)
    RETURNING _id_user
  `;

  const values = [
    user.user_type,
    user.f_name,
    user.l_name,
    user.email,
    user.phone,
    user.password, // déjà hashé
    user.user_is_admin,
    user.user_is_actif,
    user.user_is_registered
  ];

  const result = await db.query(query, values);
  return result.rows[0]._id_user;
};


module.exports = {
  getUserByEmail,
  updateLastConnexion,
  updateDeviceToken, 
  createUser,
};

