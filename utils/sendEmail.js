const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

// Export Email class as a module
module.exports = class Email {
  // Constructor function that initializes Email object
  constructor(user, url) {
    this.to = user.email; // Recipient email
    this.firstName = user.name.split(" ")[0]; // First name of recipient
    this.url = url; // URL to include in email
    this.from = `Arbaz Hussain <${process.env.EMAIL_FROM}>`; // Sender email address and name
  }

  // Function that creates a new email transport
  newTransport() {
    // If running in production environment, use SendGrid to send emails
    if (process.env.NODE_ENV === "production") {
      // SendGrid implementation here
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      // Use environment variables to store email settings
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email here
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // 2) Define email options
    const mailOptions = {
      from: this.from, // Sender email address and name
      to: this.to, // Recipient email address
      subject, // Email subject
      html, // HTML version of the email
      text: htmlToText.convert(html), // Plain text version of the email
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  // Method to send a welcome email
  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours Family!");
  }

  // Method to send a password reset email
  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
