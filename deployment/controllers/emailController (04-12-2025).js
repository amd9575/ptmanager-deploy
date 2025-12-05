const nodemailer = require('nodemailer');
const notificationModel = require('../models/notificationModel');
const { sendFirebaseNotification } = require('../services/firebaseService');

const sendEmail = async (req, res) => {
    const { to, cc, subject, body, userId, objectId, type } = req.body;

    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Champs requis manquants.' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,                 // smtp.gmail.com
            port: parseInt(process.env.SMTP_PORT, 10),   // 587
            secure: process.env.SMTP_SECURE === 'true',  // false pour 587
            auth: {
                user: process.env.SMTP_USER,             // objettrouvetest@gmail.com
                pass: process.env.SMTP_PASS,             // mdp applicatif
            },
        });

        // optionnel : à garder seulement pour debug
        // await transporter.verify();
        // console.log("✓ SMTP server is reachable");

        await transporter.sendMail({
            from: process.env.EMAIL_NOREPLY_ADDRESS,     // expéditeur
            to,
            cc,                                          // en copie si fourni
            subject,
            text: body,
            replyTo: process.env.EMAIL_CONTACT_ADDRESS,  // réponses vers contact
        });

        // 🔔 Envoi notification après mail (si on a les infos)
        if (userId && objectId) {
            const token = await notificationModel.getDeviceToken(userId);
            if (token) {
                const notificationTypes = {
                    found: {
                        title: 'Objet retrouvé ?',
                        message: 'Quelqu’un pense que vous avez trouvé son objet.',
                    },
                    declared_lost: {
                        title: 'Déclaration de perte',
                        message: "L'objet que vous avez trouvé vient d’être déclaré perdu.",
                    },
                };

                const { title, message } =
                    notificationTypes[type] || {
                        title: subject || 'Notification',
                        message: "Une mise à jour concernant un objet vous concerne.",
                    };

                await sendFirebaseNotification(token, title, message);
      
                await notificationModel.insertNotification({
                    userId,
                    email: to,
                    message,
                    objectId,
                    isManaged: true,
                });

            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erreur envoi email:', error);
        res.status(500).json({ error: 'Échec de l’envoi du mail.' });
    }
};

module.exports = {
    sendEmail,
};
