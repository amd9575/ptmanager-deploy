const axios = require("axios");

async function sendBrevoEmail({ to, subject, html }) {
  const response = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL
      },
      to: [
        { email: to }
      ],
      subject,
      htmlContent: html
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json"
      },
      timeout: 15000
    }
  );

  return response.data;
}

module.exports = {
  sendBrevoEmail
};
