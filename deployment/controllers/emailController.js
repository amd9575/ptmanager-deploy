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

        await transporter.sendMail({
            from: process.env.EMAIL_SENDER,
            to,
            cc,  // Envoie en copie
            subject,
            text: body,
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erreur envoi email:', error);
        res.status(500).json({ error: 'Échec de l’envoi du mail.' });
    }
};


module.exports = {
    sendEmail
};
