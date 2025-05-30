const objectModel = require('../models/objectModel');

// Créer un objet
const createObject = async (req, res) => {
  try {
    const id = await objectModel.insertObject(req.body);
    res.status(201).json({ success: true, _id_object: id });
  } catch (error) {
    console.error('createObject error:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l’objet' });
  }
};

// Lire tous les objets
const getAllObjects = async (req, res) => {
  try {
    const data = await objectModel.getAllObjects();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération objets' });
  }
};

// Lire un objet par ID
const getObjectById = async (req, res) => {
  try {
    const object = await objectModel.getObjectById(req.params.id);
    if (!object) return res.status(404).json({ error: 'Objet non trouvé' });
    res.json(object);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Modifier un objet
const updateObject = async (req, res) => {
  try {
    const updated = await objectModel.updateObject(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Erreur mise à jour' });
  }
};

// Supprimer un objet
const deleteObject = async (req, res) => {
  try {
    await objectModel.deleteObject(req.params.id);
    res.json({ message: 'Objet supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
};

// Objets filtrés
const getObjectsFilteredByTime = async (req, res) => {
  const {
    currentObjectId,
    objectType,
    objDate,
    isLost,
    isFound
  } = req.query;

  console.log('Requête filtrée reçue avec :', {
    currentObjectId,
    objectType,
    objDate,
    isLost,
    isFound
  });

  try {
    const result = await objectModel.getObjectsFilteredByTime(
      currentObjectId,
      objectType,
      objDate,
      isLost === 'true',
      isFound === 'true'
    );
    res.json(result);
  } catch (error) {
    console.error('getObjectsFilteredByTime error:', error);
    res.status(500).json({ error: 'Erreur récupération objets filtrés' });
  }
};


module.exports = {
  createObject,
  getAllObjects,
  getObjectById,
  updateObject,
  deleteObject,
  getObjectsFilteredByTime,
};

