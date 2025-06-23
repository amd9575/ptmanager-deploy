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
const getObjectsFilteredByTime = async (currentObjectId, objectType, objDate, isLost, isFound) => {
  try {
    const delta = 5;
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

