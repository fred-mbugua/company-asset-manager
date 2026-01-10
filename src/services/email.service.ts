import nodemailer from 'nodemailer';
import { MAIL_SERVICE, MAIL_USER, MAIL_PASS } from '../config';
import logger from '../utils/logger';

interface SmtpConfig {
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_secure: boolean;
  smtp_user: string | null;
  smtp_password: string | null;
  smtp_from_name: string | null;
  smtp_from_email: string | null;
  app_name?: string;
}

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

  /**
   * Create a dynamic transporter with custom SMTP configuration
   */
  private createDynamicTransporter(config: SmtpConfig) {
    if (!config.smtp_host || !config.smtp_user || !config.smtp_password) {
      throw new Error('SMTP configuration is incomplete. Please configure SMTP host, username, and password.');
    }

    return nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port || 587,
      secure: config.smtp_secure, // true for 465, false for other ports
      auth: {
        user: config.smtp_user,
        pass: config.smtp_password
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
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

  /**
   * Send email using dynamic SMTP configuration from system settings
   */
  async sendEmailWithConfig(to: string, subject: string, text: string, html: string, config: SmtpConfig): Promise<void> {
    const transporter = this.createDynamicTransporter(config);

    const fromName = config.smtp_from_name || config.app_name || 'Asset Management System';
    const fromEmail = config.smtp_from_email || config.smtp_user;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html
    };

    try {
      await transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}`);
    } catch (error: any) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send a test email to verify SMTP configuration
   */
  async sendTestEmail(to: string, config: SmtpConfig): Promise<void> {
    const appName = config.app_name || 'Asset Management System';
    
    await this.sendEmailWithConfig(
      to,
      `Test Email from ${appName}`,
      `Email Configuration Test\n\nThis is a test email from ${appName}.\nIf you received this email, your SMTP configuration is working correctly!`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1abc9c;">Email Configuration Test</h2>
          <p>This is a test email from <strong>${appName}</strong>.</p>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This email was sent automatically to test the email configuration.
          </p>
        </div>
      `,
      config
    );
  }

  /**
   * Send password notification email to a user
   */
  async sendPasswordEmail(
    to: string,
    firstName: string,
    email: string,
    password: string,
    config: SmtpConfig
  ): Promise<void> {
    const appName = config.app_name || 'Asset Management System';
    
    await this.sendEmailWithConfig(
      to,
      `Your ${appName} Account Credentials`,
      `Welcome to ${appName}\n\nDear ${firstName},\n\nYour account has been created.\n\nEmail: ${email}\nTemporary Password: ${password}\n\nPlease login and change your password immediately for security purposes.`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1abc9c;">Welcome to ${appName}</h2>
          <p>Dear ${firstName},</p>
          <p>Your account has been created. Below are your login credentials:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 2px 8px; border-radius: 4px;">${password}</code></p>
          </div>
          <p style="color: #dc3545;"><strong>Important:</strong> Please login and change your password immediately for security purposes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
      config
    );
  }
}

export default new EmailService();