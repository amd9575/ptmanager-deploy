// models/notificationModel.js
const db = require('../db');

const insertNotification = async ({ userId, email, message, objectId, isManaged }) => {
  const query = `
    INSERT INTO notification (
      _id_user, email, notif_message, _id_object, notif_is_managed
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING _id_notif
  `;

  const values = [userId, email, message, objectId, isManaged];

  const result = await db.query(query, values);
  return result.rows[0]._id_notif;
};

const getDeviceToken = async (userId) => {
  const query = `SELECT user_device_token FROM users WHERE _id_user = $1`;
  const result = await db.query(query, [userId]);
  return result.rows.length > 0 ? result.rows[0].user_device_token : null;
};

// 👇 AJOUTE CETTE NOUVELLE FONCTION
const updateDeviceToken = async (userId, deviceToken) => {
  const query = `UPDATE users SET user_device_token = $1 WHERE _id_user = $2 RETURNING _id_user`;
  const result = await db.query(query, [deviceToken, userId]);
  
  if (result.rows.length === 0) {
    throw new Error('Utilisateur non trouvé');
  }
  
  return result.rows[0];
};

module.exports = { 
   insertNotification, 
   getDeviceToken,
   updateDeviceToken,
};

