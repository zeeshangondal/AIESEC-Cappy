const nodemailer = require('nodemailer');

async function sendEmail({
  email,
  password,
  subject,
  recipient,
  body
}) {
  let transporter = nodemailer.createTransport({
    service: 'gmail', // For Gmail; if you use another email provider, this needs to be adjusted
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
    // console.log({  email,
    //   password,
    //   subject,
    //   recipient,
    //   body
    // })
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true
  } catch (error) {
    console.log("Couldnt send")
    // console.error('Error sending email:', error);
    return false
  }
}



// Example usage:
// sendEmail({
//   email: 'zeeshanali@aiesec.net',
//   password: 'dsgb nmnj fnxy bkpo',
//   subject: 'Checking Auto email!',
//   recipient: 'zeeshan.ali.gondal.0007@gmail.com',
//   body: 'This is the body of the email.'
// });

module.exports = sendEmail