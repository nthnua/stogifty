// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendSignupMail = (recieverMail) => {
  console.log(`Sending email verification link to ${recieverMail}`)
  const msg = {
    to: recieverMail,
    from: process.env.EMAIL_SENDER,
    subject: 'Welcome to stogifty!',
    html: `
    <div>
    <h3>
    Hello 👋 ${recieverMail}, we heartly welcome you to stogifty.<br/>
    </h3>
    <br/>
    <h4>
    Thank you for signing up!
    Now buy your first gift.
    </h4>
    </div>
    `
  }
  return sgMail.send(msg)
}

const sendPasswordResetLink = (recieverMail, token) => {
  console.log(`Sending password reset link to ${recieverMail}`)
  const msg = {
    to: recieverMail,
    from: process.env.EMAIL_SENDER,
    subject: 'Password reset requested',
    html: `
      <div>
      <h4>
      To continue with your password reset request
      <br/>
      <a href=${process.env.HOST_URI}/reset/${token}>Click Here</a>
      </h4>
      If the link is not working, copy and paste the url to your address bar:<br/>
        ${process.env.HOST_URI}/reset/${token}
      </div>
      `
  }
  return sgMail.send(msg)
}
module.exports = {
  sendSignupMail,
  sendPasswordResetLink
}
