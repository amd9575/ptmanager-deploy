// controllers/notificationController.js
const notificationModel = require('../models/notificationModel');
const { sendFirebaseNotification } = require('../services/firebaseService');
// tu peux aussi importer un module externe pour envoyer la notif (ex. Firebase)


const notifyUser = async (req, res) => {
  const { userId, userEmail, objectId, message } = req.body;

  try {
    const token = await notificationModel.getDeviceToken(userId);

    if (!token) {
      return res.status(404).json({ error: 'Token introuvable pour cet utilisateur' });
    }

   const notifId = await notificationModel.insertNotification({
      userId,
      email: userEmail,
      message,
      objectId,
      isManaged: true,
    });

    await sendFirebaseNotification(token, "Objet trouvé", message);

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




module.exports = { 
   createNotification,
   notifyUser,
};

