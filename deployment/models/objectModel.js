const db = require('../db');

// Créer un objet
const insertObject = async (object) => {
  const query = `
    INSERT INTO objects (
      id_user, object_type, description, address, city, zipcode, country,
      dateObject, timeObject, isActif, isLost, isFound, latitude, longitude
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
  return result.rows[0]._id_object;
};

// Lire tous les objets
const getAllObjects = async () => {
  const query = `SELECT * FROM objects ORDER BY createDate DESC`;
  const result = await db.query(query);
  return result.rows;
};

// Lire un objet par ID
const getObjectById = async (id) => {
  const query = `SELECT * FROM objects WHERE _id_object = $1`;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

// Mettre à jour un objet
const updateObject = async (id, newData) => {
  const query = `
    UPDATE objects SET
      object_type = $1,
      description = $2,
      address = $3,
      city = $4,
      zipcode = $5,
      country = $6,
      dateObject = $7,
      timeObject = $8,
      isActif = $9,
      isLost = $10,
      isFound = $11,
      latitude = $12,
      longitude = $13,
      modifDate = NOW()
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
  const query = `DELETE FROM objects WHERE _id_object = $1`;
  await db.query(query, [id]);
};

// Objets filtrés temporellement
const getObjectsFilteredByTime = async (currentObjectId, objectType, objDate, isLost, isFound) => {
  const delta = 5;
  const date = new Date(objDate);

  const fromDate = new Date(date);
  fromDate.setDate(date.getDate() - delta);
  const toDate = new Date(date);
  toDate.setDate(date.getDate() + delta);

  const query = `
    SELECT * FROM objects
    WHERE _id_object != $1
      AND object_type = $2
      AND isLost = $3
      AND isFound = $4
      AND isActif = TRUE
      AND dateObject BETWEEN $5 AND $6
  `;

  const values = [
    currentObjectId,
    objectType,
    isLost,
    isFound,
    fromDate.toISOString().split('T')[0],
    toDate.toISOString().split('T')[0]
  ];

  const result = await db.query(query, values);
  return result.rows;
};

module.exports = {
  insertObject,
  getAllObjects,
  getObjectById,
  updateObject,
  deleteObject,
  getObjectsFilteredByTime,
};

