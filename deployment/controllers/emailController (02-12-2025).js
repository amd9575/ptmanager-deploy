const nodemailer = require('nodemailer');

const sendEmail = async (req, res) => {
    const { to, cc, subject, body } = req.body;

    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Champs requis manquants.' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER_NAME,
                pass: process.env.SMTP_USER_PWD,
            },
        });
//Test serveur smtp
await transporter.verify();
console.log("✓ SMTP server is reachable");

        await transporter.sendMail({
            from: process.env.EMAIL_SENDER,
            to,
            cc,  // Envoie en copie
            subject,
            text: body,
        });

      // 🔔 Envoi notification après mail
        const token = await notificationModel.getDeviceToken(userId);
        if (token) {
            const notifMessage = subject === "Objet trouvé"
                ? "Quelqu’un pense que vous avez trouvé son objet."
                : "L'objet que vous avez trouvé vient d’être déclaré perdu.";

            await sendFirebaseNotification(token, subject, notifMessage);

            // Enregistre la notif en base si besoin :
            await notificationModel.insertNotification({
                userId,
                email: to,
                message: notifMessage,
                objectId,
                isManaged: true,
            });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erreur envoi email:', error);
        res.status(500).json({ error: 'Échec de l’envoi du mail.' });
    }
};


module.exports = {
    sendEmail
};
