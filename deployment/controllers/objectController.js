const objectModel = require('../models/objectModel');

// Créer un objet
const createObject = async (req, res) => {
  try {
    const id = await objectModel.insertObject(req.body);
//    res.status(201).json({ success: true, _id_object: id });
    res.status(201).json({ id });
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
    console.error("Erreur getAllObjects :", error);
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
    console.log("updateObject called with ID:", req.params.id);

    if (!updated) {
      return res.status(404).json({ error: "Objet non trouvé ou non mis à jour" });
    }

    // ✅ Renvoyer un JSON simple pour satisfaire Volley
    res.status(200).json({ message: "Objet mis à jour avec succès" });

  } catch (error) {
    console.error("Erreur dans updateObject:", error);
    res.status(400).json({ error: "Erreur mise à jour" });
  }
};



// Supprimer un objet
const deleteObject = async (req, res) => {
  try {
    const object = await objectModel.getObjectById(req.params.id);
    if (!object) return res.status(404).json({ error: 'Objet introuvable' });

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

const getSimilarObjects = async (req, res) => {
  const { objectIds } = req.body;

  if (!Array.isArray(objectIds) || objectIds.length === 0) {
    return res.status(400).json({ error: "objectIds doit être un tableau non vide" });
  }

  try {
    const objects = await objectModel.getObjectsByIds(objectIds);
    res.json({ objects });
  } catch (error) {
    console.error('Erreur getSimilarObjects:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const getObjectsByUser = async (req, res) => {
  const userId = req.params.id;
  console.log("==> getObjectsByUser appelé avec ID:", userId);

  try {
    const data = await objectModel.getObjectsByUser(userId);
    res.json(data);
  } catch (err) {
    console.error("Erreur getObjectsByUser:", err);
    res.status(500).json({ error: 'Erreur récupération objets par user' });
  }
};


module.exports = {
  createObject,
  getAllObjects,
  getObjectById,
  updateObject,
  deleteObject,
  getObjectsFilteredByTime,
  getSimilarObjects,
  getObjectsByUser,
};

