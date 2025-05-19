const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Mot de passe incorrect' });

    await userModel.updateLastConnexion(user._id_user);

    res.json({
      id_user: user._id_user,
      user_type: user.user_type,
      f_name: user.f_name,
      l_name: user.l_name,
      email: user.email,
      phone: user.phone,
      date_create: user.date_user_creat,
      is_actif: user.user_is_actif,
      is_admin: user.user_is_admin,
      date_last_connect: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Erreur loginUser :', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
const updateDeviceToken = async (req, res) => {
  const { userId, deviceToken } = req.body;

  if (!userId || !deviceToken) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  try {
    const updated = await userModel.updateDeviceToken(userId, deviceToken);
    if (updated === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Erreur updateDeviceToken :', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};


module.exports = { 
loginUser,
updateDeviceToken, };
