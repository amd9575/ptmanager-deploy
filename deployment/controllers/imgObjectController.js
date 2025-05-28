const ImgModel = require('../models/imgObjectModel');

// ➕ Ajouter une image
const createImg = async (req, res) => {
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
const deleteImg = async (req, res) => {
  try {
    await ImgModel.deleteImage(req.params.id);
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
  deleteImg,
  updateImg,
};

