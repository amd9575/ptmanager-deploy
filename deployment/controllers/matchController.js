// controllers/matchController.js
const matchModel = require('../models/matchModel');
const notificationModel = require('../models/notificationModel');
const { sendFirebaseNotification } = require('../services/firebaseService');
const { sendContactEmail } = require('../services/emailService');

/**
 * POST /api/matches/create
 * Crée un nouveau match et envoie une notification au perdant
 */
const createMatch = async (req, res) => {
  const { foundObjectId, lostObjectId, finderUserId, loserUserId, searcherId, score } = req.body;
  
  console.log('🆕 Création match:', req.body);
  
  // Validation
  if (!foundObjectId || !lostObjectId || !finderUserId || !loserUserId) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }
  
  try {
    // 1. Vérifier si le match existe déjà (éviter doublons)
    const exists = await matchModel.matchExists(foundObjectId, lostObjectId);
    
    if (exists) {
      console.log('ℹ️ Match déjà existant');
      return res.status(200).json({ 
        success: true, 
        alreadyExists: true,
        message: 'Match déjà enregistré' 
      });
    }
    
    // 2. Créer le match
    const matchId = await matchModel.createMatch({
      foundObjectId,
      lostObjectId,
      finderUserId,
      loserUserId,
      searcherId,  // ← AJOUTER ICI
      score
    });
    
    console.log('✅ Match créé avec ID:', matchId);
    
    // 3. Déterminer qui doit être notifié
    // Notifier celui qui N'A PAS cherché
    let userToNotify;
    
    if (searcherId == finderUserId) {
      // Le trouveur a cherché → notifier le perdant
      userToNotify = loserUserId;
      console.log('🔍 Trouveur a cherché → notification au perdant:', loserUserId);
    } else {
      // Le perdant a cherché → notifier le trouveur
      userToNotify = finderUserId;
      console.log('🔍 Perdant a cherché → notification au trouveur:', finderUserId);
    }
    
    // 4. Récupérer le token de la personne à notifier
    const token = await notificationModel.getDeviceToken(userToNotify);  // ← CHANGER loserUserId en userToNotify
    
    if (token) {
      // 5. Envoyer la notification Firebase avec message adapté
      const title = userToNotify == finderUserId 
        ? "Quelqu'un a perdu un objet !"
        : "Objet retrouvé ?";
      
      const message = userToNotify == finderUserId
        ? "Un objet que vous avez trouvé correspond à une déclaration de perte"
        : "Quelqu'un pense avoir trouvé votre objet";
      
      const notifData = {
        type: 'match_found',
        matchId: matchId.toString(),
        foundObjectId: foundObjectId.toString()
      };
      
      await sendFirebaseNotification(token, title, message, notifData);
      
      console.log('🔔 Notification envoyée à userId:', userToNotify);  // ← CHANGER loserUserId en userToNotify
    } else {
      console.log('⚠️ Pas de token pour userId:', userToNotify);  // ← CHANGER loserUserId en userToNotify
    }
    
    res.status(201).json({ 
      success: true, 
      matchId,
      message: 'Match créé et notification envoyée' 
    });
    
  } catch (err) {
    console.error('❌ Erreur createMatch:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * GET /api/matches/pending/:userId
 * Récupère tous les matches en attente pour un utilisateur
 */
const getPendingMatches = async (req, res) => {
  const { userId } = req.params;
  
  console.log('📬 Récupération matches en attente pour userId:', userId);
  
  try {
    const matches = await matchModel.getPendingMatchesByUser(userId);
    
    res.status(200).json({
      success: true,
      count: matches.length,
      matches
    });
    
  } catch (err) {
    console.error('❌ Erreur getPendingMatches:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * POST /api/matches/confirm
 * Confirme un match : envoie email au trouveur et marque contact_initiated = true
 */
const confirmMatch = async (req, res) => {
  const { matchId, userId } = req.body;
  
  console.log('✅ Confirmation match:', { matchId, userId });
  
  if (!matchId || !userId) {
    return res.status(400).json({ error: 'matchId et userId requis' });
  }
  
  try {
    // 1. Récupérer les détails du match
    const match = await matchModel.getMatchById(matchId);
    
    if (!match) {
      return res.status(404).json({ error: 'Match non trouvé' });
    }
    
    // 2. Vérifier que c'est bien le bon utilisateur
// if (match._id_loser_user !== parseInt(userId)) {
//   return res.status(403).json({ error: 'Non autorisé' });
// }
   const userIdInt = parseInt(userId);
   if (match._id_loser_user !== userIdInt && match._id_finder_user !== userIdInt) {
     return res.status(403).json({ error: 'Non autorisé' });
   }
    
    // 3. Vérifier si déjà contacté
    if (match.contact_initiated) {
      return res.status(200).json({ 
        success: true, 
        alreadyContacted: true,
        message: 'Contact déjà établi' 
      });
    }
    
    // 4. Envoyer l'email au trouveur
    try {
      await sendContactEmail({
        finderEmail: match.finder_email,
        finderName: `${match.finder_firstname} ${match.finder_name}`,
        loserEmail: match.loser_email,
        loserName: `${match.loser_firstname} ${match.loser_name}`,
        loserPhone: match.loser_phone || 'Non communiqué',
        objectName: match.found_object_type,
        objectDescription: match.found_object_description,
        objectCity: match.found_object_city
      });
      
      console.log('📧 Email envoyé au trouveur:', match.finder_email);
      
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email (on continue quand même):', emailError);
    }
    
    // 5. Marquer le match comme "contact initié"
    await matchModel.markContactInitiated(matchId);

  // 6. ✅ CORRECTION : Envoyer à l'AUTRE personne (pas celle qui valide)
   let recipientUserId = (userIdInt == match._id_finder_user) ? match._id_loser_user : match._id_finder_user;
   const recipientToken = await notificationModel.getDeviceToken(recipientUserId);

   if (recipientToken) {
     await sendFirebaseNotification(
       recipientToken,
       "Confirmation de match",
       "Le match a été confirmé",
       {
         type: 'match_confirmed',
         matchId: matchId.toString()
       }
     );
     console.log('🔔 Notification envoyée à userId:', recipientUserId);
   }

   res.status(200).json({ 
     success: true, 
     alreadyContacted: false,
     message: 'Email envoyé au trouveur' 
   });
       
     } catch (err) {
       console.error('❌ Erreur confirmMatch:', err);
       res.status(500).json({ error: 'Erreur serveur' });
     }
};

/**
 * POST /api/matches/reject
 * Rejette un match : supprime le match de la base
 */
const rejectMatch = async (req, res) => {
  const { matchId, userId } = req.body;
  
  console.log('❌ Rejet match:', { matchId, userId });
  
  if (!matchId || !userId) {
    return res.status(400).json({ error: 'matchId et userId requis' });
  }
  
  try {
    // 1. Récupérer le match pour vérifier l'utilisateur
    const match = await matchModel.getMatchById(matchId);
    
    if (!match) {
      return res.status(404).json({ error: 'Match non trouvé' });
    }
    
    // 2. Vérifier que c'est bien le bon utilisateur
const userIdInt = parseInt(userId);
if (match._id_loser_user !== userIdInt && match._id_finder_user !== userIdInt) {
  return res.status(403).json({ error: 'Non autorisé' });
}
    // 3. Supprimer le match
    await matchModel.deleteMatch(matchId);
    
    res.status(200).json({ 
      success: true,
      message: 'Match rejeté' 
    });
    
  } catch (err) {
    console.error('❌ Erreur rejectMatch:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  createMatch,
  getPendingMatches,
  confirmMatch,
  rejectMatch
};
