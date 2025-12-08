require('dotenv').config({ path: __dirname + '/.env' });
const nodemailer = require("nodemailer");


console.log("=== LOADED ENV VALUES ===");
console.log("SMTP_HOST =", process.env.SMTP_HOST);
console.log("SMTP_PORT =", process.env.SMTP_PORT);
console.log("SMTP_SECURE =", process.env.SMTP_SECURE);
console.log("SMTP_USER =", process.env.SMTP_USER);
console.log("SMTP_PASS length =======================", process.env.SMTP_PASS.length);
console.log("==========================");


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,          // smtp-relay.brevo.com
  port: Number(process.env.SMTP_PORT),  // 587
  secure: false,                        // false pour 587
  auth: {
    user: process.env.SMTP_USER,        // 810904001@smtp-brevo.com
    pass: process.env.SMTP_PASS         // clé SMTP
  }
});

module.exports = transporter;

