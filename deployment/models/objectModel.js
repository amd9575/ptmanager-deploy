const db = require('../db');
const { getImagesByObjectId } = require('./imgObjectModel');

// Créer un objet
const insertObject = async (object) => {
  const query = `
    INSERT INTO object (
      _id_user, object_type, object_description, object_address, object_city, object_zipcode, object_country,
      object_date, object_time, object_creat_date,  object_is_actif, object_is_lost, object_is_found, object_latitude, object_longitude
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10, $11, $12, $13, $14)
    RETURNING _id_object
  `;

  const values = [
    object.id_user,
    object.object_type,
    object.description,
    object.address,
    object.city,
    object.zipCode,
    object.country,
    object.dateObject,
    object.timeObject,
    object.isActif,
    object.isLost,
    object.isFound,
    object.latitude,
    object.longitude
  ];

  const result = await db.query(query, values);
 

  return result.rows[0]._id_object;;
};

// Lire tous les objets
//const getAllObjects = async () => {
//  const query = `SELECT * FROM object ORDER BY createDate DESC`;
//  const result = await db.query(query);
//  return result.rows;
//};


const getAllObjects = async () => {
  try {
    const query = `SELECT * FROM object ORDER BY createDate DESC`;
    const result = await db.query(query);
    const objects = result.rows;



    for (const obj of objects) {
      try {
        const imageQuery = `SELECT * FROM imgobject WHERE _id_object = ?`;
        const imageResult = await db.query(imageQuery, [obj._id_object]);
        obj.images = imageResult.rows || [];
      } catch (imgErr) {
        console.error(`Erreur chargement images pour objet ${obj._id_object}:`, imgErr);
        obj.images = []; // On évite le crash en mettant une liste vide
      }
    }

    return objects;

  } catch (err) {
    console.error('Erreur dans getAllObjects (model):', err);
    throw err; // à renvoyer au contrôleur
  }
};


// Lire un objet par ID
const getObjectById = async (id) => {
  const query = `SELECT * FROM object WHERE _id_object = $1`;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

// Mettre à jour un objet
const updateObject = async (id, newData) => {
  const query = `
    UPDATE object SET
      object_type = $1,
      object_description = $2,
      object_address = $3,
      object_city = $4,
      object_zipcode = $5,
      object_country = $6,
      object_date = $7,
      object_time = $8,
      object_is_actif = $9,
      object_is_lost = $10,
      object_is_found = $11,
      object_latitude = $12,
      object_longitude = $13,
      object_modif_date = NOW()
    WHERE _id_object = $14
    RETURNING *
  `;

  const values = [
    newData.object_type,
    newData.description,
    newData.address,
    newData.city,
    newData.zipCode,
    newData.country,
    newData.dateObject,
    newData.timeObject,
    newData.isActif,
    newData.isLost,
    newData.isFound,
    newData.latitude,
    newData.longitude,
    id
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

// Supprimer un objet
const deleteObject = async (id) => {
  const query = `DELETE FROM object WHERE _id_object = $1`;
  await db.query(query, [id]);
};

// Objets filtrés temporellement
const getObjectsFilteredByTime = async (currentObjectId, objectType, objDate, isLost, isFound) => {
  try {
    const delta = 30;
    const [day, month, year] = objDate.split('/');
    const date = new Date(`${year}-${month}-${day}`);

    const fromDate = new Date(date);
    fromDate.setDate(date.getDate() - delta);
    const toDate = new Date(date);
    toDate.setDate(date.getDate() + delta);

    const fromStr = fromDate.toISOString().split('T')[0];
    const toStr = toDate.toISOString().split('T')[0];

    const query = `
      SELECT * FROM object
      WHERE _id_object != $1
        AND object_type = $2
        AND object_is_lost = $3
        AND object_is_found = $4
        AND object_is_actif = TRUE
        AND object_date BETWEEN $5 AND $6
    `;

    const values = [
      currentObjectId,
      objectType,
      isLost,
      isFound,
      fromStr,
      toStr
    ];

    // LOG COMPLET
    console.log("///////////////////////////////////////////////////////////");
    console.log("Requête filtrée reçue avec :", {
      currentObjectId,
      objectType,
      objDate,
      isLost,
      isFound
    });
    console.log(">>> Dates from-to :");
    console.log("Filtrage avec dates :", { from: fromStr, to: toStr });
    console.log("La requête de recherche d'objets similaires :");
    console.log(query);
    console.log("Query values:", values);

    const result = await db.query(query, values);
    console.log(`📦 ${result.rows.length} objets filtrés trouvés-------------------------`);
    return result.rows;

  } catch (err) {
    console.error('Erreur dans getObjectsFilteredByTime (model):', err);
    throw err;
  }
};
const getObjectsByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
  const query = `SELECT * FROM object WHERE _id_object IN (${placeholders})`;

  const result = await db.query(query, ids);
  const objects = result.rows;

  // Pour chaque objet, on ajoute ses images
  for (const obj of objects) {
    const images = await getImagesByObjectId(obj._id_object);
    obj.images = images;
  }

  return objects;
};

const getObjectsByUser = async (userId) => {
  const query = `SELECT * FROM object WHERE _id_user = $1 ORDER BY object_creat_date DESC`;
  const result = await db.query(query, [userId]);
  
  const objects = result.rows;

  for (const obj of objects) {
    try {
      const imgQuery = `SELECT * FROM image_object WHERE _id_object = $1`;
      const imgResult = await db.query(imgQuery, [obj._id_object]);
      obj.images = imgResult.rows || [];
    } catch (imgErr) {
      console.error(`Erreur images pour objet ${obj._id_object}:`, imgErr);
      obj.images = [];
    }
  }

  return objects;
};


module.exports = {
  insertObject,
  getAllObjects,
  getObjectById,
  updateObject,
  deleteObject,
  getObjectsFilteredByTime,
  getObjectsByIds,
  getObjectsByUser,

};

