const nodemailer = require('nodemailer');

async function sendEmail({
  email,
  password,
  subject,
  recipient,
  body
}) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: password
    }
  });

  let mailOptions = {
    from: email,
    to: recipient,
    subject: subject,
    text: body
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = sendEmail; // Exporting the function for external use
