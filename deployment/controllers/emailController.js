const nodemailer = require('nodemailer');
const notificationModel = require('../models/notificationModel');
const { sendFirebaseNotification } = require('../services/firebaseService');
const SibApiV3Sdk = require('@getbrevo/brevo');
const { notifyUser } = require('./notificationController');

// Fonction principale avec API Brevo (à utiliser)
const sendEmail = async (req, res) => {
    const { to, cc, subject, body, userId, userEmail, objectId, type } = req.body;
    
    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Champs requis manquants.' });
    }

    try {
        // Configuration de l'API Brevo - BONNE MÉTHODE
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const apiKey = apiInstance.authentications['apiKey'];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        // Préparer l'email
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = { 
            email: process.env.EMAIL_NOREPLY_ADDRESS,
            name: process.env.EMAIL_FROM_NAME
        };
        sendSmtpEmail.to = [{ email: to }];
        
        if (cc) {
            sendSmtpEmail.cc = [{ email: cc }];
        }
        
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.textContent = body;
        sendSmtpEmail.replyTo = { email: process.env.EMAIL_CONTACT_ADDRESS };

        // 1️⃣ Envoi via API Brevo
        await apiInstance.sendTransacEmail(sendSmtpEmail);

        // 2️⃣ Notification
        await notifyUser(
            {
                body: { userId, userEmail, objectId, type }
            },
            {
                status: () => ({ json: () => {} })
            }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erreur envoi email:', error);
        res.status(500).json({ error: "Échec de l'envoi du mail." });
    }
};

// Ancienne fonction SMTP (à garder en backup si besoin)
const sendEmail_smtp = async (req, res) => {
    const { to, cc, subject, body, userId, userEmail, objectId, type } = req.body;
    
    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Champs requis manquants.' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_NOREPLY_ADDRESS,
            to,
            cc,
            subject,
            text: body,
            replyTo: process.env.EMAIL_CONTACT_ADDRESS
        });

        await notifyUser(
            {
                body: { userId, userEmail, objectId, type }
            },
            {
                status: () => ({ json: () => {} })
            }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erreur envoi email:', error);
        res.status(500).json({ error: "Échec de l'envoi du mail." });
    }
};

// Export les deux fonctions
module.exports = {
    sendEmail,
    sendEmail_smtp
};
