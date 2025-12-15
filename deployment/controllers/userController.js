const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.getUserByEmail(email);
    
   if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        errorCode: "INVALID_CREDENTIALS",
        message: "Email ou mot de passe incorrect."
      });
    }

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

 console.log("Payload reçu :", req.body);

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

const createUser = async (req, res) => {
  const {
    user_type,
    f_name,
    l_name,
    email,
    phone,
    password,
    user_is_admin,
    user_is_actif,
    user_is_registered
  } = req.body;

  // Vérification basique
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      user_type,
      f_name,
      l_name,
      email,
      phone,
      password: hashedPassword,
      user_is_admin: user_is_admin ?? false,
      user_is_actif: user_is_actif ?? true,
      user_is_registered: user_is_registered ?? false
    };

    const userId = await userModel.createUser(newUser);
    res.status(201).json({ success: true, id_user: userId });

  } catch (err) {
//      if (err.code === '23505') { // erreur PostgreSQL : email déjà utilisé
         if (err.message === 'EMAIL_EXISTS') { //: email déjà utilisé
          return res.status(400).json({ error: 'EMAIL_ALREADY_EXISTS' });
      }
      console.error('Erreur registerUser :', err);
      res.status(500).json({ error: 'SERVER_ERROR' });
  }
};

const registerUser = async (req, res) => {
  const { id_user, email } = req.body;

  try {
    const result = await userModel.registerUser(id_user, email);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé ou email incorrect" });
    }

    res.status(200).json({ message: 'Utilisateur marqué comme enregistré avec succès' });
  } catch (error) {

    console.error('Erreur registerUser :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const checkIfUserExists = async (req, res) => {
  const email = decodeURIComponent(req.params.email); // pour gérer les @, %40, etc.

  try {
    const user = await userModel.getUserByEmail(email);

    if (user) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Erreur checkIfUserExists:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ error: 'Email et mot de passe requis.' });
        }

        const updated = await userModel.updatePassword(email, newPassword);
        if (updated) {
            res.json({ message: 'Mot de passe mis à jour avec succès.' });
        } else {
            res.status(404).json({ error: "Utilisateur non trouvé ou mot de passe non modifié." });
        }
    } catch (error) {
        console.error('Erreur resetPassword :', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};
//Methode qui permet de recuperre les parametres d'un utilisateur pour lui envoyer un email
const getUserObjectDetails = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid ids' });
  }

  try {
    const result = await userModel.getUsersAndObjectsByObjectIds(ids);
    res.json(result);
  } catch (err) {
    console.error("getUserObjectDetails error:", err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getDeviceToken = async (req, res) => {
  const { id } = req.params;

  try {
    const token = await userModel.getDeviceTokenByUserId(id);

    if (!token) {
      return res.status(404).json({ error: 'Token non trouvé pour cet utilisateur' });
    }

    res.json({ device_token: token });
  } catch (err) {
    console.error("Erreur récupération token :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
  
// 📝 Mise à jour d’un utilisateur
const updateUser = async (req, res) => {
  try {
    const updatedUser = await userModel.updateUser(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.error('Erreur updateUser:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l’utilisateur' });
  }
};

// ❌ Suppression d’un utilisateur
const deleteUser = async (req, res) => {
  try {
    await userModel.deleteUser(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l’utilisateur' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers(); // dans userModel.js
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

//recuperation name, email d'un utilisateur bien definit avec son ID 

const getUserParamsById = async (req, res) => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID utilisateur invalide' });
    }

    try {
        const user = await userModel.getUserParamsById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json(user); // → { id, name, email }
    } catch (err) {
        console.error('Erreur dans getUserParamsById:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};


module.exports = { 
   loginUser,
   updateDeviceToken,
   createUser,
   registerUser,
   checkIfUserExists,
   resetPassword,
   getUserObjectDetails,
   getDeviceToken,
   updateUser,
   deleteUser,
   getAllUsers,
   getUserParamsById,
};
