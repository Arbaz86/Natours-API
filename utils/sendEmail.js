// Require nodemailer library
const nodemailer = require("nodemailer");

// Define async function to send email
const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    // Use environment variables to store email settings
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: "Arbaz Hussain <arbazh777@gmail.com>", // Sender email address and name
    to: options.email, // Recipient email address
    subject: options.subject, // Email subject
    text: options.message, // Email message
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

// Export the sendEmail function
module.exports = sendEmail;
