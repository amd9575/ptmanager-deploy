// -------------------------- Utilisation de axios pour l'ancinene version de firebase -------------------------
//const axios = require('axios');

//const sendFirebaseNotification = async (deviceToken, title, message) => {
//  try {
//    const payload = {
//      to: deviceToken,
//      notification: {
//        title,
//        body: message,
//      },
//    };

//   const headers = {
//      'Content-Type': 'application/json',
//      Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
//    };

//    const res = await axios.post('https://fcm.googleapis.com/fcm/send', payload, { headers });
//    console.log('✅ FCM response:', res.data);
//    return res.data;
//  } catch (err) {
//    console.error('❌ Erreur FCM:', err.response?.data || err.message);
//    throw err;
//  }
//};

//module.exports = { sendFirebaseNotification };

// -------------------------- Utilisation de firebase-admin -------------------------
const admin = require('firebase-admin');
const path = require('path');

// Initialise Firebase Admin SDK avec ton service-account.json
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendFirebaseNotification = async (deviceToken, title, message) => {
  const payload = {
    notification: {
      title,
      body: message
    },
    token: deviceToken
  };

  try {
    const response = await admin.messaging().send(payload);
    console.log('✅ Notification envoyée avec succès:', response);
    return response;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification:', error);
    throw error;
  }
};

module.exports = { sendFirebaseNotification };

