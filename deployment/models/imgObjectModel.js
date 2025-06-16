const db = require('../db');

// ➕ Ajouter une image
const insertImage = async (img) => {
  const query = `
    INSERT INTO image_object (imgobject_name, imgobject_phash, _id_object)
    VALUES ($1, $2, $3)
    RETURNING _id_imgobject
  `;
  const values = [img.imgName, img.pHash, img.id_object];

  const result = await db.query(query, values);
  return result.rows[0]._id_img;
};

// 📥 Récupérer toutes les images
const getAllImages = async () => {
  const result = await db.query('SELECT * FROM image_object');
  return result.rows;
};

// 📥 Récupérer les images liées à un objet
const getImagesByObjectId = async (objectId) => {
  const query = `SELECT * FROM image_object WHERE _id_object = $1`;
  const result = await db.query(query, [objectId]);
  return result.rows;
};

// ❌ Supprimer une image
const deleteImageByImgId = async (id) => {
  const query = `DELETE FROM image_object WHERE _id_imgobject = $1`;
  await db.query(query, [id]);
};

// 🔄 Mettre à jour une image
const updateImage = async (id, data) => {
  const query = `
    UPDATE image_object SET
      imgobject_name = $1,
      imgobject_phash = $2,
      _id_object = $3
    WHERE _id_imgobject = $4
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
  deleteImageByImgId,
  updateImage,
};

