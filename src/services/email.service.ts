import nodemailer from 'nodemailer';
import { MAIL_SERVICE, MAIL_USER, MAIL_PASS } from '../config';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: MAIL_SERVICE,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string, html: string) {
    const mailOptions = {
      from: `ICT Asset Mgmt <${MAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    return this.transporter.sendMail(mailOptions);
  }
}

export default new EmailService();