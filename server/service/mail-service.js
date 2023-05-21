const nodeMailer = require("nodemailer");

// https://nodemailer.com/about/
const mailerHost = process.env.MAILER_HOST;
const mailerPort = process.env.MAILER_PORT;
const mailerUser = process.env.MAILER_USER;
const mailerPassword = process.env.MAILER_PASSWORD;
const apiUrl = process.env.API_URL;

class MailService {
  constructor() {
    this.transporter = nodeMailer.createTransport({
      host: mailerHost,
      port: mailerPort,
      secure: false,
      auth: {
        user: mailerUser,
        pass: mailerPassword,
      },
    });
  }

  async sendActivationMail(toUserEmail, link) {
    await this.transporter.sendMail({
      from: mailerUser,
      to: toUserEmail,
      subject: `Активация на ${apiUrl}`,
      text: "",
      html: `
          <div>
            <h1>Для активации перейдите по ссылке</h1>
            <a href="${link}">${link}</a>
          </div>
      
      `,
    });
  }
}

module.exports = new MailService();
