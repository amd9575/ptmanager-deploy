const ImgObject = require('../models/imgObjectModel');

// Ajouter une image
const createImg = async (req, res) => {
  try {
    const img = new ImgObject(req.body);
    const savedImg = await img.save();
    res.status(201).json(savedImg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer toutes les images
const getAllImgs = async (req, res) => {
  try {
    const images = await ImgObject.find();
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer les images liées à un objet
const getImgsByObjectId = async (req, res) => {
  try {
    const images = await ImgObject.find({ id_object: req.params.objectId });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprimer une image
const deleteImg = async (req, res) => {
  try {
    await ImgObject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateImg = async (req, res) => {
  try {
    const updatedImg = await ImgObject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedImg) return res.status(404).json({ message: "Image introuvable" });
    res.json(updatedImg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { 
   createImg,
   getAllImgs,
   getImgsByObjectId,
   deleteImg,
   updateImg,
};

