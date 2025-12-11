// services/firebaseService.js
const admin = require('firebase-admin');
// ✅ Initialisation PROTÉGÉE (une seule fois)
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('✅ Firebase Admin initialisé');
    
  } catch (error) {
    console.error('❌ Erreur init Firebase:', error.message);
    throw error;
  }
} else {
  console.log('ℹ️ Firebase Admin déjà initialisé');
}

// Note: Assurez-vous que Firebase Admin est déjà initialisé dans votre app
// Si ce n'est pas fait, décommentez les lignes ci-dessous :
//
// const serviceAccount = require('../path/to/serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

/**
 * Envoie une notification push Firebase avec données optionnelles
 * 
 * @param {string} deviceToken - Token FCM de l'appareil
 * @param {string} title - Titre de la notification
 * @param {string} body - Corps de la notification
 * @param {object} data - Données additionnelles (matchId, objectId, type, etc.)
 */
const sendFirebaseNotification = async (deviceToken, title, body, data = {}) => {
  
  // Construire le message
  const message = {
    token: deviceToken,
    notification: {
      title: title,
      body: body
    },
    data: {}, // Toutes les valeurs doivent être des strings
    android: {
      priority: 'high',
      notification: {
        channelId: 'LostAndFoundChannel',
        priority: 'high',
        sound: 'default'
      }
    }
  };
  
  // Convertir toutes les données en strings (Firebase exige ça)
  if (data && typeof data === 'object') {
    for (const key in data) {
      message.data[key] = String(data[key]);
    }
  }
  
  console.log('📤 Envoi notification Firebase:', {
    token: deviceToken.substring(0, 20) + '...',
    title,
    body,
    data: message.data
  });

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notification Firebase envoyée avec succès:', response);
    return response;
  } catch (error) {
    console.error('❌ Erreur envoi Firebase:', error);
    throw error;
  }
};

/**
 * Envoie une notification de match trouvé au perdant
 * 
 * @param {string} deviceToken - Token FCM du perdant
 * @param {number} matchId - ID du match
 * @param {number} foundObjectId - ID de l'objet trouvé
 * @param {string} objectName - Nom de l'objet
 */
const sendMatchFoundNotification = async (deviceToken, matchId, foundObjectId, objectName) => {
  const title = "Objet retrouvé ?";
  const body = `Quelqu'un pense avoir trouvé votre ${objectName}`;
  
  const data = {
    type: 'match_found',
    matchId: matchId.toString(),
    foundObjectId: foundObjectId.toString()
  };
  
  return await sendFirebaseNotification(deviceToken, title, body, data);
};

module.exports = {
  sendFirebaseNotification,
  sendMatchFoundNotification
};
