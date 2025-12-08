// controllers/notificationController.js
const notificationModel = require('../models/notificationModel');
const { sendFirebaseNotification } = require('../services/firebaseService');
// tu peux aussi importer un module externe pour envoyer la notif (ex. Firebase)


const notifyUser = async (req, res) => {
  const { userId, userEmail, objectId, type } = req.body;

  try {
    const token = await notificationModel.getDeviceToken(userId);
console.log('🔔 Token récupéré:', token); // 👈 LOG 

    if (!token) {
console.log('❌ Pas de token pour userId:', userId); // 👈 LOG 3
      return res.status(404).json({ error: 'Token introuvable pour cet utilisateur' });
    }

    // Configuration des titres et messages par type
    const notificationTypes = {
      found: {
        title: "Objet retrouvé ?",
        message: "Quelqu’un pense que vous avez trouvé son objet."
      },
      declared_lost: {
        title: "Déclaration de perte",
        message: "L'objet que vous avez trouvé vient d’être déclaré perdu."
      }
    };

    const { title, message } = notificationTypes[type] || {
      title: "Notification",
      message: "Une mise à jour concernant un objet vous concerne."
    };

    const notifId = await notificationModel.insertNotification({
      userId,
      email: userEmail,
      message,
      objectId,
      isManaged: true,
    });

    await sendFirebaseNotification(token, title, message);
console.log('✅ Firebase notification envoyée'); // 👈 LOG 4

    res.status(201).json({ success: true, notifId });
  } catch (err) {
    console.error('Erreur sendNotification:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'envoi de la notification' });
  }
};


const createNotification = async (req, res) => {
  const { userId, email, message, objectId, isManaged } = req.body;

  try {
    const insertedId = await notificationModel.insertNotification({
      userId,
      email,
      message,
      objectId,
      isManaged: isManaged ?? true // valeur par défaut
    });

    res.status(201).json({ id: insertedId });
  } catch (err) {
    console.error('Erreur lors de l’insertion de la notification :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const updateDeviceToken = async (req, res) => {
  const { userId } = req.params;
  const { deviceToken } = req.body;
  
  console.log('📱 Mise à jour token pour userId:', userId);
  console.log('📱 Nouveau token:', deviceToken);
  
  if (!deviceToken) {
    return res.status(400).json({ error: 'deviceToken manquant' });
  }
  
  try {
    await notificationModel.updateDeviceToken(userId, deviceToken);
    console.log('✅ Token mis à jour en DB');
    res.json({ success: true, message: 'Token mis à jour' });
  } catch (err) {
    console.error('❌ Erreur update token:', err);
    res.status(500).json({ error: err.message });
  }
};



module.exports = { 
   createNotification,
   notifyUser,
   updateDeviceToken,
};

