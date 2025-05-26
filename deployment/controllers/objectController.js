const ObjectModel = require('../models/objectModel');

// Ajouter un objet
const createObject = async (req, res) => {
  try {
    const object = new ObjectModel(req.body);
    const savedObject = await object.save();
    res.status(201).json(savedObject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lister tous les objets
const getAllObjects = async (req, res) => {
  try {
    const objects = await ObjectModel.find();
    res.json(objects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtenir un objet par ID
const getObjectById = async (req, res) => {
  try {
    const object = await ObjectModel.findById(req.params.id);
    if (!object) return res.status(404).json({ message: 'Objet introuvable' });
    res.json(object);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour un objet
const updateObject = async (req, res) => {
  try {
    const updated = await ObjectModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer un objet
const deleteObject = async (req, res) => {
  try {
    await ObjectModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Objet supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { 
   createObject,
   getAllObjects,
   getObjectById,
   updateObject,
   deleteObject,
};
