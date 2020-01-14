// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'arunchauhan0507@gmail.com',
        subject: 'Thanks for Joining In',
        text: `Welcome to the App, ${name} . Let do the work here`,
      });
}

const sendAccCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'arunchauhan0507@gmail.com',
        subject: 'Account Cancelelation with Task App',
        text: `Account Canceletion mail Mr/Miss, ${name} . Testing`,
      });
}

module.exports = {
    sendWelcomeEmail,
    sendAccCancelEmail
}

