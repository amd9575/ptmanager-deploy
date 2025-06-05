const axios = require('axios');

const sendFirebaseNotification = async (deviceToken, title, message) => {
  try {
    const payload = {
      to: deviceToken,
      notification: {
        title,
        body: message,
      },
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
    };

    const res = await axios.post('https://fcm.googleapis.com/fcm/send', payload, { headers });
    return res.data;
  } catch (err) {
    console.error('❌ Erreur FCM:', err.response?.data || err.message);
    throw err;
  }
};

module.exports = { sendFirebaseNotification };

