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
        console.log("Sent")
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

async function start() {
    for (let i = 0; i < 10000000; i++) {
        try{
            sendEmail({
                email: 'zeeshangondal0007@gmail.com',
                password: 'hkli rzey tnpz xicv',
                subject: 'Test Email Subject',
                recipient: 'abdulmannankhan1000@gmail.com',
                body: 'This is the body of the test email'
            })
            console.log(i+1)
        }catch(e){

        }
    }
}

start()