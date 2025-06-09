const db = require('../db');



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
      user_type, f_name, l_name, email, phone, password,
      date_user_creat, user_is_admin, user_is_actif, user_is_registered
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9)
    RETURNING _id_user
  `;

  const values = [
    user.user_type, user.f_name, user.l_name, user.email, user.phone,
    user.password, user.user_is_admin, user.user_is_actif, user.user_is_registered
  ];

  try {
    const result = await db.query(query, values);
    return result.rows[0]._id_user;
  } catch (err) {
    if (err.code === '23505') { // PostgreSQL: violation de contrainte unique
      throw new Error('EMAIL_EXISTS');
    }
    throw err;
  }
};

const registerUser = async (userId, email) => {
  const query = `
    UPDATE users
    SET user_is_registered = TRUE
    WHERE _id_user = $1 AND email = $2
  `;
  return await db.query(query, [userId, email]);
};



const getUserByEmail = async (email) => {
  const query = `
    SELECT * FROM users
    WHERE email = $1
  `;
  const result = await db.query(query, [email]);
  return result.rows[0]; // null si pas trouvé
};

const updatePassword = async (email, newPassword) => {
    const query = `UPDATE users SET password = $1 WHERE email = $2`;
    const values = [newPassword, email];
    const result = await db.query(query, values);
    return result.rowCount > 0;
};

//Methode qui permet de recuperrer les parametres d'un utilisateur pour lui envoyer un email
//on execute cette requete
//SELECT  user.email, user._id_user, object.description, object.date_creation FROM object, user WHERE object.id_user = user._id_user AND object.id = ?

//async function getUsersAndObjectsByObjectIds(ids) {  'est une autre facon d'ecrire getUsersAndObjectsByObjectIds
   const getUsersAndObjectsByObjectIds = async(ids) =>{
     const results = [];

     for (const id of ids) {
       const query = `
         SELECT 
           o._id_user AS "O_ID",
           o.object_description AS "O_DESC",
           o.object_creat_date AS "O_DATE_CREAT",
           u._id_user AS "U_ID",
           u.email AS "U_EMAIL"
         FROM object o
         JOIN users u ON o._id_user = u._id_user
         WHERE o._id_object = ANY($1)
       `;
       const { rows } = await db.query(query, [id]);
       if (rows.length > 0) {
         results.push(rows[0]);
       }
     }
   }

  const getDeviceTokenByUserId = async (userId) => {
     const query = `SELECT user_device_token FROM users WHERE _id_user = $1`;
     const result = await db.query(query, [userId]);

     if (result.rows.length === 0) return null;
     return result.rows[0].user_device_token;
  };

// 🔄 Mise à jour d’un utilisateur
   const updateUser = async (id, userData) => {
     const query = `
       UPDATE users SET
         user_type = $1,
         user_fname = $2,
         user_lname = $3,
         user_email = $4,
         user_phone = $5,
         user_password = $6,
         user_isactif = $7,
         user_isadmin = $8
       WHERE _id_user = $9
       RETURNING *;
     `;
     const values = [
       userData.user_type,
       userData.user_fname,
       userData.user_lname,
       userData.user_email,
       userData.user_phone,
       userData.user_password,
       userData.user_isactif,
       userData.user_isadmin,
       id
     ];
     const result = await db.query(query, values);
     return result.rows[0];
   };

   // 🗑️ Supprimer un utilisateur
   const deleteUser = async (id) => {
     const query = `DELETE FROM users WHERE _id_user = $1`;
     await db.query(query, [id]);
   };

   async function getAllUsers() {
     const query = `SELECT * FROM users ORDER BY id ASC`;
     const result = await db.query(query);
     return result.rows;
   }


module.exports = {
   updateLastConnexion,
   updateDeviceToken, 
   createUser,
   registerUser,
   getUserByEmail,
   updatePassword,
   getUsersAndObjectsByObjectIds,
   getDeviceTokenByUserId,
   updateUser,
   deleteUser,
   getAllUsers,
};

