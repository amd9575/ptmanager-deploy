const nodemailer = require('nodemailer');
const notificationModel = require('../models/notificationModel');
const { sendFirebaseNotification } = require('../services/firebaseService');
const SibApiV3Sdk = require('@getbrevo/brevo');


// controllers/emailController.js

const { notifyUser } = require('./notificationController'); // 👈 appel interne



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
                user: process.env.SMTP_USER, // gmail no-reply
                pass: process.env.SMTP_PASS
            }
        });

        // 1️⃣ Envoi email
        await transporter.sendMail({
            from: process.env.EMAIL_NOREPLY_ADDRESS,
            to,
            cc,
            subject,
            text: body,
            replyTo: process.env.EMAIL_CONTACT_ADDRESS
        });

        // 2️⃣ Appel interne du contrôleur de notification
        // (SANS requête HTTP, on utilise direct la fonction)
        await notifyUser(
            {
                body: { userId, userEmail, objectId, type }
            },
            {
                status: () => ({ json: () => {} }) // mock minimal pour l’appel interne
            }
        );

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Erreur envoi email:', error);
        res.status(500).json({ error: "Échec de l'envoi du mail." });
    }
};


const sendEmail = async (req, res) => {
    const { to, cc, subject, body, userId, userEmail, objectId, type } = req.body;
    
    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Champs requis manquants.' });
    }

    try {
        // Configuration de l'API Brevo
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        apiInstance.setApiKey(
            SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
            process.env.BREVO_API_KEY // Ta clé API Brevo
        );

        // Préparer l'email
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = { 
            email: process.env.EMAIL_NOREPLY_ADDRESS,
            name: "Votre App" 
        };
        sendSmtpEmail.to = [{ email: to }];
        
        if (cc) {
            sendSmtpEmail.cc = [{ email: cc }];
        }
        
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.textContent = body;
        sendSmtpEmail.replyTo = { email: process.env.EMAIL_CONTACT_ADDRESS };

        // 1️⃣ Envoi via API Brevo (pas de timeout!)
        await apiInstance.sendTransacEmail(sendSmtpEmail);

        // 2️⃣ Notification (ton code existant)
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

module.exports = { sendEmail };

module.exports = { sendEmail_smtp };


module.exports = {
    sendEmail,
};
