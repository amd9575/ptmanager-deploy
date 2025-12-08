require('dotenv').config({ path: __dirname + '/.env' });
const transporter = require("./nodemailer");

(async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP Brevo prêt");

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "tonmail@exemple.com",
      subject: "Test Brevo",
      text: "Test SMTP Brevo"
    });
    console.log("Email envoyé:", info.messageId);
  } catch (e) {
    console.error("❌ ERREUR SMTP :", e);
  }
})();
