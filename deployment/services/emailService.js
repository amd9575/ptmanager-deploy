// services/emailService.js
const SibApiV3Sdk = require('@getbrevo/brevo');

/**
 * Envoie un email au trouveur pour lui communiquer les coordonnées du perdant
 */
const sendContactEmail = async (emailData) => {
  const {
    finderEmail,
    finderName,
    loserEmail,
    loserName,
    loserPhone,
    objectName,
    objectDescription,
    objectCity
  } = emailData;

  // Configuration de l'API Brevo
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const apiKey = apiInstance.authentications['apiKey'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  // Construction du contenu HTML
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f4f4f4;
          padding: 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
          background-color: #4CAF50; 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content { 
          padding: 30px 20px; 
        }
        .info-box { 
          background-color: #f9f9f9; 
          padding: 15px; 
          border-left: 4px solid #4CAF50; 
          margin: 20px 0; 
          border-radius: 4px;
        }
        .contact-box { 
          background-color: #e8f5e9; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
        .footer { 
          background-color: #f4f4f4;
          text-align: center; 
          padding: 20px;
          font-size: 12px; 
          color: #666; 
        }
        .label { 
          font-weight: bold; 
          color: #555; 
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Bonne nouvelle !</h1>
        </div>
        
        <div class="content">
          <h2>Le propriétaire a confirmé qu'il s'agit de son objet</h2>
          
          <p>Bonjour <strong>${finderName}</strong>,</p>
          
          <p>
            Nous avons une excellente nouvelle ! La personne qui a déclaré avoir perdu l'objet 
            que vous avez trouvé vient de confirmer qu'il s'agit bien de son bien.
          </p>
          
          <div class="info-box">
            <p class="label">📦 Objet concerné :</p>
            <p><strong>${objectName}</strong></p>
            ${objectCity ? `<p>📍 <em>${objectCity}</em></p>` : ''}
            ${objectDescription ? `<p>${objectDescription}</p>` : ''}
          </div>
          
          <div class="contact-box">
            <h3>👤 Coordonnées du propriétaire :</h3>
            <p><span class="label">Nom :</span> ${loserName}</p>
            <p><span class="label">Email :</span> <a href="mailto:${loserEmail}">${loserEmail}</a></p>
            ${loserPhone !== 'Non communiqué' ? `<p><span class="label">Téléphone :</span> ${loserPhone}</p>` : ''}
          </div>
          
          <p>
            <strong>Prochaines étapes :</strong><br>
            Nous vous invitons à contacter <strong>${loserName}</strong> directement par email ou téléphone 
            pour convenir d'un lieu et d'une heure de rencontre afin de lui restituer l'objet.
          </p>
          
          <p style="text-align: center; margin-top: 30px;">
            <a href="mailto:${loserEmail}" class="button">
              📧 Contacter ${loserName}
            </a>
          </p>
          
          <p style="margin-top: 30px; color: #666;">
            Merci infiniment pour votre honnêteté et votre geste citoyen ! 🙏
          </p>
        </div>
        
        <div class="footer">
          <p>Cet email a été envoyé automatiquement par l'application <strong>Objets Trouvés</strong>.</p>
          <p>Merci de ne pas répondre directement à cet email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Construction du contenu texte (fallback)
  const textContent = `
Bonjour ${finderName},

Bonne nouvelle ! Le propriétaire a confirmé qu'il s'agit de son objet.

Objet : ${objectName}
${objectCity ? `Lieu : ${objectCity}` : ''}

Coordonnées du propriétaire :
Nom : ${loserName}
Email : ${loserEmail}
${loserPhone !== 'Non communiqué' ? `Téléphone : ${loserPhone}` : ''}

Nous vous invitons à le contacter directement pour organiser la restitution.

Merci pour votre honnêteté !

---
Objets Trouvés
  `;

  // Préparation de l'email
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  
  sendSmtpEmail.sender = { 
    email: process.env.EMAIL_NOREPLY_ADDRESS || 'noreply@objetstrouves.com',
    name: process.env.EMAIL_FROM_NAME || 'Objets Trouvés'
  };
  
  sendSmtpEmail.to = [{ email: finderEmail, name: finderName }];
  sendSmtpEmail.subject = `🎉 Le propriétaire a confirmé - ${objectName}`;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.textContent = textContent;
  sendSmtpEmail.replyTo = { 
    email: loserEmail, 
    name: loserName 
  };

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email Brevo envoyé avec succès:', response);
    return response;
  } catch (error) {
    console.error('❌ Erreur envoi email Brevo:', error.response?.body || error.message);
    throw error;
  }
};

module.exports = {
  sendContactEmail
};
