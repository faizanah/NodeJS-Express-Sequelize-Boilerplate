require('dotenv').config();
const nodemailer = require('nodemailer');
const from       = process.env.MAIL_FROM;

function sendMail(mailOptions , cb )
{
    mailOptions.from =  from;
    var smtpTransport = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
    smtpTransport.sendMail(mailOptions, cb);
}
module.exports = {
    sendMail: sendMail
};