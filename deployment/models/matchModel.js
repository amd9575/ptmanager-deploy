// models/matchModel.js
const db = require('../db');

/**
 * Crée un nouveau match entre un objet trouvé et un objet perdu
 */
const createMatch = async (matchData) => {
  const { foundObjectId, lostObjectId, finderUserId, loserUserId, searcherId, score } = matchData;
  
  const query = `
    INSERT INTO matches (
      _id_found_object,
      _id_lost_object,
      _id_finder_user,
      _id_loser_user,
      searcher_user_id, 
      match_score,
      contact_initiated,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
    RETURNING _id_match
  `;
  
  const values = [foundObjectId, lostObjectId, finderUserId, loserUserId, searcherId, score];
  
  console.log('📝 Création match avec:', values);
  
  const result = await db.query(query, values);
  return result.rows[0]._id_match;
};

/**
 * Récupère tous les matches en attente pour un utilisateur
 * (matches où contact_initiated = false et l'user est le "loser")
 */
const getPendingMatchesByUser = async (userId) => {
  const query = `
    SELECT 
      m._id_match,
      m._id_found_object,
      m._id_lost_object,
      m._id_finder_user,        -- ✅ AJOUTER
      m._id_loser_user,         -- ✅ AJOUTER
      m.match_score,
      m.created_at,
      
      -- Infos de l'objet trouvé
      o_found.object_type as found_object_type,
      o_found.object_description as found_object_description,
      o_found.object_address as found_object_address,
      o_found.object_city as found_object_city,
      o_found.object_date as found_object_date,
      o_found.object_latitude as found_object_latitude,
      o_found.object_longitude as found_object_longitude,
      
      -- Infos de l'objet perdu
      o_lost.object_type as lost_object_type,
      o_lost.object_description as lost_object_description,
      
      -- Infos du trouveur
      u_finder.l_name as finder_name,
      u_finder.f_name as finder_firstname,
      u_finder.email as finder_email,
      
      -- ✅ AJOUTER : Infos du perdant
      u_loser.l_name as loser_name,
      u_loser.f_name as loser_firstname,
      u_loser.email as loser_email
      
    FROM matches m
    
    INNER JOIN object o_found ON m._id_found_object = o_found._id_object
    INNER JOIN object o_lost ON m._id_lost_object = o_lost._id_object
    INNER JOIN users u_finder ON m._id_finder_user = u_finder._id_user
    INNER JOIN users u_loser ON m._id_loser_user = u_loser._id_user  -- ✅ AJOUTER
    
    WHERE (m._id_loser_user = $1 OR m._id_finder_user = $1)  -- ✅ MODIFIER
      AND m.searcher_user_id != $1      
      AND m.contact_initiated = false
      AND o_found.object_is_actif = true
      
    ORDER BY m.created_at DESC
  `;
  
  const result = await db.query(query, [userId]);
  
  console.log(`📬 ${result.rows.length} matches en attente pour userId ${userId}`);  // ✅ CORRIGER (il manquait une parenthèse)
  
  return result.rows;
};

/**
 * Récupère un match spécifique par son ID
 */
const getMatchById = async (matchId) => {
  const query = `
    SELECT 
      m.*,
      
      -- Infos trouveur
      u_finder.l_name as finder_name,
      u_finder.f_name as finder_firstname,
      u_finder.email as finder_email,
      u_finder.phone as finder_phone,
      
      -- Infos perdant
      u_loser.l_name as loser_name,
      u_loser.f_name as loser_firstname,
      u_loser.email as loser_email,
      u_loser.phone as loser_phone,
      
      -- Infos objet trouvé
      o_found.object_type as found_object_type,
      o_found.object_description as found_object_description,
      o_found.object_city as found_object_city
      
    FROM matches m
    
    INNER JOIN users u_finder ON m._id_finder_user = u_finder._id_user
    INNER JOIN users u_loser ON m._id_loser_user = u_loser._id_user
    INNER JOIN object o_found ON m._id_found_object = o_found._id_object
    
    WHERE m._id_match = $1
  `;
  
  const result = await db.query(query, [matchId]);
  return result.rows[0];
};

/**
 * Marque un match comme "contact initié"
 */
const markContactInitiated = async (matchId) => {
  const query = `
    UPDATE matches
    SET contact_initiated = true,
        contact_date = NOW()
    WHERE _id_match = $1
    RETURNING *
  `;
  
  const result = await db.query(query, [matchId]);
  
  console.log('✅ Match marqué comme contacté:', matchId);
  
  return result.rows[0];
};

/**
 * Supprime un match (quand l'utilisateur dit "Non ce n'est pas le mien")
 */
const deleteMatch = async (matchId) => {
  const query = `DELETE FROM matches WHERE _id_match = $1`;
  
  await db.query(query, [matchId]);
  
  console.log('🗑️ Match supprimé:', matchId);
  
  return true;
};

/**
 * Vérifie si un match existe déjà entre deux objets
 * (pour éviter les doublons)
 */
const matchExists = async (foundObjectId, lostObjectId) => {
  const query = `
    SELECT _id_match 
    FROM matches 
    WHERE _id_found_object = $1 
      AND _id_lost_object = $2
  `;
  
  const result = await db.query(query, [foundObjectId, lostObjectId]);
  return result.rows.length > 0;
};
/**
 * Récupère le match en cours pour un objet spécifique (si existe)
 */
  const getObjectPendingMatch = async (objectId) => {
    const query = `
      SELECT 
        m._id_match,
        m._id_found_object,
        m._id_lost_object,
        m.created_at,
        m.contact_initiated
      FROM matches m
      WHERE (m._id_found_object = $1 OR m._id_lost_object = $1)
        AND m.contact_initiated = false
      LIMIT 1
    `;
    
    const result = await db.query(query, [objectId]);
    
    if (result.rows.length > 0) {
      console.log(`✅ Match en cours trouvé pour objectId ${objectId}`);
      return result.rows[0];
    }
    
    console.log(`ℹ️ Aucun match en cours pour objectId ${objectId}`);
    return null;
  };

module.exports = {
  createMatch,
  getPendingMatchesByUser,
  getMatchById,
  markContactInitiated,
  deleteMatch,
  matchExists,
  getObjectPendingMatch
};
