const ImgModel = require('../models/imgObjectModel');

// ➕ Ajouter une image
const createImg = async (req, res) => {
  console.log(">>> createImg appelé avec :", req.body);
  try {
    const id = await ImgModel.insertImage(req.body);
    res.status(201).json({ success: true, _id_img: id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 📥 Récupérer toutes les images
const getAllImgs = async (req, res) => {
  try {
    const imgs = await ImgModel.getAllImages();
    res.json(imgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📥 Récupérer les images d’un objet
const getImgsByObjectId = async (req, res) => {
  try {
    const imgs = await ImgModel.getImagesByObjectId(req.params.objectId);
    res.json(imgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ Supprimer une image
const deleteImgByImgId = async (req, res) => {
  try {
    await ImgModel.deleteImageByImgId(req.params.id);
    res.json({ message: 'Image supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ Supprimer une image
const deleteImgByObjectId = async (req, res) => {
  try {
    await ImgModel.deleteImageByObjectId(req.params.objectId);
    res.json({ message: 'Image supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔄 Mettre à jour une image
const updateImg = async (req, res) => {
  try {
    const updated = await ImgModel.updateImage(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Image introuvable' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createImg,
  getAllImgs,
  getImgsByObjectId,
  deleteImgByImgId,
  deleteImgByObjectId,
  updateImg,
};

