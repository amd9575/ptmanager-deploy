const db = require('../db');

// ➕ Ajouter une image
const insertImage = async (img) => {
  const query = `
    INSERT INTO img_object (img_name, pHash, id_object)
    VALUES ($1, $2, $3)
    RETURNING _id_img
  `;
  const values = [img.imgName, img.pHash, img.id_object];

  const result = await db.query(query, values);
  return result.rows[0]._id_img;
};

// 📥 Récupérer toutes les images
const getAllImages = async () => {
  const result = await db.query('SELECT * FROM img_object');
  return result.rows;
};

// 📥 Récupérer les images liées à un objet
const getImagesByObjectId = async (objectId) => {
  const query = `SELECT * FROM img_object WHERE id_object = $1`;
  const result = await db.query(query, [objectId]);
  return result.rows;
};

// ❌ Supprimer une image
const deleteImage = async (id) => {
  const query = `DELETE FROM img_object WHERE _id_img = $1`;
  await db.query(query, [id]);
};

// 🔄 Mettre à jour une image
const updateImage = async (id, data) => {
  const query = `
    UPDATE img_object SET
      img_name = $1,
      pHash = $2,
      id_object = $3
    WHERE _id_img = $4
    RETURNING *
  `;
  const values = [data.imgName, data.pHash, data.id_object, id];

  const result = await db.query(query, values);
  return result.rows[0];
};

module.exports = {
  insertImage,
  getAllImages,
  getImagesByObjectId,
  deleteImage,
  updateImage,
};

